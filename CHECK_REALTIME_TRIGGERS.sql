-- Check Real-Time Triggers and Event System

-- 1. Check if there are triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text = 'feedback';

-- 2. Check if there are triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text = 'messages';

-- 3. Check publication configuration
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 4. Check which tables are in the publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 5. Check for any realtime-related functions
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc
WHERE proname LIKE '%realtime%'
OR proname LIKE '%supabase%'
LIMIT 10;

-- 6. Check if the wal2json extension is available (used by Supabase realtime)
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'wal2json';

-- 7. Check if there are any active replication slots
SELECT 
  slot_name,
  plugin,
  slot_type,
  active,
  restart_lsn,
  confirmed_flush_lsn
FROM pg_replication_slots;

-- 8. Check if there are any active WAL senders
SELECT 
  pid,
  state,
  sync_state,
  client_addr,
  sent_lsn,
  write_lsn,
  flush_lsn,
  replay_lsn
FROM pg_stat_replication;

-- 9. Check if the database is in the correct WAL level
SHOW wal_level;

-- 10. Check if logical replication is enabled
SHOW max_replication_slots;

-- 11. Check if there are enough WAL senders
SHOW max_wal_senders;

