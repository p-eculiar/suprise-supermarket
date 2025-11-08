-- Check if notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check notifications table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Check if there are any notifications
SELECT COUNT(*) as notification_count FROM notifications;

-- Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;