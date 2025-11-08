-- Create a test notification for debugging
INSERT INTO notifications (
  id,
  user_id,
  title,
  message,
  type,
  read,
  created_at
) VALUES (
  '99999999-9999-9999-9999-999999999999',
  '11111111-1111-1111-1111-111111111111', -- Use the test user ID from earlier
  'Test Notification',
  'This is a test notification for debugging purposes',
  'system',
  false,
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  type = EXCLUDED.type,
  read = EXCLUDED.read,
  created_at = EXCLUDED.created_at;

-- Check if the notification was created
SELECT * FROM notifications WHERE id = '99999999-9999-9999-9999-999999999999';