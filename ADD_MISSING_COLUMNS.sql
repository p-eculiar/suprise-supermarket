-- =====================================================
-- ADD MISSING COLUMNS FOR REAL DATA INTEGRATION
-- =====================================================
-- Run this in Supabase SQL Editor AFTER main tables are created

-- 1. ADD COLUMNS TO PRODUCTS TABLE
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount NUMERIC(5,2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN products.is_featured IS 'Whether product appears in featured section';
COMMENT ON COLUMN products.is_bestseller IS 'Whether product appears in bestsellers section';
COMMENT ON COLUMN products.rating IS 'Product rating out of 5';
COMMENT ON COLUMN products.discount IS 'Discount percentage (0-100)';

-- 2. CREATE WISHLIST TABLE
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 3. CREATE INDEXES FOR WISHLIST
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist(product_id);

-- 4. ENABLE RLS ON WISHLIST
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES FOR WISHLIST
DROP POLICY IF EXISTS "Users can view their own wishlist" ON wishlist;
CREATE POLICY "Users can view their own wishlist"
  ON wishlist FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add to their wishlist" ON wishlist;
CREATE POLICY "Users can add to their wishlist"
  ON wishlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove from their wishlist" ON wishlist;
CREATE POLICY "Users can remove from their wishlist"
  ON wishlist FOR DELETE
  USING (auth.uid() = user_id);

-- 6. GRANT PERMISSIONS
GRANT ALL ON wishlist TO authenticated;

-- 7. UPDATE SOME PRODUCTS TO BE FEATURED/BESTSELLERS (Sample Data)
-- Randomly mark some products as featured
UPDATE products 
SET is_featured = TRUE 
WHERE id IN (
  SELECT id FROM products ORDER BY RANDOM() LIMIT 6
);

-- Randomly mark some products as bestsellers
UPDATE products 
SET is_bestseller = TRUE 
WHERE id IN (
  SELECT id FROM products WHERE NOT is_featured ORDER BY RANDOM() LIMIT 6
);

-- Set random ratings for products
UPDATE products 
SET rating = (RANDOM() * 1.5 + 3.5)::NUMERIC(3,2)
WHERE rating = 0 OR rating IS NULL;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check featured products
SELECT COUNT(*) as featured_count FROM products WHERE is_featured = TRUE;

-- Check bestsellers
SELECT COUNT(*) as bestseller_count FROM products WHERE is_bestseller = TRUE;

-- Check ratings
SELECT COUNT(*) as rated_count FROM products WHERE rating > 0;

-- Check wishlist table
SELECT COUNT(*) FROM wishlist;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
