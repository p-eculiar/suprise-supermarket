-- Complete Real-Time Functionality Test

-- Step 1: Add orders table to the publication
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Step 2: Verify the publication now includes all required tables
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- Step 3: Get a user ID for testing
SELECT id, full_name, email FROM profiles LIMIT 1;

-- Step 4: Insert a test order (REPLACE 'USER_ID_HERE' with an actual user ID from step 3)
INSERT INTO orders (
  user_id, 
  order_number, 
  customer_name, 
  customer_email, 
  delivery_address, 
  subtotal, 
  tax,
  delivery_fee,
  total
) VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'RT-TEST-001',
  'Real-Time Test Customer',
  'realtime-test@example.com',
  '123 Real-Time Test Street, Test City',
  75.00,
  5.00,
  5.00,
  85.00
);

-- Step 5: Check that the order was created
SELECT id, user_id, order_number, total, created_at FROM orders WHERE order_number = 'RT-TEST-001';

-- Step 6: Observe the Users page in the admin dashboard
-- The user's "Total Orders" should increment by 1 and "Total Spent" should increase by $85.00
-- The "Total Revenue" in the stats overview should also increase by $85.00

-- Step 7: Clean up the test order
-- DELETE FROM orders WHERE order_number = 'RT-TEST-001';

-- Step 8: Verify the cleanup
-- SELECT id, user_id, order_number, total, created_at FROM orders WHERE order_number = 'RT-TEST-001';