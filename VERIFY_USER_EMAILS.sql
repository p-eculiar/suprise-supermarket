-- Verify that user emails are correctly stored in the profiles table
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  u.email as auth_email
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;