# Admin User Setup Guide

## Overview
This guide explains how to properly set up admin users in your Suprise Supermarket application.

## Prerequisites
1. You have a user account registered in the application
2. You have access to your Supabase SQL Editor

## Setting Up an Admin User

### Step 1: Verify User Exists
First, check if the user exists in your database:

```sql
-- Check if user exists in auth.users
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'chikwendupeculiar66@gmail.com';
```

### Step 2: Check User Profile
Verify that the user has a profile entry:

```sql
-- Check if profile exists for this user
SELECT id, full_name, role, created_at 
FROM profiles 
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');
```

### Step 3: Create Profile (if missing)
If the user exists but doesn't have a profile, create one:

```sql
-- Create profile for existing user
INSERT INTO profiles (id, full_name, role)
SELECT id, 'Admin User', 'admin'
FROM auth.users
WHERE email = 'chikwendupeculiar66@gmail.com'
AND id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;
```

### Step 4: Update Role to Admin
Set the user's role to admin:

```sql
-- Update role to admin for existing profile
UPDATE profiles 
SET role = 'admin', full_name = 'Admin User'
WHERE id IN (SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com');
```

### Step 5: Verify the Update
Confirm that the user now has admin role:

```sql
-- Verify the update
SELECT u.email, u.email_confirmed_at, p.full_name, p.role 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'chikwendupeculiar66@gmail.com';
```

## Bulk Admin Setup
To set up multiple admin users at once:

```sql
-- Update roles for multiple admin users
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com')
);
```

## Troubleshooting

### Issue: User is still directed to user dashboard
1. Run the verification query from Step 5 above
2. Confirm that the user's role is set to 'admin'
3. Clear your browser cache and cookies
4. Log out and log back in

### Issue: User doesn't exist in database
1. Register the user through the normal signup process
2. Complete the email verification process
3. Then follow the steps above to set the role to admin

### Issue: Profile doesn't exist
1. Run the profile creation query from Step 3
2. Then follow Step 4 to update the role

## Important Notes
- The user must complete the email verification process during signup before being set as admin
- The role check happens in real-time when the user logs in
- Profile information is cached in the application context and refreshed on login