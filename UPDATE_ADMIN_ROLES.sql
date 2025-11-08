-- Update admin users to have the correct role
-- This script will set the role to 'admin' for the specified email addresses

-- First, check if the users exist by joining with auth.users
SELECT p.id, u.email, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com');

-- Update the role for these users
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com')
);

-- Verify the update
SELECT p.id, u.email, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com');