-- Check what payment methods exist in the orders table
SELECT DISTINCT payment_method, COUNT(*) as count
FROM orders
GROUP BY payment_method
ORDER BY count DESC;

-- Check what payment statuses exist
SELECT DISTINCT payment_status, COUNT(*) as count
FROM orders
GROUP BY payment_status
ORDER BY count DESC;

-- Check for bank transfer orders specifically
SELECT 
    id,
    order_number,
    customer_name,
    total,
    payment_method,
    payment_status,
    bank_transfer_details,
    created_at
FROM orders
WHERE payment_method ILIKE '%bank%'
ORDER BY created_at DESC
LIMIT 10;

-- Check for any orders with bank_transfer_details but different payment_method
SELECT 
    id,
    order_number,
    customer_name,
    total,
    payment_method,
    payment_status,
    bank_transfer_details,
    created_at
FROM orders
WHERE bank_transfer_details IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;