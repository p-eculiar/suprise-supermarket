-- Comprehensive check for admin user
-- 1. Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com';

-- 2. Check if profile exists
SELECT id, full_name, role FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');

-- 3. Update role to admin if not already
UPDATE profiles 
SET role = 'admin'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com')
AND role != 'admin';

-- 4. Verify the update
SELECT p.id, u.email, p.full_name, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'chikwendupeculiar66@gmail.com';