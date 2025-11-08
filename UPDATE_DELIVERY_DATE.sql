-- Add delivery_date column to delivery_tracking table
ALTER TABLE delivery_tracking 
ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_delivery_date ON delivery_tracking(delivery_date);

-- Add comment for documentation
COMMENT ON COLUMN delivery_tracking.delivery_date IS 'Scheduled delivery date and time set by admin';