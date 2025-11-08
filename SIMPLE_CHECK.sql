-- Simple check to see what's in the profiles table
SELECT * FROM profiles LIMIT 5;

-- Check what's in auth.users
SELECT id, email FROM auth.users LIMIT 5;

-- Try to join them to see emails
SELECT 
  p.id,
  p.email as profile_email,
  u.email as auth_email,
  p.full_name
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LIMIT 10;