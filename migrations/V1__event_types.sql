ALTER TABLE events ADD COLUMN `type` TEXT GENERATED ALWAYS AS (fields->>'$[0]');
