-- Check the status of all orders
SELECT 
    id,
    order_number,
    status,
    total,
    created_at
FROM orders 
ORDER BY created_at DESC;

-- Check if there are any delivered orders
SELECT 
    COUNT(*) as delivered_orders_count,
    SUM(total) as total_revenue
FROM orders 
WHERE status = 'delivered';

-- Check all possible status values
SELECT 
    status,
    COUNT(*) as count
FROM orders 
GROUP BY status;