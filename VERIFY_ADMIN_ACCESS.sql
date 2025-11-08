-- Verify that the admin users can access admin-only data
-- This query simulates the RLS policy check for admin access

SELECT 
  u.id,
  u.email,
  p.role,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM profiles WHERE id = u.id AND role = 'admin'
    ) THEN 'HAS_ADMIN_ACCESS'
    ELSE 'NO_ADMIN_ACCESS'
  END as admin_access_status
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com');