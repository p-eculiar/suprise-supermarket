-- Add notification preference columns to users table if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS order_updates BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS product_alerts BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS promotions BOOLEAN DEFAULT TRUE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_notifications ON users(email_notifications);
CREATE INDEX IF NOT EXISTS idx_users_push_notifications ON users(push_notifications);

-- Create function to get user notification preferences
CREATE OR REPLACE FUNCTION get_user_notification_preferences(user_id UUID)
RETURNS TABLE (
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    order_updates BOOLEAN,
    product_alerts BOOLEAN,
    promotions BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email_notifications,
        u.push_notifications,
        u.order_updates,
        u.product_alerts,
        u.promotions
    FROM users u
    WHERE u.id = $1;
END;
$$ LANGUAGE plpgsql;

-- Create function to update user notification preferences
CREATE OR REPLACE FUNCTION update_user_notification_preferences(
    user_id UUID,
    p_email_notifications BOOLEAN DEFAULT NULL,
    p_push_notifications BOOLEAN DEFAULT NULL,
    p_order_updates BOOLEAN DEFAULT NULL,
    p_product_alerts BOOLEAN DEFAULT NULL,
    p_promotions BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
    email_notifications BOOLEAN,
    push_notifications BOOLEAN,
    order_updates BOOLEAN,
    product_alerts BOOLEAN,
    promotions BOOLEAN
) AS $$
BEGIN
    UPDATE users 
    SET 
        email_notifications = COALESCE(p_email_notifications, email_notifications),
        push_notifications = COALESCE(p_push_notifications, push_notifications),
        order_updates = COALESCE(p_order_updates, order_updates),
        product_alerts = COALESCE(p_product_alerts, product_alerts),
        promotions = COALESCE(p_promotions, promotions)
    WHERE id = $1;
    
    RETURN QUERY
    SELECT 
        u.email_notifications,
        u.push_notifications,
        u.order_updates,
        u.product_alerts,
        u.promotions
    FROM users u
    WHERE u.id = $1;
END;
$$ LANGUAGE plpgsql;

-- Create notification preferences table for more detailed settings
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_type TEXT NOT NULL CHECK (preference_type IN ('email', 'sms', 'push', 'web')),
    category TEXT NOT NULL CHECK (category IN ('orders', 'products', 'promotions', 'system')),
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_type, category)
);

-- Create indexes for notification preferences
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(preference_type);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_category ON notification_preferences(category);

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for notification preferences
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own notification preferences" ON notification_preferences
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all notification preferences" ON notification_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON notification_preferences TO authenticated;

-- Create function to get all notification preferences for a user
CREATE OR REPLACE FUNCTION get_all_user_notification_preferences(user_id UUID)
RETURNS TABLE (
    preference_type TEXT,
    category TEXT,
    enabled BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        np.preference_type,
        np.category,
        np.enabled
    FROM notification_preferences np
    WHERE np.user_id = $1
    ORDER BY np.preference_type, np.category;
END;
$$ LANGUAGE plpgsql;

-- Create function to update notification preference
CREATE OR REPLACE FUNCTION update_notification_preference(
    user_id UUID,
    p_preference_type TEXT,
    p_category TEXT,
    p_enabled BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
    VALUES (user_id, p_preference_type, p_category, p_enabled)
    ON CONFLICT (user_id, preference_type, category)
    DO UPDATE SET 
        enabled = EXCLUDED.enabled,
        updated_at = NOW();
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification preferences for existing users
INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'email' as preference_type,
    'orders' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'email' AND category = 'orders'
)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'email' as preference_type,
    'products' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'email' AND category = 'products'
)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'email' as preference_type,
    'promotions' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'email' AND category = 'promotions'
)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'push' as preference_type,
    'orders' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'push' AND category = 'orders'
)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'push' as preference_type,
    'products' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'push' AND category = 'products'
)
ON CONFLICT DO NOTHING;

INSERT INTO notification_preferences (user_id, preference_type, category, enabled)
SELECT 
    id as user_id,
    'push' as preference_type,
    'promotions' as category,
    TRUE as enabled
FROM users
WHERE id NOT IN (
    SELECT user_id 
    FROM notification_preferences 
    WHERE preference_type = 'push' AND category = 'promotions'
)
ON CONFLICT DO NOTHING;