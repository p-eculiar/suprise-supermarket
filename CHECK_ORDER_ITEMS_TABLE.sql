-- Check the structure of the order_items table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Check if there are any existing order items
SELECT COUNT(*) as count FROM order_items;

-- Check a few sample order items to understand the structure
SELECT * FROM order_items LIMIT 3;