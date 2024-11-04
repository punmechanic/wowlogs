use chrono::NaiveDateTime;

fn main() {
    println!("Hello, world!");
}

/// A raw, unprocessed log record.
struct Record {
    timestamp: NaiveDateTime,
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

impl TryFrom<&str> for Record {
    type Error = ();

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let mut parts = value.split("  ");
        // TODO: Replace unwrap
        let header = parts.next().unwrap();
        let ts = Self::parse_timestamp(header).unwrap();

        Ok(Record { timestamp: ts })
    }
}

#[cfg(test)]
mod tests {
    use chrono::{NaiveDate, NaiveTime};

    use crate::Record;

    #[test]
    fn can_parse_timestamp_pacific() -> Result<(), chrono::ParseError> {
        let raw = "10/2/2024 17:36:02.460-7";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn can_parse_timestamp_bst() -> Result<(), chrono::ParseError> {
        let raw = "10/2/2024 17:36:02.460+1";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn can_parse_timestamp_utc() -> Result<(), chrono::ParseError> {
        let raw = "10/2/2024 17:36:02.460+0";
        let ts = Record::parse_timestamp(raw)?;
        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 36, 2, 460).unwrap();
        assert_eq!(ts.date(), date);
        assert_eq!(ts.time(), time);

        Ok(())
    }

    #[test]
    fn can_parse_record() {
        let entry = "10/2/2024 17:34:00.153-7  COMBAT_LOG_VERSION,21,ADVANCED_LOG_ENABLED,1,BUILD_VERSION,11.0.2,PROJECT_ID,1";
        let record: Record = entry.try_into().unwrap();

        let date = NaiveDate::from_ymd_opt(2024, 10, 2).unwrap();
        let time = NaiveTime::from_hms_milli_opt(17, 34, 0, 153).unwrap();
        let dt = date.and_time(time);
        assert_eq!(record.timestamp, dt);
    }
}
