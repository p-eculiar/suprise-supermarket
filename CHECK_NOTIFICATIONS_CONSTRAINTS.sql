-- Check the structure of the notifications table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Check the constraints on the notifications table
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'notifications'
ORDER BY tc.constraint_name;

-- Check what values are allowed for the type column
SELECT 
    pg_get_constraintdef(pc.oid) as constraint_definition
FROM pg_constraint pc
JOIN pg_class pcl ON pc.conrelid = pcl.oid
WHERE pcl.relname = 'notifications' 
AND pc.contype = 'c';