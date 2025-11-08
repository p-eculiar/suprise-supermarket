-- Test Real-Time Functionality

-- First, let's check if we have a valid user to test with
SELECT 
  id, 
  email 
FROM auth.users 
LIMIT 5;

-- Check current counts
SELECT 
  'feedback' as table_name,
  COUNT(*) as current_count
FROM feedback
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as current_count
FROM messages;

-- Insert a test feedback record (replace 'user_id' with an actual user ID from above)
-- IMPORTANT: Replace 'REPLACE_WITH_ACTUAL_USER_ID' with a real user ID from the auth.users table
/*
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  'REPLACE_WITH_ACTUAL_USER_ID', 
  5, 
  'Real-time Test', 
  'Testing real-time functionality - ' || NOW()
);
*/

-- Insert a test message record (replace 'user_id' with an actual user ID from above)
-- IMPORTANT: Replace 'REPLACE_WITH_ACTUAL_USER_ID' with a real user ID from the auth.users table
/*
INSERT INTO messages (user_id, subject, message, status)
VALUES (
  'REPLACE_WITH_ACTUAL_USER_ID', 
  'Real-time Test Message', 
  'Testing real-time functionality - ' || NOW(), 
  'open'
);
*/

-- Check if the records were inserted
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
LIMIT 3;

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
LIMIT 3;

-- Test updating a record to see if UPDATE events work
-- IMPORTANT: Replace 'REPLACE_WITH_FEEDBACK_ID' with an actual feedback ID
/*
UPDATE feedback 
SET admin_response = 'Test response - ' || NOW() 
WHERE id = 'REPLACE_WITH_FEEDBACK_ID';
*/

-- IMPORTANT: Replace 'REPLACE_WITH_MESSAGE_ID' with an actual message ID
/*
UPDATE messages 
SET status = 'replied', 
    admin_response = 'Test response - ' || NOW(), 
    responded_at = NOW() 
WHERE id = 'REPLACE_WITH_MESSAGE_ID';
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
LIMIT 3;

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
LIMIT 3;

-- Clean up test data (uncomment if needed)
/*
DELETE FROM feedback 
WHERE message LIKE 'Testing real-time functionality%';

DELETE FROM messages 
WHERE message LIKE 'Testing real-time functionality%';
*/