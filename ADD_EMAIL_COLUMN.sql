-- Add the missing email column to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index for the email column
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);