-- Recreate Real-Time Publication to Ensure Triggers are Created

-- 1. Drop the existing publication
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 2. Create the publication with proper configuration for real-time
CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages;

-- 3. Set the publication to publish all events
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- 4. Verify the publication was created
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 5. Check which tables are in the publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 6. Refresh the schema cache
NOTIFY pgrst, 'reload schema';