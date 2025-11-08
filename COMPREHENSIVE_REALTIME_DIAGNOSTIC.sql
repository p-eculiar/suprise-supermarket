-- Comprehensive Real-Time Diagnostic Script

-- 1. Check if the database has the realtime extension
SELECT name, default_version, installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';

-- 2. Check if realtime schema exists
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name = 'realtime';

-- 3. Check if the supabase_realtime publication exists
SELECT pubname, puballtables, pubinsert, pubupdate, pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 4. Check if feedback and messages tables are in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('feedback', 'messages');

-- 5. Check if RLS is enabled on both tables
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('feedback', 'messages')
AND n.nspname = 'public';

-- 6. Check existing policies on both tables
SELECT 
  polname as policy_name,
  relname as table_name,
  polpermissive as permissive,
  polroles as roles,
  polcmd as command
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname IN ('feedback', 'messages');

-- 7. Check if there are any triggers on the tables
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype as trigger_type
FROM pg_trigger
WHERE tgrelid::regclass::text IN ('feedback', 'messages');

-- 8. Check the structure of both tables
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('feedback', 'messages')
ORDER BY table_name, ordinal_position;

-- 9. Check if the realtime publication is listening to the correct events
SELECT 
  pubname,
  array_agg(ev) as events
FROM (
  SELECT 
    pubname,
    unnest(array[
      CASE WHEN pubinsert THEN 'INSERT' END,
      CASE WHEN pubupdate THEN 'UPDATE' END,
      CASE WHEN pubdelete THEN 'DELETE' END
    ]) as ev
  FROM pg_publication
  WHERE pubname = 'supabase_realtime'
) s 
WHERE ev IS NOT NULL
GROUP BY pubname;

-- 10. Check if there are any rows in the tables
SELECT 'feedback' as table_name, COUNT(*) as row_count FROM feedback
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages;

-- 11. Check if the profiles table exists and has the correct structure
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 12. Check if there are any users in the auth.users table
SELECT COUNT(*) as user_count FROM auth.users;

-- 13. Check if the profiles table has data
SELECT COUNT(*) as profile_count FROM profiles;

-- 14. Check if there are any admin users
SELECT COUNT(*) as admin_count 
FROM profiles 
WHERE role = 'admin';

-- 15. Check the current database settings related to replication
SELECT name, setting, short_desc 
FROM pg_settings 
WHERE name LIKE '%repl%'
OR name LIKE '%wal%'
OR name LIKE '%publish%'
ORDER BY name;