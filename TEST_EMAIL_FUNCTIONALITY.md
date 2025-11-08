# Testing Email Functionality

## Overview
This document explains how to test the email functionality in the admin dashboard to ensure emails are being sent to the correct user email addresses.

## Prerequisites
1. Ensure the application is running
2. You have admin access to the dashboard
3. There are users in the system with valid email addresses
4. The Resend API key is properly configured in the `.env` file

## Test Steps

### 1. Verify User Emails in Database
First, run the verification SQL query to confirm emails are stored correctly:

```sql
-- Verify that user emails are correctly stored in the profiles table
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC
LIMIT 10;
```

### 2. Check Admin Users Page
1. Navigate to the Admin Dashboard > Users page
2. Verify that the user table displays real email addresses (not placeholders)
3. Check that all user information is loading correctly

### 3. Test Bulk Email Functionality
1. Select one or more users from the user table
2. Click the "Send Bulk Email" button
3. Fill in a subject and content
4. Click "Send Emails"
5. Observe the progress indicator and completion message

### 4. Verify Email Delivery
1. Check the Resend dashboard to verify emails were sent
2. Check the recipient email inboxes (including spam/junk folders)
3. Verify that emails were sent to the correct addresses

### 5. Test "Send to All Users" Feature
1. Select the "All Users" option in the bulk email modal
2. Send a test email
3. Verify that emails are sent to all users in the system

## Debugging Common Issues

### Issue: Emails Not Being Sent
1. Check browser console for errors
2. Verify the Resend API key in `.env` file
3. Check network tab for failed API requests
4. Verify that users have valid email addresses in the database

### Issue: Emails Sent to Wrong Addresses
1. Run the verification SQL query to check email data in the database
2. Check that the frontend is correctly fetching emails from the profiles table
3. Verify that the email service is using the correct email property

### Issue: CORS Errors
If you see CORS errors in the console:
1. This is expected when calling Resend API directly from the browser
2. For production, implement a backend proxy endpoint
3. For development, the system simulates success

## Expected Results
- User emails should be displayed correctly in the admin users table
- Bulk emails should be sent to the actual email addresses of selected users
- No placeholder emails should be generated
- Email sending should respect the 2ms delay between emails
- Progress indicators should show accurate sending status

## Additional Testing
1. Test with users who have opted out of email notifications
2. Test with users who have no email address in the database
3. Test with very large numbers of users to verify rate limiting
4. Test email content with various formatting options (links, line breaks)

This testing ensures that the email functionality works correctly and sends emails to the actual user email addresses as required.