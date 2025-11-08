-- Check database structure to understand the issue

-- Check if auth schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'auth';

-- Check if users table exists in public schema
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'users';

-- Check if users table exists in auth schema
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'users' AND table_schema = 'auth';

-- Check current user and permissions
SELECT current_user, current_schema(), session_user;

-- Check if we can access auth.users
SELECT COUNT(*) FROM auth.users LIMIT 1;

-- Check if we can access public.users
SELECT COUNT(*) FROM users LIMIT 1;