-- Update delivery_tracking table to add real-time location tracking fields
ALTER TABLE delivery_tracking 
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS location_accuracy INTEGER,
ADD COLUMN IF NOT EXISTS delivery_eta TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_last_update ON delivery_tracking(last_location_update);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_eta ON delivery_tracking(delivery_eta);

-- Update RLS policies to handle real-time tracking
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view own order tracking" ON delivery_tracking;

-- Users can view their own order tracking
CREATE POLICY "Users can view own order tracking" ON delivery_tracking 
FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE user_id = auth.uid()
  )
);

-- Admins can update delivery tracking
CREATE POLICY "Admins can update delivery tracking" ON delivery_tracking 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create function to notify user of delivery updates
CREATE OR REPLACE FUNCTION notify_user_of_delivery_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only notify if location or status changed
  IF NEW.current_location IS DISTINCT FROM OLD.current_location OR NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data, read)
    SELECT 
      o.user_id,
      'delivery_update',
      CASE 
        WHEN NEW.status = 'out_for_delivery' THEN 'Driver on the Way'
        WHEN NEW.status = 'delivered' THEN 'Order Delivered'
        ELSE 'Delivery Update'
      END,
      CASE 
        WHEN NEW.status = 'out_for_delivery' THEN 'Your order is on the way! Driver: ' || COALESCE(NEW.driver_name, 'Unknown')
        WHEN NEW.status = 'delivered' THEN 'Your order has been delivered successfully!'
        WHEN NEW.current_location IS NOT NULL THEN 'Driver location updated: ' || COALESCE(NEW.current_location->>'address', 'Unknown location')
        ELSE 'Your delivery status has been updated to: ' || NEW.status
      END,
      jsonb_build_object(
        'order_id', NEW.order_id,
        'status', NEW.status,
        'driver_name', NEW.driver_name,
        'driver_phone', NEW.driver_phone,
        'current_location', NEW.current_location,
        'estimated_delivery_time', NEW.estimated_delivery_time
      ),
      false
    FROM orders o
    WHERE o.id = NEW.order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for delivery update notifications
DROP TRIGGER IF EXISTS trigger_notify_user_of_delivery_update ON delivery_tracking;
CREATE TRIGGER trigger_notify_user_of_delivery_update
  AFTER UPDATE ON delivery_tracking
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_of_delivery_update();

-- Add comment for documentation
COMMENT ON COLUMN delivery_tracking.last_location_update IS 'Timestamp of last GPS location update';
COMMENT ON COLUMN delivery_tracking.location_accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN delivery_tracking.delivery_eta IS 'Estimated time of arrival';