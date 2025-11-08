-- Check existing policies on the notifications table
SELECT 
    polname AS policy_name,
    polcmd AS command,
    polroles AS roles,
    polqual AS using_clause,
    polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'notifications'::regclass;

-- Check if RLS is enabled on the notifications table
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'notifications';

-- Check current user permissions
SELECT 
    rolname AS role_name,
    rolsuper AS is_superuser,
    rolcreatedb AS can_create_db,
    rolcreaterole AS can_create_role
FROM pg_roles
WHERE rolname = CURRENT_USER;