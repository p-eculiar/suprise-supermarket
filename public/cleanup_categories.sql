-- Clean up categories table to only include categories that exist in products
-- First, let's see what categories actually exist in products
SELECT DISTINCT category 
FROM products 
WHERE category IS NOT NULL 
AND category != ''
AND active = true
ORDER BY category;

-- Delete all categories that don't match actual product categories
DELETE FROM categories 
WHERE name NOT IN (
  SELECT DISTINCT category 
  FROM products 
  WHERE category IS NOT NULL 
  AND category != ''
  AND active = true
);

-- For categories that do match, update their product counts
UPDATE categories 
SET product_count = (
  SELECT COUNT(*) 
  FROM products 
  WHERE products.category = categories.name 
  AND products.active = true
)
WHERE name IN (
  SELECT DISTINCT category 
  FROM products 
  WHERE category IS NOT NULL 
  AND category != ''
  AND active = true
);