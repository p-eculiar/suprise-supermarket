-- Verify and Fix Real-Time Publication Configuration

-- Check if the supabase_realtime publication exists
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- Check which tables are in the supabase_realtime publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- If the publication doesn't exist or doesn't include our tables, fix it
DO $$
BEGIN
  -- Check if publication exists
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Create the publication
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
    RAISE NOTICE 'Created supabase_realtime publication for all tables';
  ELSE
    -- Check if our tables are in the publication
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'feedback'
    ) THEN
      -- Add feedback table to publication
      ALTER PUBLICATION supabase_realtime ADD TABLE feedback;
      RAISE NOTICE 'Added feedback table to supabase_realtime publication';
    END IF;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN
      -- Add messages table to publication
      ALTER PUBLICATION supabase_realtime ADD TABLE messages;
      RAISE NOTICE 'Added messages table to supabase_realtime publication';
    END IF;
  END IF;
END $$;

-- Verify the publication configuration after changes
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- Verify which tables are in the supabase_realtime publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Check if the realtime extension is installed
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';

-- Check current database settings related to replication
SELECT 
  name,
  setting,
  short_desc
FROM pg_settings 
WHERE name LIKE '%repl%'
OR name LIKE '%wal%'
OR name LIKE '%publish%'
ORDER BY name;