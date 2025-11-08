-- Debug query to check what's actually in the profiles table
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

-- Also check if there are any NULL or empty emails
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as profiles_without_email
FROM profiles;

-- Check the auth.users table to see if emails are stored there
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;