-- Create nigeria_state_analytics table
CREATE TABLE IF NOT EXISTS nigeria_state_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  average_price DECIMAL(10, 2) NOT NULL,
  total_sales INTEGER NOT NULL DEFAULT 0,
  top_states TEXT[] DEFAULT '{}',
  growth_rate DECIMAL(5, 2) NOT NULL,
  profit_margin DECIMAL(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_nigeria_state_analytics_updated_at ON nigeria_state_analytics;
CREATE TRIGGER update_nigeria_state_analytics_updated_at 
BEFORE UPDATE ON nigeria_state_analytics
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

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
ALTER TABLE nigeria_state_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics (admin only)
CREATE POLICY "Admins can view analytics" ON nigeria_state_analytics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage analytics" ON nigeria_state_analytics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can view recommendations" ON product_recommendations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can manage recommendations" ON product_recommendations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);