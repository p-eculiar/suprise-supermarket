-- Test products query
SELECT COUNT(*) as product_count FROM products;

-- Test categories query
SELECT COUNT(*) as category_count FROM categories;

-- Test navigation_items query
SELECT COUNT(*) as nav_count FROM navigation_items;

-- Test a simple query on a table that should work
SELECT COUNT(*) as user_count FROM profiles;