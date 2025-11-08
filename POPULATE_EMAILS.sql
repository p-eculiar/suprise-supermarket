-- Populate the email column with data from auth.users
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL
AND auth_users.email IS NOT NULL;

-- Verify the update
SELECT 
  id,
  email,
  full_name
FROM profiles
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;