-- First, ensure avatar_url column exists in profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Check current avatar data
SELECT 
  p.id,
  p.full_name,
  p.email,
  p.avatar_url as profile_avatar,
  au.raw_user_meta_data->>'avatar_url' as auth_avatar
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
LIMIT 10;

-- Sync avatar URLs from auth.users metadata to profiles table
UPDATE profiles 
SET avatar_url = au.raw_user_meta_data->>'avatar_url',
    updated_at = NOW()
FROM auth.users au
WHERE profiles.id = au.id 
  AND au.raw_user_meta_data->>'avatar_url' IS NOT NULL
  AND (profiles.avatar_url IS NULL OR profiles.avatar_url != au.raw_user_meta_data->>'avatar_url');

-- Verify the update
SELECT 
  id,
  full_name,
  email,
  avatar_url,
  CASE 
    WHEN avatar_url IS NOT NULL THEN 'Has Avatar'
    ELSE 'No Avatar'
  END as avatar_status
FROM profiles
WHERE avatar_url IS NOT NULL
LIMIT 10;

-- Create a function to auto-sync avatar_url when auth metadata changes
CREATE OR REPLACE FUNCTION sync_avatar_url()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET avatar_url = NEW.raw_user_meta_data->>'avatar_url',
      updated_at = NOW()
  WHERE id = NEW.id
    AND (avatar_url IS NULL OR avatar_url != NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-sync on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_updated_sync_avatar ON auth.users;
CREATE TRIGGER on_auth_user_updated_sync_avatar
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
  EXECUTE FUNCTION sync_avatar_url();

-- Manually set some test avatars (using placeholder service)
-- Uncomment and run if you want to test with placeholder avatars
/*
UPDATE profiles 
SET avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || id::text,
    updated_at = NOW()
WHERE avatar_url IS NULL
LIMIT 5;
*/
