-- Check all triggers in the database that might affect notifications
SELECT 
    tgname AS trigger_name,
    pg_get_triggerdef(oid) AS trigger_definition,
    tgrelid::regclass AS table_name
FROM pg_trigger
WHERE tgrelid::regclass::text LIKE '%notification%'
ORDER BY tgrelid::regclass::text, tgname;

-- Check for any functions that might be related to updated_at
SELECT 
    proname AS function_name,
    pg_get_functiondef(oid) AS function_definition
FROM pg_proc
WHERE proname ILIKE '%updated%'
ORDER BY proname;

-- Check the structure of the notifications table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
ORDER BY ordinal_position;