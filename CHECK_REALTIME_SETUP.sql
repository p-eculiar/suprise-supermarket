-- Check Complete Real-Time Setup

-- 1. Check if there are any triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass;

-- 2. Check if there are any triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass;

-- 3. Check publication full configuration
SELECT 
  pubname,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 4. Check WAL level (should be 'logical' for real-time to work)
SHOW wal_level;

-- 5. Check if the realtime extension is available
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';