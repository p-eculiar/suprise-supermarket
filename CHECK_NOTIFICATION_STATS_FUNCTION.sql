-- Check if get_notification_stats function exists
SELECT 
    proname,
    proargnames,
    prorettype
FROM pg_proc 
WHERE proname = 'get_notification_stats';

-- Check all functions related to notifications
SELECT 
    proname,
    proargnames,
    prorettype
FROM pg_proc 
WHERE proname ILIKE '%notification%';