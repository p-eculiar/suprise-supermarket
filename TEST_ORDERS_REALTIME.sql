-- Test Real-Time Functionality for Orders

-- 1. First, let's get a user ID to use for testing
SELECT id, full_name, email FROM profiles LIMIT 1;

-- 2. Insert a test order for that user (replace USER_ID_HERE with an actual user ID from step 1)
/*
INSERT INTO orders (
  user_id, 
  order_number, 
  customer_name, 
  customer_email, 
  delivery_address, 
  subtotal, 
  total
) VALUES (
  'USER_ID_HERE',  -- Replace with actual user ID
  'TEST-001',
  'Test Customer',
  'test@example.com',
  '123 Test Street, Test City',
  50.00,
  55.00  -- Includes tax/fees
);
*/

-- 3. After running step 2, check if the Users page updates automatically
-- The user's "Total Orders" should increment by 1 and "Total Spent" should increase by $55.00

-- 4. To clean up after testing, you can delete the test order
-- DELETE FROM orders WHERE order_number = 'TEST-001';