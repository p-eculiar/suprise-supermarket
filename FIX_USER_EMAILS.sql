-- Simple fix to populate any missing emails in profiles table
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL
AND auth_users.email IS NOT NULL;

-- Check the result
SELECT 
  p.id,
  p.email as profile_email,
  u.email as auth_email,
  p.full_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IS NULL
LIMIT 5;