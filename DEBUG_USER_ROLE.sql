-- Comprehensive debug script to check user roles and profiles
-- 1. Check if user exists in auth.users
SELECT id, email, created_at, email_confirmed_at FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com';

-- 2. Check if profile exists for this user
SELECT id, full_name, role, created_at FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');

-- 3. Check all users and their roles
SELECT u.email, u.email_confirmed_at, p.full_name, p.role 
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 4. Check if there are any admin users
SELECT u.email, p.full_name, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';