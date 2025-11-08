-- Simple query to check what's actually in the profiles table
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Check if there are any profiles with missing emails
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(CASE WHEN email IS NULL THEN 1 END) as profiles_without_email
FROM profiles;