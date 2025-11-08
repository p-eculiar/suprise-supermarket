# Complete Setup Guide

## Overview
This guide provides step-by-step instructions to set up your Suprise Supermarket application with all required database tables and configurations.

## Prerequisites
1. Access to your Supabase project dashboard
2. Basic understanding of SQL
3. All application code is deployed

## Database Setup Steps

### Step 1: Run the Main Database Schema
First, ensure your main database schema is set up:
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run [supabase/schema.sql](file:///c:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/supabase/schema.sql) or [COMPLETE_DATABASE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/COMPLETE_DATABASE_SETUP.sql)

### Step 2: Add Missing Columns to Products Table
Run the script to add missing columns to the products table:
1. In the Supabase SQL Editor, open [ADD_MISSING_COLUMNS.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ADD_MISSING_COLUMNS.sql)
2. Execute the entire script

This will add:
- `is_featured` (BOOLEAN)
- `is_bestseller` (BOOLEAN)
- `rating` (NUMERIC)
- `discount` (NUMERIC)
- Create the `wishlist` table with proper RLS policies

### Step 3: Set Up Orders and Payment Tables
Run the orders and payment tables setup:
1. In the Supabase SQL Editor, open [ORDERS_TABLE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ORDERS_TABLE_SETUP.sql)
2. Execute the entire script

This will create:
- `payment_transactions` table
- Proper indexes for performance
- Row Level Security policies
- Required functions and triggers

### Step 4: Set Up Storage Buckets
Run the storage setup to create buckets for avatars and product images:
1. In the Supabase SQL Editor, open [STORAGE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/STORAGE_SETUP.sql)
2. Execute the entire script

This will create:
- `user-uploads` bucket for avatars
- `product-images` bucket for product images
- Proper RLS policies for both buckets

### Step 5: Set Up Admin Users
To properly configure admin users:
1. Register the user through the normal signup process
2. Verify their email address
3. In the Supabase SQL Editor, run [SETUP_ADMIN_USER.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/SETUP_ADMIN_USER.sql)

This script will:
- Check if the user exists
- Create a profile if missing
- Set the user's role to 'admin'
- Verify the update was successful

## Handling Policy Conflicts

If you encounter errors about policies already existing, the updated SQL scripts now include `DROP POLICY IF EXISTS` statements to handle these conflicts automatically. The scripts will:

1. Drop existing policies before creating new ones
2. Avoid conflicts with existing policy names
3. Ensure proper policy configuration

## Verification Steps

### Verify Products Table
After running [ADD_MISSING_COLUMNS.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ADD_MISSING_COLUMNS.sql), verify the products table:

```sql
-- Check that the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('is_featured', 'is_bestseller', 'rating', 'discount');
```

### Verify Payment Tables
After running [ORDERS_TABLE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ORDERS_TABLE_SETUP.sql), verify the payment tables:

```sql
-- Check that payment_transactions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'payment_transactions';
```

### Verify Storage Buckets
After running [STORAGE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/STORAGE_SETUP.sql), verify the storage buckets:

```sql
-- Check that storage buckets exist
SELECT id, name, public 
FROM storage.buckets 
WHERE id IN ('user-uploads', 'product-images');
```

### Verify Admin Users
After running [SETUP_ADMIN_USER.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/SETUP_ADMIN_USER.sql), verify the admin setup:

```sql
-- Check that the user has admin role
SELECT u.email, p.full_name, p.role 
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com');
```

## Testing the Application

### 1. Login Functionality
- Test logging in with both verified and unverified accounts
- Verify that no email verification is required after initial signup

### 2. User Dashboard
- Log in as a regular user
- Navigate to the dashboard
- Verify that products are loading correctly
- Check that the invoice section works properly

### 3. Admin Dashboard
- Log in as an admin user
- Navigate to `/admin`
- Verify that you have access to admin features
- Test the logout functionality

### 4. Customization Page
- Log in as any user
- Go to the customization page (`/dashboard/customization`)
- Update profile information (name, phone, address, etc.)
- Save changes
- Navigate to other parts of the application
- Verify that all updated information is displayed correctly

### 5. Payment History
- Make a test order (if possible)
- Go to the payment page (`/dashboard/payment`)
- Verify that transactions are displayed
- Test the receipt download functionality

## Troubleshooting

### Issue: "Policy already exists" errors
1. Use the updated SQL scripts which include `DROP POLICY IF EXISTS` statements
2. Run the scripts in the exact order specified above
3. If errors persist, manually drop conflicting policies before running the scripts

### Issue: "File not found" when trying to run SQL scripts
1. Ensure you're in the correct directory
2. Refresh your file explorer
3. Check that the files exist in the project root or [suprise-supermarket](file:///c:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket) directory
4. If needed, copy the SQL content directly from the files and paste into the Supabase SQL Editor

### Issue: Products not loading in user dashboard
1. Verify that [ADD_MISSING_COLUMNS.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ADD_MISSING_COLUMNS.sql) was run successfully
2. Check that there are products in the database with `is_featured = true`
3. Clear your browser cache and refresh

### Issue: Payment history not working
1. Verify that [ORDERS_TABLE_SETUP.sql](file:///C:/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/ORDERS_TABLE_SETUP.sql) was run successfully
2. Check that the `payment_transactions` table exists
3. Ensure there are test transactions in the table

### Issue: Customization changes not appearing globally
1. Verify that the profile update functionality is working correctly
2. Check browser console for any errors
3. Clear browser cache and refresh
4. Ensure the AuthContext is properly updating user data

## Additional Notes

### Email Verification Flow
The email verification during signup remains unchanged:
1. User signs up
2. User is redirected to the verification page
3. User verifies their email
4. User is automatically logged in and redirected to the homepage

However, after this initial verification, users can log in without any email verification requirements.

### Role-Based Access
- Admin users are directed to `/admin` when clicking the dashboard link
- Regular users are directed to `/dashboard` when clicking the dashboard link
- The role check happens in real-time when the user logs in

### Performance Considerations
- All database tables have proper indexes for performance
- Row Level Security is enabled for all tables
- Queries are optimized for common operations

If you encounter any issues during setup or testing, please check the browser console for error messages and verify that all database scripts have been executed successfully.