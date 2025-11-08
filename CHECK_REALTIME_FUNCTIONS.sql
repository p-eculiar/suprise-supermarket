-- Check for Supabase Real-Time Functions

SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname LIKE '%realtime%' 
OR proname LIKE '%broadcast%'
ORDER BY proname;