-- Create navigation_items table
CREATE TABLE IF NOT EXISTS navigation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  href TEXT NOT NULL,
  "order" INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_navigation_items_order ON navigation_items("order");
CREATE INDEX IF NOT EXISTS idx_navigation_items_active ON navigation_items(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_navigation_items_updated_at ON navigation_items;
CREATE TRIGGER update_navigation_items_updated_at 
  BEFORE UPDATE ON navigation_items
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default navigation items if table is empty
INSERT INTO navigation_items (name, href, "order", is_active) 
SELECT * FROM (
  VALUES 
    ('Home', '/', 1, true),
    ('Services', '/services', 2, true),
    ('About Us', '/about', 3, true),
    ('Categories', '/products', 4, true),
    ('Blog', '/blog', 5, true),
    ('Diaspora Gifting', '/diaspora-gifting', 6, true),
    ('Contact', '/contact', 7, true)
) AS default_items(name, href, "order", is_active)
WHERE NOT EXISTS (SELECT 1 FROM navigation_items);