-- Fix All Real-Time Functionality

-- 1. Drop the existing publication
DROP PUBLICATION IF EXISTS supabase_realtime;

-- 2. Create the publication with proper configuration for real-time
CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages, orders;

-- 3. Set the publication to publish all events
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- 4. Verify the publication was created
SELECT 
  pubname as publication_name,
  puballtables as publishes_all_tables,
  pubinsert as publishes_inserts,
  pubupdate as publishes_updates,
  pubdelete as publishes_deletes
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 5. Check which tables are in the publication
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 6. Check triggers on all tables
SELECT 
  'feedback' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass

UNION ALL

SELECT 
  'messages' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass

UNION ALL

SELECT 
  'orders' as table_name,
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass;

-- 7. Check WAL level (should be 'logical' for real-time to work)
SHOW wal_level;

-- 8. Refresh the schema cache
NOTIFY pgrst, 'reload schema';

-- 9. Test the setup by inserting a record into each table
-- (This is just for verification - you can delete these test records afterward)

-- Get a user ID for testing (use the first user in the profiles table)
-- SELECT id FROM profiles LIMIT 1;

-- Insert test feedback (REPLACE 'USER_ID_HERE' with an actual user ID from the SELECT query above)
/*
INSERT INTO feedback (user_id, rating, category, message) 
VALUES ('USER_ID_HERE', 5, 'Test', 'This is a test message for real-time functionality');
*/

-- Insert test message
/*
INSERT INTO messages (user_id, subject, message, status) 
VALUES ('USER_ID_HERE', 'Test Subject', 'This is a test message for real-time functionality', 'open');
*/

-- Get a user ID for the test order
-- SELECT id FROM profiles LIMIT 1;

-- Insert test order (REPLACE 'USER_ID_HERE' with an actual user ID)
/*
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
  'USER_ID_HERE',
  'RT-FIX-TEST-001',
  'Real-Time Fix Test Customer',
  'fix-test@example.com',
  '123 Fix Test Street, Test City',
  50.00,
  3.00,
  5.00,
  58.00
);
*/

-- 10. Clean up test records
-- DELETE FROM feedback WHERE message = 'This is a test message for real-time functionality';
-- DELETE FROM messages WHERE subject = 'Test Subject';
-- DELETE FROM orders WHERE order_number = 'RT-FIX-TEST-001';