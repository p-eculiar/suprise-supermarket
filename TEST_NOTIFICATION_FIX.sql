-- Test the notification fix by creating a test notification and updating it

-- First, check if we have any notifications
SELECT COUNT(*) as notification_count FROM notifications;

-- Create a test notification if none exist
INSERT INTO notifications (
    id,
    user_id,
    title,
    message,
    type,
    read,
    data,
    created_at
) VALUES (
    'test-notification-id-000000000001',
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3',  -- Test user ID
    'Test Notification for Trigger Fix',
    'This notification is for testing the trigger fix',
    'system',
    false,
    '{"test": true}',
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    message = EXCLUDED.message;

-- Verify the notification was created
SELECT * FROM notifications WHERE id = 'test-notification-id-000000000001';

-- Test updating the notification (this should trigger the updated_at function)
UPDATE notifications 
SET read = true
WHERE id = 'test-notification-id-000000000001';

-- Verify the update worked
SELECT id, read, updated_at FROM notifications WHERE id = 'test-notification-id-000000000001';

-- Clean up the test notification
DELETE FROM notifications WHERE id = 'test-notification-id-000000000001';

-- Final verification
SELECT COUNT(*) as final_notification_count FROM notifications;