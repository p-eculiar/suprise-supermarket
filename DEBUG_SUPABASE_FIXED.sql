-- Let's check if we can connect to Supabase and fetch data
-- Test products query
SELECT COUNT(*) as product_count FROM products;

-- Test categories query
SELECT COUNT(*) as category_count FROM categories;

-- Test navigation_items query
SELECT COUNT(*) as nav_count FROM navigation_items;

-- Test a simple query on a table that should work
SELECT COUNT(*) as user_count FROM profiles;

-- Check if RLS is enabled on any tables
SELECT relname, relrowsecurity 
FROM pg_class c 
JOIN pg_namespace n ON n.oid = c.relnamespace 
WHERE n.nspname = 'public' AND relrowsecurity = true;