-- Comprehensive SQL script to remove duplicate products from the database
-- This script identifies and removes duplicate products based on name, price, and category
-- It provides detailed reporting and handles edge cases

-- Step 1: Create a temporary table to store IDs of products to keep
-- We'll keep the product with the earliest created_at timestamp for each group
CREATE TEMP TABLE products_to_keep AS
SELECT DISTINCT ON (LOWER(TRIM(name)), price, LOWER(TRIM(category))) 
  id,
  name,
  price,
  category,
  created_at
FROM products
ORDER BY LOWER(TRIM(name)), price, LOWER(TRIM(category)), created_at ASC;

-- Step 2: Count how many products we'll be removing
WITH all_products AS (
  SELECT id FROM products
),
products_to_delete AS (
  SELECT p.id 
  FROM products p
  LEFT JOIN products_to_keep k ON p.id = k.id
  WHERE k.id IS NULL
)
SELECT COUNT(*) as products_to_remove FROM products_to_delete;

-- Step 3: Delete the duplicate products
DELETE FROM products 
WHERE id IN (
  SELECT p.id 
  FROM products p
  LEFT JOIN products_to_keep k ON p.id = k.id
  WHERE k.id IS NULL
);

-- Step 4: Verify no duplicates remain
WITH duplicate_groups AS (
  SELECT 
    LOWER(TRIM(name)) as normalized_name,
    price,
    LOWER(TRIM(category)) as normalized_category,
    COUNT(*) as count
  FROM products
  GROUP BY LOWER(TRIM(name)), price, LOWER(TRIM(category))
  HAVING COUNT(*) > 1
)
SELECT 
  COUNT(*) as remaining_duplicate_groups,
  SUM(count) as total_duplicate_products
FROM duplicate_groups;

-- Step 5: Show final product count
SELECT COUNT(*) as final_product_count FROM products;

-- Step 6: Show sample of remaining products
SELECT 
  name,
  price,
  category,
  created_at
FROM products
ORDER BY name
LIMIT 20;

-- Clean up temporary table
DROP TABLE products_to_keep;