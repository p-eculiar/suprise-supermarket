-- Fix Real-Time Triggers and Publication

-- 1. Check current publication configuration
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

-- 3. Check if there are triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text = 'feedback';

-- 4. Check if there are triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text = 'messages';

-- 5. Ensure the publication is configured for all events
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- 6. If triggers are missing, we need to recreate the publication
-- First, check if the realtime extension functions exist
SELECT proname FROM pg_proc WHERE proname LIKE 'supabase_%' LIMIT 5;

-- 7. Refresh the publication to ensure triggers are created
-- This command should recreate the necessary triggers
DO $$
BEGIN
  -- Refresh the publication
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Drop and recreate the publication to ensure proper trigger creation
    DROP PUBLICATION IF EXISTS supabase_realtime;
  END IF;
  
  -- Create the publication with proper configuration
  CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages;
  
  RAISE NOTICE 'Recreated supabase_realtime publication for feedback and messages tables';
END $$;

-- 8. Verify the publication was created
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 9. Check triggers again after recreation
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid::regclass::text IN ('feedback', 'messages')
ORDER BY tgrelid::regclass::text, tgname;

-- 10. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 11. Check if WAL level is set correctly
SHOW wal_level;

-- 12. Check replication settings
SHOW max_replication_slots;
SHOW max_wal_senders;