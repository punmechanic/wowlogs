-- Refer to https://warcraft.wiki.gg/wiki/COMBAT_LOG_EVENT for these fields.
-- These fields are not present on every event.

ALTER TABLE events ADD COLUMN `source_guid` TEXT GENERATED ALWAYS AS (fields->>'$[1]');
ALTER TABLE events ADD COLUMN `source_name` TEXT GENERATED ALWAYS AS (fields->>'$[2]');
ALTER TABLE events ADD COLUMN `source_flags` TEXT GENERATED ALWAYS AS (fields->>'$[3]');
ALTER TABLE events ADD COLUMN `source_raid_flags` TEXT GENERATED ALWAYS AS (fields->>'$[4]');
ALTER TABLE events ADD COLUMN `dest_guid` TEXT GENERATED ALWAYS AS (fields->>'$[5]');
ALTER TABLE events ADD COLUMN `dest_name` TEXT GENERATED ALWAYS AS (fields->>'$[6]');
ALTER TABLE events ADD COLUMN `dest_flags` TEXT GENERATED ALWAYS AS (fields->>'$[7]');
ALTER TABLE events ADD COLUMN `dest_raid_flags` TEXT GENERATED ALWAYS AS (fields->>'$[8]');

CREATE VIEW spell_casts AS
	SELECT
        events.id AS event_id,
		events.type,
		events.fk_log_id,
		events.timestamp,
		events.source_guid,
		events.source_name,
		events.source_flags,
		events.source_raid_flags,
		events.dest_guid,
		events.dest_name,
		events.dest_flags,
		events.dest_raid_flags,
		-- These are SPELL_CAST_* specific fields.
		events.fields->>'$[9]' AS spell_id,
		events.fields->>'$[10]' AS spell_name,
		events.fields->>'$[11]' AS spell_school
	FROM events
	WHERE events.`type` IN ('SPELL_CAST_SUCCESS', 'SPELL_CAST_START', 'SPELL_CAST_FAILED')
	ORDER BY events.timestamp;
