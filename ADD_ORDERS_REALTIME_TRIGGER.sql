-- Add Real-Time Trigger to Orders Table

-- First, let's try to add the table to the publication again
-- This should create the real-time trigger if it doesn't exist
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';