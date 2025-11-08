-- Verify that the email column has been added and populated
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

-- Check how many profiles have emails now
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(CASE WHEN email IS NULL THEN 1 END) as profiles_without_email
FROM profiles;