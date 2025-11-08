-- Check Admin Access for Real-Time Data

-- 1. Check if there are admin users
SELECT 
  p.id as profile_id,
  u.email,
  p.role,
  p.full_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin'
LIMIT 5;

-- 2. Check the current user's role (replace 'CURRENT_USER_ID' with the actual user ID)
-- SELECT id, role FROM profiles WHERE id = 'CURRENT_USER_ID';

-- 3. Test if admin can see feedback records
-- Replace 'ADMIN_USER_ID' with an actual admin user ID
SELECT 
  f.id,
  f.user_id,
  f.rating,
  f.category,
  f.message,
  f.admin_response,
  f.created_at,
  p.email as user_email,
  p.full_name as user_name
FROM feedback f
LEFT JOIN profiles p ON f.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = 'ADMIN_USER_ID' 
  AND profiles.role = 'admin'
)
LIMIT 5;

-- 4. Test if admin can see messages records
-- Replace 'ADMIN_USER_ID' with an actual admin user ID
SELECT 
  m.id,
  m.user_id,
  m.subject,
  m.message,
  m.admin_response,
  m.status,
  m.created_at,
  m.responded_at,
  p.email as user_email,
  p.full_name as user_name
FROM messages m
LEFT JOIN profiles p ON m.user_id = p.id
WHERE EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = 'ADMIN_USER_ID' 
  AND profiles.role = 'admin'
)
LIMIT 5;

-- 5. Check RLS policies on feedback table
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

-- 6. Check RLS policies on messages table
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

-- 7. Test a specific query that the admin dashboard might be using
-- Replace 'ADMIN_USER_ID' with an actual admin user ID
SELECT 
  *,
  user:profiles(email, full_name)
FROM feedback
ORDER BY created_at DESC
LIMIT 5;

-- 8. Test the same query for messages
-- Replace 'ADMIN_USER_ID' with an actual admin user ID
SELECT 
  *,
  user:profiles(email, full_name)
FROM messages
ORDER BY created_at DESC
LIMIT 5;