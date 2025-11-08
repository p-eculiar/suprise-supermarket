# Setup Instructions for Analytics Tables

To fix the issues with the admin dashboard pages, follow these steps:

## 1. Fix the Users Page Issue

The Users page has been updated to properly fetch user data. The changes include:
- Fixed the join syntax to properly fetch email data from the users table
- Improved error handling
- Better data processing

No additional setup is required for this fix.

## 2. Set up Analytics Tables

The Nigeria Analytics page requires two database tables that are not yet created:
- `nigeria_state_analytics`
- `product_recommendations`

### Option A: Using Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy the contents of `CREATE_ANALYTICS_TABLES.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute

### Option B: Using the Admin Dashboard

1. Start your application
2. Log in as an admin
3. Navigate to the Nigeria Analytics page
4. You'll see a message "Analytics Tables Not Found"
5. Click the "Create Analytics Tables" button
6. Wait for the process to complete

## 3. Verify the Setup

After completing the above steps:

1. Go to the Users page in the admin dashboard
2. You should now see the list of users instead of "No users found"
3. Go to the Nigeria Analytics page
4. You should see the analytics data instead of the error message

## Troubleshooting

### If Users Page Still Shows "No Users Found"

1. Check that you have users in your database
2. Verify that the profiles table has data
3. Ensure your user has admin role

### If Analytics Page Still Shows Error

1. Make sure both tables were created successfully
2. Check that you're logged in as an admin
3. Verify that the tables have data

## Additional Notes

- The analytics tables come with sample data to help you get started
- You can customize the data to match your actual business needs
- Both pages now have better error handling and user feedback