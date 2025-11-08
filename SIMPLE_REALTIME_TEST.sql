-- Simple Real-Time Test

-- 1. First, let's check what user ID to use
SELECT 
  id, 
  email 
FROM auth.users 
LIMIT 3;

-- 2. Insert a test feedback record (replace 'USER_ID_HERE' with an actual user ID from step 1)
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  4, 
  'Real-time Test', 
  'Testing feedback real-time functionality'
);

-- 3. Insert a test message record (replace 'USER_ID_HERE' with an actual user ID from step 1)
INSERT INTO messages (user_id, subject, message, status)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  'Real-time Test', 
  'Testing message real-time functionality', 
  'open'
);

-- 4. Check if both records were inserted and get their IDs
SELECT 
  'feedback' as table_name,
  id,
  message,
  created_at
FROM feedback
WHERE message = 'Testing feedback real-time functionality'
ORDER BY created_at DESC
LIMIT 1;

SELECT 
  'messages' as table_name,
  id,
  message,
  created_at
FROM messages
WHERE message = 'Testing message real-time functionality'
ORDER BY created_at DESC
LIMIT 1;

-- 5. Clean up test data (run this after testing)
-- DELETE FROM feedback WHERE message = 'Testing feedback real-time functionality';
-- DELETE FROM messages WHERE message = 'Testing message real-time functionality';