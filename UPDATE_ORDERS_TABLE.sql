-- Update orders table to add approval workflow fields
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_approval_status ON orders(approval_status);
CREATE INDEX IF NOT EXISTS idx_orders_approved_by ON orders(approved_by);

-- Update RLS policies to handle approval workflow
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders 
FOR SELECT USING (
  auth.uid() = user_id AND 
  (approval_status = 'approved' OR approval_status = 'pending')
);

-- Users can create orders
CREATE POLICY "Users can create orders" ON orders 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all orders (including pending approvals)
CREATE POLICY "Admins can view all orders" ON orders 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update order approval status
CREATE POLICY "Admins can approve orders" ON orders 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to notify admins of new orders requiring approval
CREATE OR REPLACE FUNCTION notify_admins_of_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all admins
  INSERT INTO notifications (user_id, type, title, message, data, read)
  SELECT 
    id,
    'order',  -- Changed from 'order_approval' to 'order' to match allowed types
    'New Order Requires Approval',
    'Order #' || NEW.id::text || ' needs your approval',
    jsonb_build_object('order_id', NEW.id, 'customer_name', NEW.customer_name),
    false
  FROM profiles 
  WHERE role = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new order notifications
DROP TRIGGER IF EXISTS trigger_notify_admins_of_new_order ON orders;
CREATE TRIGGER trigger_notify_admins_of_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.approval_status = 'pending')
  EXECUTE FUNCTION notify_admins_of_new_order();

-- Create function to notify user of order approval
CREATE OR REPLACE FUNCTION notify_user_of_order_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if approval status changed
  IF NEW.approval_status != OLD.approval_status THEN
    INSERT INTO notifications (user_id, type, title, message, data, read)
    VALUES (
      NEW.user_id,
      'order',  -- Changed from 'order_status' to 'order' to match allowed types
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

-- Create trigger for order approval notifications
DROP TRIGGER IF EXISTS trigger_notify_user_of_order_approval ON orders;
CREATE TRIGGER trigger_notify_user_of_order_approval
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_order_approval();

-- Add comment for documentation
COMMENT ON COLUMN orders.approval_status IS 'Order approval status: pending, approved, rejected';
COMMENT ON COLUMN orders.approved_by IS 'Admin who approved/rejected the order';
COMMENT ON COLUMN orders.approved_at IS 'Timestamp when order was approved/rejected';
COMMENT ON COLUMN orders.approval_notes IS 'Notes about approval decision';