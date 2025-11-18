-- This script will help diagnose what's actually in your categories and products tables

-- 1. Check what categories exist in the categories table
SELECT 
    name as category_name,
    image_url
FROM categories 
ORDER BY name;

-- 2. Check what categories actually exist in your products table
SELECT 
    category as category_name, 
    COUNT(*) as product_count
FROM products 
WHERE category IS NOT NULL AND category != ''
GROUP BY category
ORDER BY product_count DESC;

-- 3. Check the products without categories
SELECT 
    id, 
    name, 
    category,
    active
FROM products 
WHERE category IS NULL OR category = ''
ORDER BY created_at DESC;

-- 4. Check total product counts
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN category IS NOT NULL AND category != '' THEN 1 END) as products_with_category,
    COUNT(CASE WHEN category IS NULL OR category = '' THEN 1 END) as products_without_category,
    COUNT(CASE WHEN active = true THEN 1 END) as active_products,
    COUNT(CASE WHEN active = false THEN 1 END) as inactive_products
FROM products;

-- 5. Check if there are any duplicate categories (case sensitivity issues)
SELECT 
    TRIM(LOWER(category)) as normalized_category,
    COUNT(*) as count
FROM products 
WHERE category IS NOT NULL AND category != ''
GROUP BY TRIM(LOWER(category))
HAVING COUNT(*) > 1
ORDER BY count DESC;