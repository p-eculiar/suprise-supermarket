-- Check Complete Real-Time Setup

-- 1. Check publication configuration
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 2. Check which tables are in the publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass;

-- 4. Check triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass;

-- 5. Check triggers on the orders table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass;

-- 6. Check WAL level (should be 'logical' for real-time to work)
SHOW wal_level;

-- 7. Check if the realtime extension is available
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';