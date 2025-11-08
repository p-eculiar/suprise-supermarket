-- Check the structure of the orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check a sample order to understand the structure
SELECT * FROM orders LIMIT 1;

-- Check if there are any orders with approval_status = 'pending'
SELECT id, order_number, approval_status, status FROM orders WHERE approval_status = 'pending' LIMIT 5;