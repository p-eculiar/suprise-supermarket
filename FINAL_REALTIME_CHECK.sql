-- Final Comprehensive Real-Time Setup Check

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

-- 3. Check real-time triggers on all tables
SELECT 
  'feedback' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass
AND tgname LIKE '%realtime%'

UNION ALL

SELECT 
  'messages' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass
AND tgname LIKE '%realtime%'

UNION ALL

SELECT 
  'orders' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass
AND tgname LIKE '%realtime%';

-- 4. Check WAL level
SHOW wal_level;