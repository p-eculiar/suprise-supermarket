-- Diagnose why homepage product sections are empty
-- Run this whole script in Supabase SQL Editor and share the results.

-- 0) Ensure we are in the public schema
set search_path to public;

-- 1) Does the products table exist and what columns does it have?
select
  c.table_schema,
  c.table_name,
  c.column_name,
  c.data_type,
  c.is_nullable,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = 'products'
order by c.ordinal_position;

-- Expected (at least) columns used by the app:
-- id (uuid/text), name (text), description (text), price (numeric), image_url (text),
-- category (text), stock (int), rating (numeric), featured (boolean), active (boolean), created_at (timestamp)

-- 2) Total rows and key health checks
select
  count(*)                                  as total_rows,
  sum(case when coalesce(name, '') = '' then 1 else 0 end)          as missing_name,
  sum(case when image_url is null or image_url = '' then 1 else 0 end) as missing_image_url,
  sum(case when category is null or trim(category) = '' then 1 else 0 end) as missing_category,
  sum(case when price is null or price <= 0 then 1 else 0 end)      as invalid_price,
  sum(case when stock is null then 1 else 0 end)                    as missing_stock,
  sum(case when rating is null then 1 else 0 end)                   as missing_rating,
  sum(case when featured is true then 1 else 0 end)                 as featured_count,
  sum(case when active is true then 1 else 0 end)                   as active_count
from products;

-- 3) What would the three homepage lists return right now?
-- Featured (productService.getFeaturedProducts)
select id, name, price, image_url, category, stock, rating, featured, active, created_at
from products
where featured = true
order by created_at desc
limit 6;

-- Best Sellers (productService.getBestSellers: ordered by rating desc)
select id, name, price, image_url, category, stock, rating, featured, active, created_at
from products
order by rating desc nulls last, created_at desc
limit 6;

-- Popular (productService.getPopularProducts: ordered by stock desc)
select id, name, price, image_url, category, stock, rating, featured, active, created_at
from products
order by stock desc nulls last, created_at desc
limit 6;

-- 4) Rows missing image_url (these will not render images on the homepage)
select id, name, category, price, stock, rating
from products
where image_url is null or image_url = ''
order by created_at desc
limit 20;

-- 5) Category distribution (used by the homepage filters)
select category, count(*) as cnt
from products
group by category
order by cnt desc nulls last;

-- 6) Optional: quick sanity preview of 10 most recent rows
select id, name, price, image_url, category, stock, rating, featured, active, created_at
from products
order by created_at desc
limit 10;

-- If the lists above are empty, likely causes:
-- - No rows have featured = true (featured section empty)
-- - rating is null for many rows (best sellers sort yields unexpected items)
-- - image_url is null/blank (no images displayed)
-- - stock is null/0 everywhere (popular list may still show but with low stock)
-- Share the outputs and I will tailor fixes/migrations accordingly.


