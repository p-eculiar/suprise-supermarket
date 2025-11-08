-- Enable Row Level Security for categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    )
  );