-- Drop existing notifications table and related items
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP TABLE IF EXISTS notifications;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('order', 'product', 'promotion', 'system')),
  read BOOLEAN DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" ON notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample notifications to test
INSERT INTO notifications (user_id, title, message, type, read, data)
VALUES 
  ('0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 'New Order Received!', 'Your order #ORD-001 has been received and is being processed.', 'order', false, '{"orderId": "12a93c70-9831-4d63-a7e4-d0431ae6a049"}'),
  ('0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 'Low Stock Alert', 'Organic Tomatoes are running low (5 units remaining).', 'product', false, '{"productId": "product-123", "productName": "Organic Tomatoes", "currentStock": 5}'),
  ('0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 'Special Promotion', 'Get 20% off on all fruits this week!', 'promotion', false, '{"discount": 20, "category": "fruits"}'),
  ('0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 'System Maintenance', 'Scheduled maintenance on Sunday at 2 AM.', 'system', true, '{"maintenanceTime": "2025-11-02T02:00:00Z"}');

-- Verify the tables were created
SELECT COUNT(*) as notification_count FROM notifications;
SELECT * FROM notifications LIMIT 5;