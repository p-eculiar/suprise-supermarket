-- Add Orders Table to Real-Time Publication

-- 1. Add the orders table to the existing publication
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 2. Verify the publication now includes all required tables
SELECT 
  schemaname as schema_name,
  tablename as table_name
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;

-- 3. Check that triggers exist on the orders table
SELECT 
  tgname as trigger_name,
  tgenabled as enabled
FROM pg_trigger
WHERE tgrelid = 'orders'::regclass;

-- 4. If no real-time triggers exist, recreate the publication to ensure they are created
-- (Only run this if step 3 shows no real-time triggers)
/*
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages, orders;
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');
*/

-- 5. Refresh the schema cache
NOTIFY pgrst, 'reload schema';