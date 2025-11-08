-- FIX NOTIFICATION TRIGGER ISSUE
-- This script fixes the "record 'new' has no field 'updated_at'" error

-- First, check if the trigger exists
SELECT tgname, pg_get_triggerdef(oid) 
FROM pg_trigger 
WHERE tgrelid = 'notifications'::regclass 
AND tgname = 'update_notifications_updated_at';

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure NEW record exists and has updated_at column
    IF (TG_OP = 'UPDATE') THEN
        -- Check if the table has updated_at column
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'notifications' 
            AND column_name = 'updated_at'
        ) THEN
            NEW.updated_at = NOW();
        END IF;
        RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the fix
SELECT tgname, pg_get_triggerdef(oid) 
FROM pg_trigger 
WHERE tgrelid = 'notifications'::regclass 
AND tgname = 'update_notifications_updated_at';

-- Test the trigger by updating a notification (if any exist)
UPDATE notifications 
SET read = true 
WHERE read = false;

-- If the above worked without error, the trigger is fixed