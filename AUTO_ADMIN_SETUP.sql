-- Script to automatically make the first registered user an admin
-- This should be run after the first user registers and verifies their email

-- Check if there are any admins already
WITH admin_count AS (
  SELECT COUNT(*) as admin_users
  FROM profiles 
  WHERE role = 'admin'
)
-- If no admins exist, make the first user an admin
UPDATE profiles 
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM profiles 
  ORDER BY created_at ASC 
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 
  FROM profiles 
  WHERE role = 'admin'
);

-- Script to set up admin emails for role-based authentication
-- This script is for documentation purposes only
-- Admin roles are now determined by email addresses listed in environment variables

-- Example of how to manually set an admin user (if needed)
-- UPDATE profiles 
-- SET role = 'admin'
-- WHERE email = 'admin@example.com';

-- Add a comment for documentation
COMMENT ON COLUMN profiles.role IS 'User role: customer, admin, or vendor. Role is determined by email address matching env variables.';