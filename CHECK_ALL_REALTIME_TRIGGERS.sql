-- Check All Real-Time Triggers for Complete Setup

-- 1. Check triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass;

-- 2. Check triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass;

-- 3. Check triggers on the orders table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass;

-- 4. Check publication configuration
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

-- 6. Check WAL level (should be 'logical' for real-time to work)
SHOW wal_level;

-- 7. Check if the realtime extension is available
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';

-- 8. If any tables are missing from the publication, add them
-- ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 9. Refresh the schema cache
NOTIFY pgrst, 'reload schema';