-- Comprehensive script to set up an admin user
-- Replace 'chikwendupeculiar66@gmail.com' with the actual admin email

-- 1. First, check if the user exists
SELECT id, email, created_at, email_confirmed_at FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com';

-- 2. Check if profile exists for this user
SELECT id, full_name, role, created_at FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');

-- 3. If user exists but no profile, create profile
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'chikwendupeculiar66@gmail.com'
AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- 4. Update role to admin for existing profile
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');

-- 5. Verify the update
SELECT u.email, u.email_confirmed_at, p.full_name, p.role 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'chikwendupeculiar66@gmail.com';

-- 6. Check all admin users
SELECT u.email, p.full_name, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';