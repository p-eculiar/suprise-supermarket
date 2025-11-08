-- Add Real-Time Trigger to Orders Table

-- Create the real-time trigger for the orders table
CREATE TRIGGER orders_realtime
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION broadcast_changes();

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';