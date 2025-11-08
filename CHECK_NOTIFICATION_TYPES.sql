-- Check what notification types are allowed by examining the table constraints
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notifications'
AND tc.constraint_type = 'CHECK';

-- Check existing notification types in the database
SELECT DISTINCT type, COUNT(*) as count
FROM notifications
GROUP BY type
ORDER BY count DESC;

-- Check the structure of the notifications table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;