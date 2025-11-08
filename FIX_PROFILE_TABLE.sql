-- Add the missing email column to the profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Also add other missing columns that should be there according to the schema
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS state TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_notifications ON profiles(email_notifications);

-- Populate the email column from auth.users for existing profiles
UPDATE profiles 
SET email = auth_users.email
FROM auth.users auth_users
WHERE profiles.id = auth_users.id 
AND profiles.email IS NULL
AND auth_users.email IS NOT NULL;