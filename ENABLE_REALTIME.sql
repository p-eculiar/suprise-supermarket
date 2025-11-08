-- Enable real-time functionality for feedback table
SELECT supabase_realtime.add_channel('feedback');

-- Enable real-time functionality for messages table
SELECT supabase_realtime.add_channel('messages');

-- Alternative method if the above doesn't work
-- Begin listening for changes on feedback table
BEGIN;
SELECT pg_listen('realtime:feedback');
COMMIT;

-- Begin listening for changes on messages table
BEGIN;
SELECT pg_listen('realtime:messages');
COMMIT;