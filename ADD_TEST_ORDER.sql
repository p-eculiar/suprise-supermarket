-- Add a test order to verify dashboard functionality
-- NOTE: You need to replace the UUIDs with actual values from your database

-- First, let's check if there are any users in the database
SELECT id, email FROM auth.users LIMIT 5;

-- Then, check if there are any products
SELECT id, name FROM products LIMIT 5;

-- Check the actual structure of the orders table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- After getting actual user_id and product_id values, run these commands:

-- Step 1: Create a test order with only the essential columns
INSERT INTO orders (
    user_id,
    order_number,
    customer_name,
    customer_email,
    subtotal,
    total_amount,
    status
) VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID from auth.users
    'TEST-001',
    'Test Customer',
    'test@example.com',
    25.98,
    25.98,
    'processing'
) RETURNING id;

-- Step 2: If the above works, you can add more fields gradually
-- First check which additional fields exist:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'orders';

-- Step 3: Create test order items (replace ORDER_ID_HERE with the ID returned above)
INSERT INTO order_items (
    order_id,
    product_id,
    product_name,
    quantity,
    price,
    total
) VALUES (
    'ORDER_ID_HERE',  -- Replace with actual order ID from above
    'PRODUCT_ID_HERE',  -- Replace with actual product ID from products table
    'Test Product 1',
    1,
    25.98,
    25.98
);

-- Step 4: Verify the order was created
SELECT * FROM orders WHERE order_number = 'TEST-001';

-- Step 5: Check if admin can see the order in dashboard
-- This query simulates what the admin dashboard should be able to see
SELECT 
    id,
    order_number,
    customer_name,
    customer_email,
    total_amount,
    status,
    created_at
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;