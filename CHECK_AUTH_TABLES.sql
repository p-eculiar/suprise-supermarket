-- Check what authentication-related tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
AND table_type = 'BASE TABLE';

-- Check what tables exist in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name ILIKE '%user%' OR table_name ILIKE '%profile%';

-- Check the structure of the profiles table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check a few sample records from profiles
SELECT * FROM profiles LIMIT 3;