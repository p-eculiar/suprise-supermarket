-- Create Real-Time Trigger for Orders Table

-- Drop existing publication
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Recreate publication with all tables
CREATE PUBLICATION supabase_realtime FOR TABLE feedback, messages, orders;

-- Set publication to publish all events
ALTER PUBLICATION supabase_realtime SET (publish = 'insert, update, delete');

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';