# Avatar Images Fix - Users Page

## Issue
User avatar images were not displaying in the Users table even though users had uploaded profile pictures.

## Root Cause
The avatar URLs are stored in Supabase Auth's `user_metadata.avatar_url`, not in the profiles table. The code was only fetching data from the profiles table, missing the avatar information.

## Solution Implemented

### 1. Fetch Avatar URLs from Auth Metadata
Added code to fetch user data from Supabase Auth and extract avatar URLs:

```typescript
// Fetch auth users to get avatar_url from metadata
const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

// Create a map of user avatars from auth metadata
const avatarMap = new Map();
if (authUsers) {
  authUsers.forEach((authUser: any) => {
    if (authUser.user_metadata?.avatar_url) {
      avatarMap.set(authUser.id, authUser.user_metadata.avatar_url);
    }
  });
}
```

### 2. Merge Avatar Data with Profiles
Updated the data mapping to include avatar URLs:

```typescript
const profilesDataWithAvatar = profilesData.map((profile: any) => {
  return { 
    ...profile, 
    email: profile.email || 'email-not-found@example.com',
    avatar_url: avatarMap.get(profile.id) || profile.avatar_url || null
  };
});
```

### 3. Display Logic (Already Implemented)
The UserAvatar component checks for avatar_url and displays:
- The actual profile image if avatar_url exists
- User initials as fallback if no avatar

```tsx
<UserAvatar>
  {(user as any).avatar_url ? (
    <img src={(user as any).avatar_url} alt={user.full_name || 'User'} />
  ) : (
    <span>{user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
  )}
</UserAvatar>
```

## How It Works

1. **Fetch Profiles**: Gets all user profile data from the profiles table
2. **Fetch Auth Users**: Gets avatar URLs from Supabase Auth metadata using `auth.admin.listUsers()`
3. **Create Avatar Map**: Maps user IDs to their avatar URLs for quick lookup
4. **Merge Data**: Combines profile data with avatar URLs
5. **Display**: Shows avatar image if available, otherwise shows initials

## Benefits

✅ Users' profile pictures now display correctly in the admin dashboard
✅ Maintains fallback to initials for users without avatars
✅ Uses efficient mapping for performance
✅ Compatible with existing auth system

## Files Modified
- `src/pages/admin/Users.tsx` - Added auth.admin.listUsers() call and avatar mapping

## Testing Checklist
- [ ] Users with uploaded avatars show their images
- [ ] Users without avatars show their initials
- [ ] Avatar images are properly sized and circular
- [ ] No console errors when fetching user data
