-- Test Real-Time Events

-- First, let's get a valid user ID for testing
SELECT 
  id, 
  email 
FROM auth.users 
LIMIT 1;

-- Check current counts before test
SELECT 
  'feedback' as table_name,
  COUNT(*) as count_before
FROM feedback
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as count_before
FROM messages;

-- IMPORTANT: Replace 'USER_ID_HERE' with an actual user ID from the auth.users table
-- Insert a test feedback record
/*
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  'USER_ID_HERE', 
  5, 
  'Real-time Test', 
  'Testing real-time functionality at ' || NOW()
);
*/

-- Insert a test message record
/*
INSERT INTO messages (user_id, subject, message, status)
VALUES (
  'USER_ID_HERE', 
  'Real-time Test Message', 
  'Testing real-time functionality at ' || NOW(), 
  'open'
);
*/

-- Check if the records were inserted
SELECT 
  'feedback' as table_name,
  COUNT(*) as count_after
FROM feedback
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as count_after
FROM messages;

-- Show the latest records
SELECT 
  'feedback' as table_name,
  id, 
  user_id, 
  rating, 
  category, 
  message, 
  created_at 
FROM feedback 
ORDER BY created_at DESC 
LIMIT 1;

SELECT 
  'messages' as table_name,
  id, 
  user_id, 
  subject, 
  message, 
  status, 
  created_at 
FROM messages 
ORDER BY created_at DESC 
LIMIT 1;

-- Test updating a record to see if UPDATE events work
-- IMPORTANT: Replace 'FEEDBACK_ID_HERE' with an actual feedback ID
/*
UPDATE feedback 
SET admin_response = 'Test response at ' || NOW() 
WHERE id = 'FEEDBACK_ID_HERE';
*/

-- IMPORTANT: Replace 'MESSAGE_ID_HERE' with an actual message ID
/*
UPDATE messages 
SET status = 'replied', 
    admin_response = 'Test response at ' || NOW(), 
    responded_at = NOW() 
WHERE id = 'MESSAGE_ID_HERE';
*/

-- Check if the updates were applied
SELECT 
  'feedback' as table_name,
  id, 
  admin_response, 
  created_at 
FROM feedback 
WHERE admin_response IS NOT NULL
ORDER BY created_at DESC 
LIMIT 1;

SELECT 
  'messages' as table_name,
  id, 
  status, 
  admin_response, 
  responded_at,
  created_at 
FROM messages 
WHERE status = 'replied'
ORDER BY created_at DESC 
LIMIT 1;

-- Clean up test data (uncomment if needed)
/*
DELETE FROM feedback 
WHERE message LIKE 'Testing real-time functionality at%';

DELETE FROM messages 
WHERE message LIKE 'Testing real-time functionality at%';
*/