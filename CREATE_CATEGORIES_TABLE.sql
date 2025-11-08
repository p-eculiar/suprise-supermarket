-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  product_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample categories
INSERT INTO categories (name, slug, description, is_active) VALUES
  ('Vegetables', 'vegetables', 'Fresh vegetables from local farms', true),
  ('Fruits', 'fruits', 'Seasonal fruits and berries', true),
  ('Dairy', 'dairy', 'Milk, cheese, yogurt and other dairy products', true),
  ('Meat', 'meat', 'Fresh meat and poultry', true),
  ('Bakery', 'bakery', 'Freshly baked breads and pastries', true),
  ('Beverages', 'beverages', 'Soft drinks, juices and other beverages', true),
  ('Snacks', 'snacks', 'Chips, cookies and other snacks', true),
  ('Frozen', 'frozen', 'Frozen foods and ice cream', true),
  ('Organic', 'organic', 'Organic and natural products', true)
ON CONFLICT (name) DO NOTHING;