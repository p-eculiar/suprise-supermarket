-- Check for triggers on the notifications table
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgrelid = 'notifications'::regclass;

-- Check for functions that might be related to notifications
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname ILIKE '%notification%'
ORDER BY proname;

-- Check for any functions that might reference "updated_at"
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE pg_get_functiondef(oid) ILIKE '%updated_at%'
ORDER BY proname;