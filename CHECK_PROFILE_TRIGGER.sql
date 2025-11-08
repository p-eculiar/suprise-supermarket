-- Check if the trigger function exists
SELECT proname, probin, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check if the trigger is attached to auth.users
SELECT tgname, tgtype, tgdefinition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname = 'users' AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'auth');

-- Check if the profiles table has the correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;