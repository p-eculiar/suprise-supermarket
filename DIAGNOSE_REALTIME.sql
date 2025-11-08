-- Diagnose real-time functionality issues

-- 1. Check if required extensions are installed
SELECT * FROM pg_extension;

-- 2. Check if realtime schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'realtime';

-- 3. Check if realtime publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 4. Check if feedback and messages tables are in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('feedback', 'messages');

-- 5. Check if the tables have the correct structure for real-time
SELECT 
  c.relname as table_name,
  a.attname as column_name,
  t.typname as data_type
FROM pg_class c
JOIN pg_attribute a ON a.attrelid = c.oid
JOIN pg_type t ON t.oid = a.atttypid
WHERE c.relname IN ('feedback', 'messages')
AND a.attnum > 0
ORDER BY c.relname, a.attnum;

-- 6. Check if RLS is properly configured
SELECT 
  tablename,
  relrowsecurity as rls_enabled,
  relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('feedback', 'messages')
AND n.nspname = 'public';

-- 7. Check existing policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname IN ('feedback', 'messages');

-- 8. Check if there are any triggers on the tables
SELECT 
  tgname,
  tgrelid::regclass as table_name,
  tgfoid::regproc as function_name,
  tgtype
FROM pg_trigger
WHERE tgrelid::regclass::text IN ('feedback', 'messages');