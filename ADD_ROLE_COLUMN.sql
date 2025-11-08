-- Add role column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor'));

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update RLS policies to use the role column instead of specific emails
-- First, drop existing policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
DROP POLICY IF EXISTS "Admins can manage corporate clients" ON corporate_clients;
DROP POLICY IF EXISTS "Admins can manage gift baskets" ON diaspora_gift_baskets;
DROP POLICY IF EXISTS "Admins can manage diaspora orders" ON diaspora_orders;
DROP POLICY IF EXISTS "Admins can manage social leads" ON social_leads;

-- Create new policies that check the role column
-- Products: Admins can manage
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Orders: Admins can view all
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Subscription Plans: Admins can manage
CREATE POLICY "Admins can manage subscription plans" ON subscription_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Corporate Clients: Admins can manage
CREATE POLICY "Admins can manage corporate clients" ON corporate_clients FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Diaspora Gift Baskets: Admins can manage
CREATE POLICY "Admins can manage gift baskets" ON diaspora_gift_baskets FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Diaspora Orders: Admins can manage
CREATE POLICY "Admins can manage diaspora orders" ON diaspora_orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Social Leads: Admins can manage
CREATE POLICY "Admins can manage social leads" ON social_leads FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);