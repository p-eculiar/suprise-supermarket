-- ============================================
-- SURPRISE SUPERMARKET - COMPLETE DATABASE SETUP
-- This creates ALL tables from scratch
-- Run this entire script in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES (Base E-Commerce)
-- ============================================

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROFILES TABLE (User profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  email_notifications BOOLEAN DEFAULT true,
  is_corporate BOOLEAN DEFAULT false,
  corporate_client_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. EMAIL NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_product', 'discount', 'event')),
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT
);

-- 5. CONTACTS TABLE
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NEW REVENUE FEATURE TABLES
-- ============================================

-- 6. SUBSCRIPTION PLANS TABLE
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('household', 'corporate')),
  price DECIMAL(10, 2) NOT NULL,
  duration TEXT NOT NULL CHECK (duration IN ('monthly', 'quarterly', 'yearly')),
  description TEXT,
  items JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT true,
  subscribers_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. USER SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'canceled', 'expired')),
  monthly_value DECIMAL(10, 2) NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  next_delivery_date DATE,
  delivery_address TEXT,
  delivery_frequency TEXT DEFAULT 'monthly',
  payment_method TEXT,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  canceled_at TIMESTAMP WITH TIME ZONE
);

-- 8. CORPORATE CLIENTS TABLE
CREATE TABLE IF NOT EXISTS corporate_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  business_type TEXT,
  business_registration_number TEXT,
  tax_id TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  credit_limit DECIMAL(10, 2) DEFAULT 0,
  payment_terms TEXT DEFAULT 'Net 30' CHECK (payment_terms IN ('Net 7', 'Net 14', 'Net 30', 'Immediate')),
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0,
  outstanding_balance DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- 9. DIASPORA GIFT BASKETS TABLE
CREATE TABLE IF NOT EXISTS diaspora_gift_baskets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_ngn DECIMAL(10, 2) NOT NULL,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_gbp DECIMAL(10, 2) NOT NULL,
  price_eur DECIMAL(10, 2) NOT NULL,
  items JSONB DEFAULT '[]',
  image_url TEXT,
  category TEXT DEFAULT 'standard' CHECK (category IN ('standard', 'premium', 'deluxe')),
  active BOOLEAN DEFAULT true,
  total_orders INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DIASPORA ORDERS TABLE
CREATE TABLE IF NOT EXISTS diaspora_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basket_id UUID REFERENCES diaspora_gift_baskets(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  sender_country TEXT NOT NULL,
  sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name TEXT NOT NULL,
  recipient_phone TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  recipient_city TEXT,
  recipient_state TEXT,
  recipient_lga TEXT,
  gift_message TEXT,
  delivery_instructions TEXT,
  preferred_delivery_date DATE,
  currency TEXT NOT NULL CHECK (currency IN ('NGN', 'USD', 'GBP', 'EUR')),
  amount_paid DECIMAL(10, 2) NOT NULL,
  total_ngn DECIMAL(10, 2) NOT NULL,
  exchange_rate DECIMAL(10, 4),
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'canceled')),
  delivered_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  tracking_number TEXT,
  delivery_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. SOCIAL MEDIA LEADS TABLE
CREATE TABLE IF NOT EXISTS social_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'whatsapp', 'linkedin')),
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  author_profile_url TEXT,
  post_content TEXT NOT NULL,
  post_url TEXT NOT NULL,
  post_id TEXT,
  contact_info TEXT,
  email TEXT,
  phone TEXT,
  keywords_matched TEXT[] DEFAULT '{}',
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'responded', 'converted', 'ignored', 'lost')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Subscription plans indexes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON subscription_plans(type);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(active);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_delivery ON subscriptions(next_delivery_date);

-- Corporate clients indexes
CREATE INDEX IF NOT EXISTS idx_corporate_clients_user_id ON corporate_clients(user_id);
CREATE INDEX IF NOT EXISTS idx_corporate_clients_status ON corporate_clients(status);
CREATE INDEX IF NOT EXISTS idx_corporate_clients_email ON corporate_clients(email);

-- Diaspora baskets indexes
CREATE INDEX IF NOT EXISTS idx_diaspora_baskets_active ON diaspora_gift_baskets(active);
CREATE INDEX IF NOT EXISTS idx_diaspora_baskets_featured ON diaspora_gift_baskets(featured);

-- Diaspora orders indexes
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_sender_email ON diaspora_orders(sender_email);
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_status ON diaspora_orders(status);
CREATE INDEX IF NOT EXISTS idx_diaspora_orders_payment_status ON diaspora_orders(payment_status);

