-- Recreate Publication and Refresh

-- Drop existing publication
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Recreate publication with all tables
CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages, orders;

-- Set publication to publish all events
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- Force refresh of the publication
SELECT pg_notify('reload', 'schema');

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';