# Role-Based Authentication Implementation Guide

This document explains how the role-based authentication system works in Surprise Supermarket and how to properly set it up.

## Overview

The role-based authentication system automatically:
1. Assigns roles to users during registration based on their email address
2. Detects user roles when they log in or verify their email
3. Redirects users to the appropriate dashboard based on their role
4. Uses environment variables to determine which emails should be admins

## Implementation Details

### 1. User Registration Flow

When a user registers:
1. The system checks if the user's email is in the admin email list (from environment variables)
2. If the email is in the list, the user is assigned the 'admin' role
3. Otherwise, the user is assigned the 'customer' role
4. A profile is created in the `profiles` table with the appropriate role
5. The user receives an email verification link
6. After email verification, the user is automatically logged in
7. The system detects the user's role and redirects them appropriately

### 2. Role Detection

The system automatically detects user roles:
1. When the user logs in
2. When the user verifies their email
3. When the AuthContext initializes

### 3. Dashboard Redirection

Based on the user's role:
- **Admin users** are redirected to `/admin`
- **Regular customers** are redirected to `/dashboard`

### 4. Admin Email Configuration

Admin emails are configured in the environment variables:
- `REACT_APP_ADMIN_EMAIL_1`
- `REACT_APP_ADMIN_EMAIL_2`
- Additional admin emails can be added to the `isAdminEmail` function

## Database Structure

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  email_notifications BOOLEAN DEFAULT true,
  is_corporate BOOLEAN DEFAULT false,
  corporate_client_id UUID,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup Instructions

### 1. Configure Admin Emails

Add admin email addresses to your environment variables:
```env
REACT_APP_ADMIN_EMAIL_1=admin1@surprisesupermarket.com
REACT_APP_ADMIN_EMAIL_2=admin2@surprisesupermarket.com
```

### 2. Deploy Code Changes

The following files have been updated:
- `src/contexts/AuthContext.tsx` - Enhanced role detection and assignment based on email
- `src/components/layout/Header.tsx` - Dashboard redirection based on role (already correct)
- `src/pages/auth/EmailVerification.tsx` - Proper redirection after verification (already correct)

## Testing the Implementation

### Test Scenario 1: Admin User Registration
1. Register a new user with an email that matches an admin email in .env
2. Verify email
3. User should be redirected to homepage
4. User should have admin role in database
5. Profile dropdown should show link to `/admin`

### Test Scenario 2: Customer User Registration
1. Register a new user with an email that doesn't match any admin emails
2. Verify email
3. User should be redirected to homepage
4. User should have customer role in database
5. Profile dropdown should show link to `/dashboard`

### Test Scenario 3: Login with Different Roles
1. Login as admin user
2. Click profile avatar
3. Dashboard link should go to `/admin`
4. Login as customer user
5. Click profile avatar
6. Dashboard link should go to `/dashboard`

### Test Scenario 4: Adding New Admin Emails
1. Add a new admin email to .env
2. Restart the application
3. Register a new user with that email
4. User should be assigned admin role

## Troubleshooting

### Issue: User not getting admin role
**Solution**: Check that the user's email exactly matches one of the admin emails in .env

### Issue: User redirected to wrong dashboard
**Solution**: Check the user's role in the profiles table:
```sql
SELECT id, full_name, role FROM profiles WHERE id = 'USER_ID';
```

### Issue: Environment variables not loading
**Solution**: Check that .env file is in the correct location and variables are properly formatted

### Issue: Role not detected properly
**Solution**: Check browser console for errors and ensure AuthContext is properly initialized.

## Security Considerations

1. **Role Verification**: Roles are verified on both frontend and backend
2. **Database Constraints**: Role column has CHECK constraint for valid values
3. **Row Level Security**: Database policies ensure users can only access appropriate data
4. **Session Management**: User sessions include role information
5. **Environment Variables**: Admin emails are stored securely in environment variables

## Future Enhancements

1. **Dynamic Admin Management**: Admin panel to manage admin emails without code changes
2. **Vendor Roles**: Support for vendor accounts with specific permissions
3. **Role-Based Permissions**: Fine-grained permissions within roles
4. **Audit Logging**: Track role changes for security purposes
5. **Multi-factor Authentication**: Enhanced security for admin accounts

## Code Structure

### AuthContext.tsx
- `isAdminEmail()` - Checks if email is in admin list from environment variables
- `getUserRole()` - Fetches user role from database
- `setUserRole()` - Sets user role during registration
- Enhanced user state management with role information

### Header.tsx
- `getDashboardPath()` - Returns appropriate dashboard path based on user role
- Profile dropdown with role-based navigation

### EmailVerification.tsx
- Proper redirection after email verification
- User data refresh to ensure latest role information

## Best Practices

1. **Always verify roles on backend**: Never trust frontend role information alone
2. **Use database constraints**: Ensure role values are valid
3. **Implement proper RLS policies**: Control data access based on roles
4. **Log role changes**: Track when and why roles are changed
5. **Test all role combinations**: Ensure proper behavior for each role type
6. **Keep admin emails secure**: Only add trusted emails to admin list
7. **Regular review**: Periodically review admin email list for security

This implementation provides a robust, secure, and user-friendly role-based authentication system that automatically assigns roles based on email addresses configured in environment variables, allowing for easy management of admin users without requiring database modifications.