-- Social leads indexes
CREATE INDEX IF NOT EXISTS idx_social_leads_platform ON social_leads(platform);
CREATE INDEX IF NOT EXISTS idx_social_leads_status ON social_leads(status);
CREATE INDEX IF NOT EXISTS idx_social_leads_created_at ON social_leads(created_at DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_corporate_clients_updated_at ON corporate_clients;
CREATE TRIGGER update_corporate_clients_updated_at BEFORE UPDATE ON corporate_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diaspora_baskets_updated_at ON diaspora_gift_baskets;
CREATE TRIGGER update_diaspora_baskets_updated_at BEFORE UPDATE ON diaspora_gift_baskets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_diaspora_orders_updated_at ON diaspora_orders;
CREATE TRIGGER update_diaspora_orders_updated_at BEFORE UPDATE ON diaspora_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_social_leads_updated_at ON social_leads;
CREATE TRIGGER update_social_leads_updated_at BEFORE UPDATE ON social_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- BUSINESS LOGIC FUNCTIONS
-- ============================================

-- Function to increment subscriber count
CREATE OR REPLACE FUNCTION increment_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE subscription_plans
    SET subscribers_count = subscribers_count + 1
    WHERE id = NEW.plan_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_subscriber_count ON subscriptions;
CREATE TRIGGER trigger_increment_subscriber_count
    AFTER INSERT ON subscriptions
    FOR EACH ROW
    WHEN (NEW.status = 'active')
    EXECUTE FUNCTION increment_subscriber_count();

-- Function to decrement subscriber count
CREATE OR REPLACE FUNCTION decrement_subscriber_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'active' AND NEW.status IN ('canceled', 'expired') THEN
        UPDATE subscription_plans
        SET subscribers_count = subscribers_count - 1
        WHERE id = OLD.plan_id AND subscribers_count > 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_subscriber_count ON subscriptions;
CREATE TRIGGER trigger_decrement_subscriber_count
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION decrement_subscriber_count();

-- Function to increment basket orders
CREATE OR REPLACE FUNCTION increment_basket_orders()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE diaspora_gift_baskets
    SET total_orders = total_orders + 1
    WHERE id = NEW.basket_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_basket_orders ON diaspora_orders;
CREATE TRIGGER trigger_increment_basket_orders
    AFTER INSERT ON diaspora_orders
    FOR EACH ROW
    EXECUTE FUNCTION increment_basket_orders();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE corporate_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaspora_gift_baskets ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaspora_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_leads ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can view active products
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (active = true);

-- Products: Admins can do everything
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- Profiles: Users can view and update their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Orders: Admins can view all orders
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders FOR SELECT USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- Subscription Plans: Everyone can view active plans
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans FOR SELECT USING (active = true);

-- Subscription Plans: Admins can manage
DROP POLICY IF EXISTS "Admins can manage subscription plans" ON subscription_plans;
CREATE POLICY "Admins can manage subscription plans" ON subscription_plans FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- User Subscriptions: Users can view their own
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own subscriptions" ON subscriptions;
CREATE POLICY "Users can create own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscriptions" ON subscriptions;
CREATE POLICY "Users can update own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Corporate Clients: Users can view their own
DROP POLICY IF EXISTS "Users can view own corporate profile" ON corporate_clients;
CREATE POLICY "Users can view own corporate profile" ON corporate_clients FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own corporate profile" ON corporate_clients;
CREATE POLICY "Users can create own corporate profile" ON corporate_clients FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Corporate Clients: Admins can view and manage all
DROP POLICY IF EXISTS "Admins can manage corporate clients" ON corporate_clients;
CREATE POLICY "Admins can manage corporate clients" ON corporate_clients FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- Diaspora Baskets: Everyone can view active baskets
DROP POLICY IF EXISTS "Anyone can view active gift baskets" ON diaspora_gift_baskets;
CREATE POLICY "Anyone can view active gift baskets" ON diaspora_gift_baskets FOR SELECT USING (active = true);

-- Diaspora Baskets: Admins can manage
DROP POLICY IF EXISTS "Admins can manage gift baskets" ON diaspora_gift_baskets;
CREATE POLICY "Admins can manage gift baskets" ON diaspora_gift_baskets FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- Diaspora Orders: Anyone can create orders
DROP POLICY IF EXISTS "Anyone can create diaspora orders" ON diaspora_orders;
CREATE POLICY "Anyone can create diaspora orders" ON diaspora_orders FOR INSERT WITH CHECK (true);

-- Diaspora Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own diaspora orders" ON diaspora_orders;
CREATE POLICY "Users can view own diaspora orders" ON diaspora_orders FOR SELECT USING (
  sender_email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR sender_user_id = auth.uid()
);

-- Diaspora Orders: Admins can view and manage all
DROP POLICY IF EXISTS "Admins can manage diaspora orders" ON diaspora_orders;
CREATE POLICY "Admins can manage diaspora orders" ON diaspora_orders FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- Social Leads: Only admins can manage
DROP POLICY IF EXISTS "Admins can manage social leads" ON social_leads;
CREATE POLICY "Admins can manage social leads" ON social_leads FOR ALL USING (
  auth.jwt() ->> 'email' IN ('admin@surprisesupermarket.com', 'pchikezie05@gmail.com')
);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, type, price, duration, description, items, active) VALUES
('Bronze Family Plan', 'household', 30000, 'monthly', 'Essential groceries for a small family', 
 '[{"name": "Rice", "quantity": "10", "unit": "kg"}, {"name": "Beans", "quantity": "5", "unit": "kg"}, {"name": "Vegetable Oil", "quantity": "3", "unit": "liters"}]', true),
