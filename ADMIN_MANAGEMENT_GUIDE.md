# Admin User Management Guide

## Overview
This guide explains how to manage admin users in the Suprise Supermarket application. Admin users have special privileges to access the admin dashboard and manage the platform.

## Prerequisites
- Access to your Supabase project SQL editor
- Email addresses of users you want to make admins

## Setting Up Admin Users

### Step 1: Register the User
First, the user must register through the normal registration process:
1. Go to the registration page (/register)
2. Fill in the required information
3. Submit the form
4. The user will be redirected to the email verification page

### Step 2: Verify Email
The user must verify their email:
1. Check their email inbox for the verification email
2. Click the verification link
3. They will be automatically logged in and redirected to the homepage

### Step 3: Assign Admin Role
After the user has registered and verified their email, you need to assign them the admin role:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL query to assign the admin role:

```sql
-- Update specific users to have admin role
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user1@example.com', 'user2@example.com')
);
```

Replace 'user1@example.com', 'user2@example.com' with the actual email addresses of the users you want to make admins.

### Step 4: Verify the Update
To verify that the admin role has been assigned correctly, run this query:

```sql
-- Check if the users have the correct roles
SELECT p.id, u.email, p.role, u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('user1@example.com', 'user2@example.com');
```

## Alternative Method: Making the First User an Admin

If you want to make the very first user an admin automatically, you can modify the registration process in the AuthContext:

```typescript
// In AuthContext.tsx, modify the register function:
const register = async (name: string, email: string, password: string, emailNotifications: boolean = true) => {
  setIsLoading(true);
  setError(null);
  
  // Sign up the user
  const { data, error } = await supabase.auth.signUp({
    email, 
    password, 
    options: { 
      data: { 
        full_name: name,
        email_notifications: emailNotifications 
      } 
    }
  });
  
  if (error) {
    setError(error.message);
    setIsLoading(false);
    toast.error(error.message);
    throw error;
  }
  
  // Create profile in database if user was created
  if (data.user) {
    // Check if this is the first user
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const role = count === 0 ? 'admin' : 'customer'; // First user becomes admin
    
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          full_name: name,
          email_notifications: emailNotifications,
          role: role
        }
      ]);
    
    if (profileError) {
      console.error('Error creating profile:', profileError);
    }
  }
  
  setIsLoading(false);
};
```

## Checking Current Admin Users

To see all current admin users in your system:

```sql
-- List all admin users
SELECT p.id, u.email, p.full_name, p.role, u.created_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin'
ORDER BY u.created_at DESC;
```

## Removing Admin Privileges

To remove admin privileges from a user:

```sql
-- Remove admin role from specific users
UPDATE profiles 
SET role = 'customer'
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email IN ('user1@example.com', 'user2@example.com')
);
```

## Troubleshooting

### Issue: User is not being directed to admin dashboard
1. Verify the user's role in the database using the verification query above
2. Check that the user has properly verified their email
3. Ensure the user is logged in
4. Refresh the page to ensure the latest user data is loaded

### Issue: SQL query returns "no rows affected"
1. Verify that the email addresses exist in the auth.users table
2. Check for typos in the email addresses
3. Ensure the user has completed registration and email verification

### Issue: User can't access admin dashboard after role assignment
1. Have the user log out and log back in
2. Clear browser cache and cookies
3. Verify the role assignment with the verification query

## Best Practices

1. **Limit Admin Users**: Only assign admin privileges to trusted users who need to manage the platform
2. **Regular Audits**: Periodically check who has admin access to your system
3. **Documentation**: Keep a record of who has admin privileges and why
4. **Security**: Use strong passwords for admin accounts and enable two-factor authentication if available

## Security Considerations

1. **Role-Based Access Control**: The application uses proper RLS (Row Level Security) policies to ensure users can only access data they're authorized to see
2. **Data Protection**: Admin actions are logged (where applicable) for audit purposes
3. **Secure Communication**: All communication with Supabase is encrypted over HTTPS

## Conclusion

Managing admin users in the Suprise Supermarket application is straightforward with the provided SQL queries. By following this guide, you can easily assign, verify, and manage admin privileges for your users.