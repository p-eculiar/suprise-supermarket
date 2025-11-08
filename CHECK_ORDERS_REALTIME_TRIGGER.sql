-- Check specifically for real-time trigger on Orders Table

SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass
AND tgname LIKE '%realtime%';