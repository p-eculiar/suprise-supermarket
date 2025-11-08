-- Check if avatar_url exists in profiles table and see sample data
SELECT 
  id,
  full_name,
  email,
  avatar_url,
  role,
  created_at
FROM profiles
LIMIT 5;

-- Check the column definition
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'avatar_url';
