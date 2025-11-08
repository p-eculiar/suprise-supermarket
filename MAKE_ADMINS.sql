-- Make specific users admins by updating their role in the profiles table
-- Replace 'chikwendupeculiar66@gmail.com' and 'surpry1980@yahoo.com' with the actual admin emails

-- First, ensure the role column exists (in case you haven't run ADD_ROLE_COLUMN.sql yet)
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

-- Handle users who don't have profiles yet
-- Insert profiles for users who don't have them
INSERT INTO profiles (id, full_name, role)
SELECT u.id, u.raw_user_meta_data->>'full_name', 'customer'
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Now, set the specified users as admins
-- For chikwendupeculiar66@gmail.com
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'chikwendupeculiar66@gmail.com'
);

-- For surpry1980@yahoo.com
UPDATE profiles 
SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'surpry1980@yahoo.com'
);

-- Verification: Check if the updates were successful
SELECT p.id, u.email, p.full_name, p.role
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email IN ('chikwendupeculiar66@gmail.com', 'surpry1980@yahoo.com');