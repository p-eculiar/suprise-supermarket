-- Check all triggers on Orders Table

SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass
ORDER BY tgname;