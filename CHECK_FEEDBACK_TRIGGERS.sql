-- Check Feedback Table Triggers

-- 1. Check if there are any triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass;

-- 2. Check if there are any triggers on the messages table
SELECT 
  tgname as trigger_name
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass;