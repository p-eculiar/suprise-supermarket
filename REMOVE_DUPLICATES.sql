-- SQL script to remove duplicate products from the database
-- This script identifies and removes duplicate products based on name, price, and category

-- First, let's check how many duplicates we have
WITH duplicates AS (
  SELECT 
    name, 
    price, 
    category,
    COUNT(*) as duplicate_count
  FROM products
  GROUP BY name, price, category
  HAVING COUNT(*) > 1
)
SELECT COUNT(*) as total_duplicate_groups FROM duplicates;

-- Now, let's identify all duplicate products and keep only the one with the earliest created_at timestamp
WITH ranked_products AS (
  SELECT 
    id,
    name,
    price,
    category,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY name, price, category 
      ORDER BY created_at ASC
    ) as rn
  FROM products
)
DELETE FROM products 
WHERE id IN (
  SELECT id 
  FROM ranked_products 
  WHERE rn > 1
);

-- Verify the results by checking for any remaining duplicates
WITH duplicates AS (
  SELECT 
    name, 
    price, 
    category,
    COUNT(*) as duplicate_count
  FROM products
  GROUP BY name, price, category
  HAVING COUNT(*) > 1
)
SELECT 
  name,
  price,
  category,
  duplicate_count
FROM duplicates
ORDER BY duplicate_count DESC;

-- Show the total count of products after cleanup
SELECT COUNT(*) as total_products_after_cleanup FROM products;