-- Verify that RLS policies are correctly set up for notifications table

-- 1. Check if RLS is enabled
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'notifications';

-- 2. List all policies on notifications table
SELECT 
    polname AS policy_name,
    polcmd AS command,
    polroles AS roles,
    polqual AS using_clause,
    polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'notifications'::regclass
ORDER BY polname;

-- 3. Check if the current user can update notifications
-- (This would need to be run as the actual authenticated user)

-- 4. Test a simple update to see if it works
-- First, let's see if there are any notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- 5. Check a specific notification (replace with actual ID if you have one)
-- SELECT * FROM notifications LIMIT 1;

-- 6. Check the profiles table structure to verify role column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name IN ('id', 'role');

-- 7. Check if there are any admins in the profiles table
SELECT id, email, role FROM profiles WHERE role = 'admin' LIMIT 5;