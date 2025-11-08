-- Safe SQL script to identify duplicates without removing them
-- Run this first to see what would be deleted

-- Step 1: Identify all duplicate groups
WITH duplicate_groups AS (
  SELECT 
    LOWER(TRIM(name)) as normalized_name,
    price,
    LOWER(TRIM(category)) as normalized_category,
    COUNT(*) as duplicate_count
  FROM products
  GROUP BY LOWER(TRIM(name)), price, LOWER(TRIM(category))
  HAVING COUNT(*) > 1
)
SELECT 
  COUNT(*) as total_duplicate_groups,
  SUM(duplicate_count) as total_duplicate_products
FROM duplicate_groups;

-- Step 2: Show detailed information about duplicates
WITH duplicate_groups AS (
  SELECT 
    LOWER(TRIM(name)) as normalized_name,
    price,
    LOWER(TRIM(category)) as normalized_category,
    COUNT(*) as duplicate_count
  FROM products
  GROUP BY LOWER(TRIM(name)), price, LOWER(TRIM(category))
  HAVING COUNT(*) > 1
)
SELECT 
  p.name,
  p.price,
  p.category,
  dg.duplicate_count,
  p.created_at,
  p.id
FROM products p
JOIN duplicate_groups dg ON 
  LOWER(TRIM(p.name)) = dg.normalized_name AND
  p.price = dg.price AND
  LOWER(TRIM(p.category)) = dg.normalized_category
ORDER BY p.name, p.created_at;

-- Step 3: Show which products would be kept (earliest created)
WITH ranked_products AS (
  SELECT 
    id,
    name,
    price,
    category,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(name)), price, LOWER(TRIM(category)) 
      ORDER BY created_at ASC
    ) as rn
  FROM products
)
SELECT 
  id,
  name,
  price,
  category,
  created_at,
  'KEEP' as action
FROM ranked_products 
WHERE rn = 1
AND (LOWER(TRIM(name)), price, LOWER(TRIM(category))) IN (
  SELECT LOWER(TRIM(name)), price, LOWER(TRIM(category))
  FROM products
  GROUP BY LOWER(TRIM(name)), price, LOWER(TRIM(category))
  HAVING COUNT(*) > 1
)
ORDER BY name;

-- Step 4: Show which products would be deleted (not earliest created)
WITH ranked_products AS (
  SELECT 
    id,
    name,
    price,
    category,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(name)), price, LOWER(TRIM(category)) 
      ORDER BY created_at ASC
    ) as rn
  FROM products
)
SELECT 
  id,
  name,
  price,
  category,
  created_at,
  'DELETE' as action
FROM ranked_products 
WHERE rn > 1
ORDER BY name, created_at;