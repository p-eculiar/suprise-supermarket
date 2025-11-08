-- RECREATE NOTIFICATION TRIGGERS
-- This script recreates the triggers to use the fixed functions

-- Drop existing triggers
DROP TRIGGER IF EXISTS trigger_notify_admins_of_new_order ON orders;
DROP TRIGGER IF EXISTS trigger_notify_user_of_order_approval ON orders;
DROP TRIGGER IF EXISTS trigger_order_status_notification ON orders;

-- Recreate triggers with fixed functions
CREATE TRIGGER trigger_notify_admins_of_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION notify_admins_of_new_order();

CREATE TRIGGER trigger_notify_user_of_order_approval
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_order_approval();

CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification();

-- Test by creating a sample notification with valid types
INSERT INTO notifications (user_id, type, title, message)
VALUES ('0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 'order', 'Test Order Notification', 'This is a test notification')
ON CONFLICT DO NOTHING;

-- Verify the notification was created
SELECT type, COUNT(*) as count FROM notifications WHERE type = 'order' GROUP BY type;