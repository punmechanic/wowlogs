use std::str::FromStr;

use chrono::NaiveDateTime;
use thiserror::Error;

fn main() {
    println!("Hello, world!");
}

/// A raw, unprocessed log record.
#[derive(PartialEq, Debug)]
struct Record {
    timestamp: NaiveDateTime,
}

#[derive(Error, Debug, PartialEq)]
enum RecordParseError {
    #[error("header is malformed")]
    HeaderMalformed,
    #[error("failed to parse timestamp")]
    InvalidTimestamp {
        #[from]
        source: chrono::ParseError,
    },
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
        let (head, _tail) = parts.ok_or(RecordParseError::HeaderMalformed)?;
        let ts = Self::parse_timestamp(head)?;

        Ok(Record { timestamp: ts })
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
            assert_eq!(res, Err(RecordParseError::HeaderMalformed));
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

        Ok(())
    }
}
