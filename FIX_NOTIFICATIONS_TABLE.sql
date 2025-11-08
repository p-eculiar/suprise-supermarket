-- First, let's check if the notifications table exists and its current structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- If the table exists, let's check its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- Check constraints
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notifications';

-- If the table exists but doesn't have the right constraint, let's fix it
-- First, drop the existing constraint if it exists
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add the correct constraint
ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('order', 'product', 'promotion', 'system'));

-- Insert sample notifications to test (only if the table is empty)
INSERT INTO notifications (user_id, title, message, type, read, data)
SELECT 
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
    'New Order Received!', 
    'Your order #ORD-001 has been received and is being processed.', 
    'order', 
    false, 
    '{"orderId": "12a93c70-9831-4d63-a7e4-d0431ae6a049"}'
WHERE NOT EXISTS (SELECT 1 FROM notifications);

INSERT INTO notifications (user_id, title, message, type, read, data)
SELECT 
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
    'Low Stock Alert', 
    'Organic Tomatoes are running low (5 units remaining).', 
    'product', 
    false, 
    '{"productId": "product-123", "productName": "Organic Tomatoes", "currentStock": 5}'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'product');

INSERT INTO notifications (user_id, title, message, type, read, data)
SELECT 
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
    'Special Promotion', 
    'Get 20% off on all fruits this week!', 
    'promotion', 
    false, 
    '{"discount": 20, "category": "fruits"}'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'promotion');

INSERT INTO notifications (user_id, title, message, type, read, data)
SELECT 
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
    'System Maintenance', 
    'Scheduled maintenance on Sunday at 2 AM.', 
    'system', 
    true, 
    '{"maintenanceTime": "2025-11-02T02:00:00Z"}'
WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE type = 'system');

-- Verify the data
SELECT COUNT(*) as notification_count FROM notifications;
SELECT type, COUNT(*) as type_count FROM notifications GROUP BY type;
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;