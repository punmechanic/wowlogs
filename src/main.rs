use std::str::FromStr;

use chrono::NaiveDateTime;
use clap::Parser;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Serialize)]
struct Report {
    events: Vec<Record>,
}

#[derive(clap::Parser, Debug)]
struct App {
    #[arg(
        long,
        help = "Path to the SQLite database file where the report will be stored",
        default_value = "sqlite.db"
    )]
    database_path: String,
    #[command(subcommand)]
    command: Command,
}

#[derive(clap::Subcommand, Debug)]
enum Command {
    Import(ImportCommand),
}

#[derive(clap::Args, Debug)]
struct ImportCommand {
    #[arg(
        help = "Input file containing the WoW combat log",
        required = true,
        default_value = "-"
    )]
    file: String,
}

fn main() {
    let app = App::parse();
    let db = sqlite::open(app.database_path).unwrap_or_else(|e| {
        eprintln!("Failed to open database: {}", e);
        std::process::exit(1);
    });

    match app.command {
        Command::Import(import) => {
            if import.file == "-" {
                let mut report = Report { events: Vec::new() };
                for record in std::io::stdin().lines() {
                    let record: Record = record.unwrap().parse().unwrap();
                    report.events.push(record);
                }
                serde_json::to_writer(std::io::stdout(), &report).unwrap();
            } else {
                eprintln!("The import command only supports reading from stdin at this time.");
                std::process::exit(1);
            }
        }
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
