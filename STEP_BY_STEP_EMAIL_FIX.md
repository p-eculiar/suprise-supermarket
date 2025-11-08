# Step-by-Step Email Fix

## Problem
The `profiles` table was missing the `email` column, causing:
1. "column email does not exist" errors
2. User emails showing as "email-not-found@example.com" in the admin users page

## Root Cause
The profiles table schema was incomplete - it was missing the email column that should have been there according to the documentation.

## Solution Steps

### Step 1: Add the Missing Email Column
Run `ADD_EMAIL_COLUMN.sql` to add the email column to the profiles table:
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
```

### Step 2: Populate the Email Column
Run `POPULATE_EMAILS.sql` to fill the email column with data from auth.users:
```sql
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL
AND auth_users.email IS NOT NULL;
```

### Step 3: Update the Frontend Code
Modified `src/pages/admin/Users.tsx` to directly use the email from the profiles table:
```typescript
// Use the email directly from the profiles table since we've added the column
const profilesDataWithEmail = profilesData.map((profile: any) => {
  return { 
    ...profile, 
    email: profile.email || 'email-not-found@example.com'
  };
});
```

### Step 4: Verify the Fix
Run `VERIFY_EMAIL_FIX.sql` to confirm the fix:
```sql
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;
```

## Expected Results
1. No more "column email does not exist" errors
2. Real email addresses showing in the admin users page
3. Ability to send emails to correct user addresses

## Files Created
1. `ADD_EMAIL_COLUMN.sql` - Add missing email column
2. `POPULATE_EMAILS.sql` - Populate email data
3. `VERIFY_EMAIL_FIX.sql` - Verification script
4. `STEP_BY_STEP_EMAIL_FIX.md` - This documentation

## How to Apply the Fix
1. Run `ADD_EMAIL_COLUMN.sql` in your Supabase dashboard
2. Run `POPULATE_EMAILS.sql` in your Supabase dashboard
3. Refresh the admin users page
4. Run `VERIFY_EMAIL_FIX.sql` to confirm the fix worked

The emails should now show correctly instead of "email-not-found@example.com".