('Silver Family Plan', 'household', 50000, 'monthly', 'Complete family grocery package', 
 '[{"name": "Rice", "quantity": "25", "unit": "kg"}, {"name": "Beans", "quantity": "10", "unit": "kg"}, {"name": "Vegetable Oil", "quantity": "5", "unit": "liters"}, {"name": "Tomato Paste", "quantity": "10", "unit": "pcs"}]', true),
('Gold Family Plan', 'household', 100000, 'monthly', 'Premium family grocery package with extras', 
 '[{"name": "Rice", "quantity": "50", "unit": "kg"}, {"name": "Beans", "quantity": "25", "unit": "kg"}, {"name": "Vegetable Oil", "quantity": "10", "unit": "liters"}, {"name": "Frozen Chicken", "quantity": "5", "unit": "kg"}, {"name": "Yam Tubers", "quantity": "1", "unit": "bags"}]', true),
('Office Pantry Basic', 'corporate', 75000, 'monthly', 'Basic office pantry supplies', 
 '[{"name": "Coffee", "quantity": "5", "unit": "pcs"}, {"name": "Tea Bags", "quantity": "10", "unit": "pcs"}, {"name": "Sugar", "quantity": "5", "unit": "kg"}, {"name": "Biscuits", "quantity": "20", "unit": "pcs"}]', true),
('Office Pantry Premium', 'corporate', 150000, 'monthly', 'Complete office pantry solution', 
 '[{"name": "Coffee", "quantity": "10", "unit": "pcs"}, {"name": "Tea Bags", "quantity": "20", "unit": "pcs"}, {"name": "Sugar", "quantity": "10", "unit": "kg"}, {"name": "Bottled Water", "quantity": "10", "unit": "cartons"}, {"name": "Snacks Variety Pack", "quantity": "50", "unit": "pcs"}]', true)
ON CONFLICT DO NOTHING;

-- Insert sample diaspora gift baskets
INSERT INTO diaspora_gift_baskets (name, description, price_ngn, price_usd, price_gbp, price_eur, items, image_url, category, active, featured) VALUES
('Family Support Basket', 'Essential groceries to support a family for a month', 80000, 100, 80, 90, 
 '[{"name": "Rice", "quantity": "25", "unit": "kg"}, {"name": "Beans", "quantity": "10", "unit": "kg"}, {"name": "Vegetable Oil", "quantity": "5", "unit": "liters"}, {"name": "Tomato Paste", "quantity": "10", "unit": "pcs"}]', 
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', 'standard', true, true),
('Student Care Pack', 'Perfect for students living away from home', 35000, 45, 35, 40, 
 '[{"name": "Rice", "quantity": "10", "unit": "kg"}, {"name": "Garri", "quantity": "5", "unit": "kg"}, {"name": "Vegetable Oil", "quantity": "2", "unit": "liters"}, {"name": "Tin Tomatoes", "quantity": "5", "unit": "pcs"}]', 
 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400', 'standard', true, true),
('Premium Family Basket', 'Deluxe grocery basket with premium items', 150000, 180, 145, 165, 
 '[{"name": "Rice (Premium)", "quantity": "50", "unit": "kg"}, {"name": "Frozen Turkey", "quantity": "1", "unit": "whole"}, {"name": "Vegetable Oil", "quantity": "10", "unit": "liters"}, {"name": "Yam", "quantity": "1", "unit": "bag"}, {"name": "Frozen Fish", "quantity": "5", "unit": "kg"}]', 
 'https://images.unsplash.com/photo-1543168256-8133cc8e3ee4?w=400', 'premium', true, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- This will show you all tables created
SELECT 
    'products' as table_name, COUNT(*) as row_count FROM products
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'email_notifications', COUNT(*) FROM email_notifications
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'subscription_plans', COUNT(*) FROM subscription_plans
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'corporate_clients', COUNT(*) FROM corporate_clients
UNION ALL
SELECT 'diaspora_gift_baskets', COUNT(*) FROM diaspora_gift_baskets
UNION ALL
SELECT 'diaspora_orders', COUNT(*) FROM diaspora_orders
UNION ALL
SELECT 'social_leads', COUNT(*) FROM social_leads;

-- Success message
SELECT '✅ Database setup complete! All 11 tables created successfully.' as status;
