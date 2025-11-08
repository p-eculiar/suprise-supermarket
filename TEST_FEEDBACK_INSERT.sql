-- Test Feedback Insert After Policy Fix

-- 1. First, let's get a valid user ID
SELECT 
  id, 
  email 
FROM auth.users 
LIMIT 3;

-- 2. Insert a test feedback record (replace 'USER_ID_HERE' with an actual user ID from step 1)
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  5, 
  'Policy Test', 
  'Testing feedback insert after policy fix'
);

-- 3. Check if the feedback record was inserted
SELECT 
  id,
  user_id,
  rating,
  category,
  message,
  created_at
FROM feedback
WHERE message = 'Testing feedback insert after policy fix';

-- 4. Clean up test data
-- DELETE FROM feedback WHERE message = 'Testing feedback insert after policy fix';