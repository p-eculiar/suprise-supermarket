-- Fix admin permissions for accessing auth.users table

-- First, let's check if there are any existing policies on auth.users
-- Note: We can't modify policies on auth.users directly as it's a protected table
-- Instead, we'll ensure the admin user has the proper role

-- Check current admin users
SELECT id, email, raw_app_meta_data->>'role' as role 
FROM auth.users 
WHERE raw_app_meta_data->>'role' = 'admin';

-- If no admin users are found, you can make a user an admin by running:
-- UPDATE auth.users 
-- SET raw_app_meta_data = jsonb_set(raw_app_meta_data, '{role}', '"admin"')
-- WHERE email = 'your-admin-email@example.com';

-- For the profiles table, we've already fixed the policies in FIX_PROFILES_POLICIES.sql
-- Let's verify that the profiles table policies are correctly set up:

-- Check current policies on profiles table
SELECT polname FROM pg_policy WHERE polrelid = 'profiles'::regclass;

-- If the policies are not correctly set, run the FIX_PROFILES_POLICIES.sql script