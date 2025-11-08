-- =====================================================
-- QUICK FIX: DROP AND RECREATE ORDERS TABLES
-- =====================================================
-- Run this FIRST if you're getting column errors

-- Drop tables with CASCADE (automatically removes all dependent objects)
-- CASCADE will drop: policies, triggers, indexes, foreign keys, etc.
DROP TABLE IF EXISTS public.payment_transactions CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- SUCCESS! Now run ORDERS_TABLE_SETUP.sql
-- =====================================================
-- After this completes, run the main ORDERS_TABLE_SETUP.sql file
