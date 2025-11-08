-- FIX NOTIFICATION TYPES
-- This script fixes all trigger functions that use invalid notification types

-- Fix the notify_admins_of_new_order function
CREATE OR REPLACE FUNCTION notify_admins_of_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins
  INSERT INTO notifications (user_id, type, title, message, data, read)
  SELECT 
    id,
    'order',  -- Valid type
    'New Order Requires Approval',
    'Order #' || NEW.id::text || ' needs your approval',
    jsonb_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name),
    false
  FROM profiles 
  WHERE role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the notify_user_of_order_approval function
CREATE OR REPLACE FUNCTION notify_user_of_order_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if approval status changed
  IF NEW.approval_status != OLD.approval_status THEN
    INSERT INTO notifications (user_id, type, title, message, data, read)
    VALUES (
      NEW.user_id,
      'order',  -- Valid type
      CASE 
        WHEN NEW.approval_status = 'approved' THEN 'Order Approved'
        WHEN NEW.approval_status = 'rejected' THEN 'Order Rejected'
        ELSE 'Order Status Updated'
      END,
      CASE 
        WHEN NEW.approval_status = 'approved' THEN 'Your order has been approved and is being processed'
        WHEN NEW.approval_status = 'rejected' THEN 'Your order has been rejected: ' || COALESCE(NEW.approval_notes, 'No reason provided')
        ELSE 'Your order status has been updated'
      END,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.approval_status),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the send_order_notification function
CREATE OR REPLACE FUNCTION send_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification when order status changes
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (
      NEW.user_id,
      'order',  -- Valid type
      'Order Status Updated',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Your order has been confirmed!'
        WHEN 'preparing' THEN 'Your order is being prepared.'
        WHEN 'out_for_delivery' THEN 'Your order is out for delivery!'
        WHEN 'delivered' THEN 'Your order has been delivered.'
        WHEN 'cancelled' THEN 'Your order has been cancelled.'
        ELSE 'Your order status has been updated.'
      END,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status),
      '/dashboard/orders'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate triggers to use the updated functions
DROP TRIGGER IF EXISTS trigger_notify_admins_of_new_order ON orders;
CREATE TRIGGER trigger_notify_admins_of_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION notify_admins_of_new_order();

DROP TRIGGER IF EXISTS trigger_notify_user_of_order_approval ON orders;
CREATE TRIGGER trigger_notify_user_of_order_approval
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_order_approval();

DROP TRIGGER IF EXISTS trigger_order_status_notification ON orders;
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification();

-- Verify the functions were updated
SELECT proname, pg_get_functiondef(oid) 
FROM pg_proc 
WHERE proname IN ('notify_admins_of_new_order', 'notify_user_of_order_approval', 'send_order_notification');