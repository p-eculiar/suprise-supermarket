-- Script to fix profiles that are missing emails by copying from auth.users
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND (profiles.email IS NULL OR profiles.email = '')
AND auth_users.email IS NOT NULL;

-- Check how many profiles were updated
GET DIAGNOSTICS affected_rows = ROW_COUNT;
RAISE NOTICE 'Updated % profiles with missing emails', affected_rows;

-- Verify the fix
SELECT 
  p.id,
  p.email as profile_email,
  u.email as auth_email,
  p.full_name,
  CASE 
    WHEN p.email IS NULL OR p.email = '' THEN 'STILL MISSING'
    ELSE 'FIXED'
  END as status
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email IS NULL OR p.email = ''
LIMIT 10;