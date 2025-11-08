-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'vendor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  compare_price DECIMAL(10, 2),
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create nigeria_state_analytics table
CREATE TABLE IF NOT EXISTS nigeria_state_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT UNIQUE NOT NULL,
  top_product TEXT NOT NULL,
  total_purchases INTEGER NOT NULL DEFAULT 0,
  average_price DECIMAL(10, 2) NOT NULL,
  trend TEXT NOT NULL,
  market_share DECIMAL(5, 2) NOT NULL,
  supermarkets_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_recommendations table
CREATE TABLE IF NOT EXISTS product_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name TEXT NOT NULL,
  average_price DECIMAL(10, 2) NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  top_states TEXT[] DEFAULT '{}',
  growth_rate DECIMAL(5, 2) NOT NULL,
  profit_margin DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create platform_settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform_fee_percentage DECIMAL(5, 2) NOT NULL DEFAULT 2.5,
  tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 7.5,
  minimum_order DECIMAL(10, 2) NOT NULL DEFAULT 10.00,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  free_shipping_threshold DECIMAL(10, 2) NOT NULL DEFAULT 50.00,
  site_name TEXT NOT NULL DEFAULT 'Suprise Supermarket',
  support_email TEXT NOT NULL DEFAULT 'support@suprisesuper.com',
  currency TEXT NOT NULL DEFAULT 'USD',
  timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nigeria_state_analytics_updated_at BEFORE UPDATE ON nigeria_state_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  product_name TEXT,
  total_quantity INTEGER,
  total_revenue DECIMAL(10, 2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_name,
    SUM(oi.quantity)::INTEGER as total_quantity,
    SUM(oi.quantity * oi.price) as total_revenue
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  WHERE o.status = 'completed'
  GROUP BY oi.product_name
  ORDER BY total_quantity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Insert default platform settings
INSERT INTO platform_settings (id, platform_fee_percentage, tax_rate, minimum_order, shipping_fee, free_shipping_threshold, site_name, support_email, currency, timezone)
VALUES ('00000000-0000-0000-0000-000000000001', 2.5, 7.5, 10.00, 5.00, 50.00, 'Suprise Supermarket', 'support@suprisesuper.com', 'USD', 'Africa/Lagos')
ON CONFLICT (id) DO NOTHING;

-- Insert sample Nigerian states data
INSERT INTO nigeria_state_analytics (state, top_product, total_purchases, average_price, trend, market_share, supermarkets_count) VALUES
('Lagos', 'Organic Tomatoes', 15420, 5.99, '+23%', 28.5, 342),
('Abuja (FCT)', 'Fresh Strawberries', 8960, 7.50, '+18%', 16.8, 156),
('Rivers', 'Organic Tomatoes', 6540, 6.25, '+15%', 12.3, 98),
('Kano', 'Green Peas', 5890, 2.99, '+12%', 11.0, 124),
('Oyo', 'Organic Tomatoes', 4320, 5.75, '+20%', 8.1, 87),
('Delta', 'Fresh Strawberries', 3780, 6.99, '+14%', 7.1, 65),
('Kaduna', 'Green Peas', 3240, 3.25, '+10%', 6.1, 54),
('Enugu', 'Organic Tomatoes', 2890, 6.10, '+16%', 5.4, 48),
('Anambra', 'Fresh Strawberries', 2540, 7.25, '+13%', 4.8, 42)
ON CONFLICT (state) DO NOTHING;

-- Insert sample product recommendations
INSERT INTO product_recommendations (product_name, average_price, total_sales, top_states, growth_rate, profit_margin) VALUES
('Organic Tomatoes', 5.99, 26280, ARRAY['Lagos', 'Rivers', 'Oyo', 'Enugu', 'Kaduna'], 23.5, 35.2),
('Fresh Strawberries', 7.25, 12740, ARRAY['Abuja', 'Delta', 'Lagos', 'Anambra'], 18.3, 42.8),
('Green Peas', 2.99, 10450, ARRAY['Kano', 'Kaduna', 'Sokoto', 'Katsina'], 15.7, 28.5)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE nigeria_state_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for products (public read, admin write)
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for analytics (admin only)
CREATE POLICY "Admins can view analytics" ON nigeria_state_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view recommendations" ON product_recommendations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policies for settings (admin only)
CREATE POLICY "Admins can manage settings" ON platform_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT DO NOTHING;

-- Create storage policy
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );
