-- Check Feedback Insert Issue

-- 1. First, let's try to insert a feedback record manually to see if there's an error
-- Replace 'USER_ID_HERE' with an actual user ID
INSERT INTO feedback (user_id, rating, category, message)
VALUES (
  '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3', 
  4, 
  'Test Category', 
  'Test message for feedback insert'
);

-- 2. Check if the feedback record was inserted
SELECT 
  id,
  user_id,
  rating,
  category,
  message,
  created_at
FROM feedback
WHERE message = 'Test message for feedback insert';

-- 3. Check the structure of the feedback table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- 4. Check RLS policies on feedback table
SELECT 
  polname as policy_name,
  polpermissive as permissive,
  polroles as roles,
  polcmd as command,
  polqual as using_clause,
  polwithcheck as with_check_clause
FROM pg_policy p
JOIN pg_class c ON p.polrelid = c.oid
WHERE c.relname = 'feedback'
ORDER BY polcmd;

-- 5. Clean up test data
-- DELETE FROM feedback WHERE message = 'Test message for feedback insert';

