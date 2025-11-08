-- Check the definition of existing real-time triggers

SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'feedback_realtime' OR tgname = 'messages_realtime';