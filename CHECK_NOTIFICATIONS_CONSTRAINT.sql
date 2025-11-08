-- Check if notifications table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check the notifications table structure and constraints
SELECT 
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    cc.check_clause
FROM information_schema.columns c
LEFT JOIN information_schema.check_constraints cc 
    ON c.table_name = cc.table_name 
    AND cc.constraint_name IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'notifications' 
        AND constraint_type = 'CHECK'
    )
WHERE c.table_name = 'notifications' 
ORDER BY c.ordinal_position;

-- Check all constraints on the notifications table
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notifications';

-- Check existing notifications
SELECT COUNT(*) as notification_count FROM notifications;
SELECT * FROM notifications LIMIT 5;