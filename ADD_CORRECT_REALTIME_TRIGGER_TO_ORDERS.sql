-- Add Correct Real-Time Trigger to Orders Table

-- Create the real-time trigger for the orders table using the correct function
CREATE TRIGGER orders_realtime
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_realtime_change();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';