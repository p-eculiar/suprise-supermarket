-- Check the structure of the orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    constraint_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage k
    ON c.table_name = k.table_name 
    AND c.column_name = k.column_name
    AND c.table_schema = k.table_schema
WHERE c.table_name = 'orders' 
AND c.column_name = 'driver_id';

-- Check foreign key constraints on orders table
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'orders'
AND kcu.column_name = 'driver_id';