-- FIX NOTIFICATION TYPES FOR SUPABASE
-- This script fixes all trigger functions that use invalid notification types

-- Fix the notify_admins_of_new_order function
CREATE OR REPLACE FUNCTION notify_admins_of_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins using valid type
  INSERT INTO notifications (user_id, type, title, message, data, read)
  SELECT 
    id,
    'order',
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
  -- Only notify if approval status changed using valid type
  IF NEW.approval_status != OLD.approval_status THEN
    INSERT INTO notifications (user_id, type, title, message, data, read)
    VALUES (
      NEW.user_id,
      'order',
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
  -- Send notification when order status changes using valid type
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (
      NEW.user_id,
      'order',
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