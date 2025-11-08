-- COMPLETE FIX FOR ORDERS RLS POLICIES
-- This script ensures all necessary RLS policies are in place for the orders table

-- First, check current RLS status
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class
WHERE relname = 'orders';

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Check existing policies
SELECT 
    polname AS policy_name,
    polcmd AS command
FROM pg_policy
WHERE polrelid = 'orders'::regclass
ORDER BY polname;

-- Add the missing policy for admin updates (this is the key fix)
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Also ensure other necessary policies exist
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Verify all policies
SELECT 
    polname AS policy_name,
    polcmd AS command,
    polqual AS using_clause
FROM pg_policy
WHERE polrelid = 'orders'::regclass
ORDER BY polname;