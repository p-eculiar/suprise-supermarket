-- Check existing RLS policies on the orders table
SELECT 
    polname AS policy_name,
    polcmd AS command,
    polroles AS roles,
    polqual AS using_clause,
    polwithcheck AS with_check_clause
FROM pg_policy
WHERE polrelid = 'orders'::regclass
ORDER BY polname;

-- Check if RLS is enabled on the orders table
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'orders';

-- Check the structure of the profiles table to understand user roles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('id', 'role');

-- Check if there are any admins in the profiles table
SELECT id, email, role FROM profiles WHERE role = 'admin' LIMIT 5;