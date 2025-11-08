# How to Apply Database Updates

This guide explains how to apply the database updates for the delivery tracking feature.

## Prerequisites

1. Access to your Supabase project dashboard
2. Administrative privileges for the database

## Steps to Apply Updates

### 1. Apply Order Approval Workflow Updates

1. Log in to your Supabase Dashboard
2. Navigate to the SQL Editor
3. Open the file `UPDATE_ORDERS_TABLE.sql`
4. Copy the entire contents
5. Paste into the SQL Editor
6. Click "Run" to execute the script

This will:
- Add approval workflow fields to the orders table
- Create indexes for better performance
- Set up RLS policies for access control
- Create triggers for automatic notifications

### 2. Apply Delivery Tracking Updates

1. In the same SQL Editor (or a new query)
2. Open the file `UPDATE_DELIVERY_TRACKING.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click "Run" to execute the script

This will:
- Add real-time tracking fields to the delivery_tracking table
- Create indexes for better performance
- Update RLS policies for real-time tracking
- Create triggers for delivery update notifications

## Verification

After running both scripts, you can verify the updates by:

1. Checking the table structure:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'orders' 
   AND column_name IN ('approval_status', 'approved_by', 'approved_at', 'approval_notes');
   ```

2. Checking the delivery_tracking table:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'delivery_tracking' 
   AND column_name IN ('last_location_update', 'location_accuracy', 'delivery_eta');
   ```

## Troubleshooting

If you encounter any errors:

1. Make sure you're running the scripts in the correct order
2. Check that you have the necessary permissions
3. Verify that the tables exist before running the updates
4. If you get constraint errors, you may need to handle existing data first

## Next Steps

After applying these database updates, you can:

1. Deploy the updated frontend code
2. Test the approval workflow
3. Test the delivery tracking features
4. Train administrators on the new features