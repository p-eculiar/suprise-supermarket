-- Fix for the notification trigger issue
-- First, drop any existing trigger
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

-- Drop the function if it exists with any issues
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the function properly
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the NEW record has the updated_at column
    IF TG_OP = 'UPDATE' THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the trigger was created
SELECT tgname, pg_get_triggerdef(oid) 
FROM pg_trigger 
WHERE tgrelid = 'notifications'::regclass;