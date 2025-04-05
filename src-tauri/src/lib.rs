use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};
use std::{fs::File, io::BufRead, io::BufReader, str::FromStr};
use tauri::{App, Runtime};
use tauri_plugin_cli::CliExt;
use thiserror::Error;

fn setup<R: Runtime>(app: &mut App<R>) -> Result<(), Box<dyn std::error::Error>> {
    if cfg!(debug_assertions) {
        app.handle().plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )?;
    }

    let matches = app.cli().matches().unwrap();
    let db_path = matches
        .args
        .get("database_path")
        .map(|x| x.value.as_str())
        .unwrap_or(None)
        .unwrap_or("sqlite.db");

    let mut db = rusqlite::Connection::open(db_path).unwrap_or_else(|e| {
        eprintln!("Failed to open database: {}", e);
        std::process::exit(1);
    });

    migrations::run(&mut db).unwrap();
    if let Some(x) = matches.subcommand {
        if x.name == "import" {
            let mut report = Report { events: Vec::new() };
            // TODO: Consolidate
            match matches.args.get("file") {
                Some(file) if file.value == "-" => {
                    for record in std::io::stdin().lines() {
                        let record: Record = record.unwrap().parse().unwrap();
                        report.events.push(record);
                    }
                }
                Some(file) => {
                    let path = file.value.as_str().unwrap();
                    let file = File::open(path).unwrap();
                    for record in BufReader::new(file).lines() {
                        let record: Record = record.unwrap().parse().unwrap();
                        report.events.push(record);
                    }
                }
                None => {
                    for record in std::io::stdin().lines() {
                        let record: Record = record.unwrap().parse().unwrap();
                        report.events.push(record);
                    }
                }
            };

            report.save(&mut db).unwrap_or_else(|e| {
                eprintln!("Failed to save report to database: {}", e);
                std::process::exit(1);
            });
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(setup)
        .plugin(tauri_plugin_cli::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod migrations;

#[derive(Serialize)]
struct Report {
    events: Vec<Record>,
}

impl Report {
    fn save(self, db: &mut rusqlite::Connection) -> anyhow::Result<()> {
        let tx = db.transaction()?;
        tx.execute("INSERT INTO logs DEFAULT VALUES;", rusqlite::params![])?;

        let pk: u64 = tx.query_row(
            "SELECT id FROM logs WHERE rowid = ?1;",
            rusqlite::params![tx.last_insert_rowid()],
            |row| row.get(0),
        )?;

        for event in &self.events {
            event.save_transaction(&tx, pk)?;
        }

        tx.commit()?;

        Ok(())
    }
}

impl Record {
    fn save_transaction(&self, tx: &rusqlite::Transaction, log_id: u64) -> anyhow::Result<()> {
        // Insert the record into the events table.
        tx.execute(
            "INSERT INTO events (`timestamp`, fields, `fk_log_id`) VALUES (?1, ?2, ?3)",
            rusqlite::params![self.timestamp, serde_json::to_string(&self.fields)?, log_id],
        )?;

        Ok(())
    }
}

/// An unprocessed log record.
///
/// The only processing done to Records is to separate and parse the timestamp from the fields.
#[derive(Debug, Deserialize, Serialize)]
struct Record {
    timestamp: NaiveDateTime,
    fields: Vec<String>,
}

#[derive(Error, Debug)]
enum RecordParseError {
    #[error("header is malformed")]
    HeaderMalformed,
    #[error("failed to parse timestamp")]
    InvalidTimestamp {
        #[from]
        source: chrono::ParseError,
    },
    #[error("bad fields format")]
    InvalidFieldsFormat {
        #[from]
        source: csv::Error,
    },
    #[error("missing fields")]
    NoRecords,
}

impl Record {
    // Parses a timestamp in teh format `10/2/2024 17:36:02.460-7`.
    //
    // The timezone offset (-7) is not retained.
    fn parse_timestamp(sub: &str) -> Result<NaiveDateTime, chrono::ParseError> {
        // WoW adds timezone information to the timestamp but not in a way that strptime will accept it;
        // Chrono requires timeszones be padded to two digits, but WoW's timezones are not padded.
        // To avoid a headache we will skip them for now and will allow other parts of the application to infer the timezone.
        //
        // This might cause issues if a user loads a report created in a different timezone (i.e, one created before daylights savings time takes place).
        let ts = if let Some(index) = sub.find(|c: char| c == '-' || c == '+') {
            &sub[0..index]
        } else {
            sub
        };

        NaiveDateTime::parse_from_str(ts, "%-m/%-d/%Y %H:%M:%S%.3f")
    }
}

impl FromStr for Record {
    type Err = RecordParseError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let parts = s.split_once("  ");
        let (head, tail) = parts.ok_or(RecordParseError::HeaderMalformed)?;
        let ts = Self::parse_timestamp(head)?;

        let reader = csv::ReaderBuilder::new()
            .flexible(true)
            .double_quote(true)
            .has_headers(false)
            .from_reader(tail.as_bytes());

        // Because we are reading only a single log record, it is an error if the CSV reader has more than one row.
        // We will silently ignore extra rows.
        //
        // This is inefficient and should be refactored later.
        let row = reader
            .into_records()
            .next()
            .ok_or(RecordParseError::NoRecords)??;

        let fields = row.into_iter().map(|x| x.to_string()).collect();
        Ok(Record {
            timestamp: ts,
            fields,
        })
    }
}

#[cfg(test)]
mod tests {
    use chrono::{NaiveDate, NaiveTime};

    use crate::{Record, RecordParseError};

    #[test]
    fn parse_timestamp_pacific() -> Result<(), RecordParseError> {
        let raw = "10/2/2024 17:36:02.460-7";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn parse_timestamp_bst() -> Result<(), RecordParseError> {
        let raw = "10/2/2024 17:36:02.460+1";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn parse_timestamp_utc() -> Result<(), RecordParseError> {
        let raw = "10/2/2024 17:36:02.460+0";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn parse_error_on_malformed_header() -> Result<(), RecordParseError> {
        let bad_headers = [
            // Missing two spaces between timestamp and rest of content
            "10/2/2024 17:34:00.153-7 COMBAT_LOG_VERSION,21,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,11.0.2,PROJECT_ID,1",
        ];

        for header in bad_headers {
            let res: Result<Record, RecordParseError> = header.parse();
            assert!(matches!(res, Err(RecordParseError::HeaderMalformed)));
        }

        Ok(())
    }

    #[test]
    fn parse() -> Result<(), RecordParseError> {
        let entry = "10/2/2024 17:34:00.153-7  COMBAT_LOG_VERSION,21,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,11.0.2,PROJECT_ID,1";
        let record: Record = entry.parse()?;

        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 34, 0, 153).unwrap();
        let dt = date.and_time(time);
        assert_eq!(record.timestamp, dt);
        assert_eq!(
            record.fields,
            [
                "COMBAT_LOG_VERSION",
                "21",
                "ADVANCED_LOG_ENABLED",
                "1",
                "BUILD_VERSION",
                "11.0.2",
                "PROJECT_ID",
                "1"
            ]
        );

        Ok(())
    }
}
