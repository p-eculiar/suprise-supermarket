-- Check Real-Time Configuration Details

-- 1. Check if the supabase_realtime publication exists and its configuration
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 2. Check which tables are specifically in the supabase_realtime publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check if RLS is enabled on feedback and messages tables
SELECT 
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('feedback', 'messages')
AND n.nspname = 'public';

-- 4. Check existing policies on feedback table
SELECT 
  polname as policy_name,
  polpermissive as permissive,
  polroles as roles,
  polcmd as command,
  polqual as using_clause,
  polwithcheck as with_check_clause
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'feedback'
ORDER BY polcmd;

-- 5. Check existing policies on messages table
SELECT 
  polname as policy_name,
  polpermissive as permissive,
  polroles as roles,
  polcmd as command,
  polqual as using_clause,
  polwithcheck as with_check_clause
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'messages'
ORDER BY polcmd;

-- 6. Check the structure of feedback table to ensure it matches frontend expectations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- 7. Check the structure of messages table to ensure it matches frontend expectations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 8. Check if there are any rows in the tables and their recent data
SELECT 
  'feedback' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour_count
FROM feedback
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 hour' THEN 1 END) as last_hour_count
FROM messages;

-- 9. Check the latest records in feedback table
SELECT 
  id,
  user_id,
  rating,
  category,
  message,
  admin_response,
  created_at
FROM feedback
ORDER BY created_at DESC
LIMIT 3;

-- 10. Check the latest records in messages table
SELECT 
  id,
  user_id,
  subject,
  message,
  admin_response,
  status,
  created_at,
  responded_at
FROM messages
ORDER BY created_at DESC
LIMIT 3;

-- 11. Check if the profiles table has the expected structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 12. Check if there are admin users
SELECT 
  p.id,
  p.role,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin'
LIMIT 5;

-- 13. Check if the realtime extension is properly installed
SELECT 
  name,
  default_version,
  installed_version
FROM pg_available_extensions 
WHERE name = 'supabase_realtime';