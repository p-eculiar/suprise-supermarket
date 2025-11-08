-- Ensure notifications table exists with proper structure
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('order', 'product', 'promotion', 'system')),
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;

-- Create policies for notifications
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read, etc.)
CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (user_id = auth.uid());

-- Admins can view all notifications (for admin dashboard)
CREATE POLICY "Admins can view all notifications" ON notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert notifications (for system notifications)
CREATE POLICY "Admins can insert notifications" ON notifications
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;

-- Create function to get notification statistics for admin dashboard
CREATE OR REPLACE FUNCTION get_notification_stats(user_id UUID)
RETURNS TABLE (
    total_count BIGINT,
    unread_count BIGINT,
    order_notifications BIGINT,
    product_notifications BIGINT,
    promotion_notifications BIGINT,
    system_notifications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN read = false THEN 1 END) as unread_count,
        COUNT(CASE WHEN type = 'order' THEN 1 END) as order_notifications,
        COUNT(CASE WHEN type = 'product' THEN 1 END) as product_notifications,
        COUNT(CASE WHEN type = 'promotion' THEN 1 END) as promotion_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications
    FROM notifications 
    WHERE notifications.user_id = $1;
END;
$$ LANGUAGE plpgsql;

-- Create function to get admin notification statistics
CREATE OR REPLACE FUNCTION get_admin_notification_stats()
RETURNS TABLE (
    total_count BIGINT,
    unread_count BIGINT,
    today_count BIGINT,
    order_notifications BIGINT,
    product_notifications BIGINT,
    promotion_notifications BIGINT,
    system_notifications BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_count,
        COUNT(CASE WHEN read = false THEN 1 END) as unread_count,
        COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as today_count,
        COUNT(CASE WHEN type = 'order' THEN 1 END) as order_notifications,
        COUNT(CASE WHEN type = 'product' THEN 1 END) as product_notifications,
        COUNT(CASE WHEN type = 'promotion' THEN 1 END) as promotion_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications
    FROM notifications;
END;
$$ LANGUAGE plpgsql;