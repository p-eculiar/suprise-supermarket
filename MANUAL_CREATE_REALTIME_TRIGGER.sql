-- Manually Create Real-Time Trigger for Orders Table

-- First, check if the realtime extension function exists
SELECT proname FROM pg_proc WHERE proname = 'realtime_subscription';

-- If the above returns a row, we can try to manually create the trigger:
/*
CREATE TRIGGER orders_realtime
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION realtime_subscription();
*/

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';