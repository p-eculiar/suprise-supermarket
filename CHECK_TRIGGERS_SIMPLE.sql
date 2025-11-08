-- Check Real-Time Triggers on All Tables

-- 1. Check triggers on the feedback table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'feedback'::regclass;

-- 2. Check triggers on the messages table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'messages'::regclass;

-- 3. Check triggers on the orders table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass;