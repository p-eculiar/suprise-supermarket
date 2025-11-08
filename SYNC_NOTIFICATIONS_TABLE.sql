-- Sync the notifications table structure with the current schema
-- This script ensures the notifications table has all the required columns

-- Add updated_at column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add action_url column if it doesn't exist (based on the column check output)
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Ensure all required columns exist with correct types
ALTER TABLE notifications 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE notifications 
ALTER COLUMN read SET DEFAULT FALSE;

ALTER TABLE notifications 
ALTER COLUMN created_at SET DEFAULT NOW();

-- Add the updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to have updated_at values where null
UPDATE notifications 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;