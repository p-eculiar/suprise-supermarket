-- Verify Real-Time Functionality is Working

-- 1. Get the current count of records
SELECT 
  'feedback' as table_name,
  COUNT(*) as current_count
FROM feedback
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as current_count
FROM messages;

-- 2. Insert a test feedback record
-- IMPORTANT: Replace 'USER_ID_HERE' with an actual user ID from your auth.users table
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  5, 
  'Real-time Test', 
  'Testing if real-time is working correctly - ' || NOW()
);

-- 3. Insert a test message record
-- IMPORTANT: Replace 'USER_ID_HERE' with an actual user ID from your auth.users table
INSERT INTO messages (user_id, subject, message, status)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  'Real-time Test Message', 
  'Testing if real-time is working correctly - ' || NOW(), 
  'open'
);

-- 4. Check if the records were inserted
SELECT 
  'feedback' as table_name,
  id,
  user_id,
  rating,
  category,
  message,
  created_at
FROM feedback
WHERE message LIKE 'Testing if real-time is working correctly%'
ORDER BY created_at DESC;

SELECT 
  'messages' as table_name,
  id,
  user_id,
  subject,
  message,
  status,
  created_at
FROM messages
WHERE message LIKE 'Testing if real-time is working correctly%'
ORDER BY created_at DESC;

-- 5. Test updating a record
-- IMPORTANT: Replace 'FEEDBACK_ID_HERE' with an actual feedback ID from step 4
UPDATE feedback 
SET admin_response = 'Confirmed real-time update working - ' || NOW()
WHERE message LIKE 'Testing if real-time is working correctly%'
AND id = 'FEEDBACK_ID_HERE';

-- IMPORTANT: Replace 'MESSAGE_ID_HERE' with an actual message ID from step 4
UPDATE messages 
SET status = 'replied',
    admin_response = 'Confirmed real-time update working - ' || NOW(),
    responded_at = NOW()
WHERE message LIKE 'Testing if real-time is working correctly%'
AND id = 'MESSAGE_ID_HERE';

-- 6. Check if updates were applied
SELECT 
  'feedback' as table_name,
  id,
  admin_response,
  created_at
FROM feedback
WHERE admin_response LIKE 'Confirmed real-time update working%'
ORDER BY created_at DESC;

SELECT 
  'messages' as table_name,
  id,
  status,
  admin_response,
  responded_at,
  created_at
FROM messages
WHERE admin_response LIKE 'Confirmed real-time update working%'
ORDER BY created_at DESC;

-- 7. Clean up test data
DELETE FROM feedback 
WHERE message LIKE 'Testing if real-time is working correctly%';

DELETE FROM messages 
WHERE message LIKE 'Testing if real-time is working correctly%';

-- 8. Verify cleanup
SELECT 
  'feedback' as table_name,
  COUNT(*) as remaining_test_records
FROM feedback
WHERE message LIKE 'Testing if real-time is working correctly%'
UNION ALL
SELECT 
  'messages' as table_name,
  COUNT(*) as remaining_test_records
FROM messages
WHERE message LIKE 'Testing if real-time is working correctly%';