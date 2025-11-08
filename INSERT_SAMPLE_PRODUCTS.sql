-- =====================================================
-- INSERT SAMPLE PRODUCTS WITH PROFESSIONAL IMAGES
-- =====================================================
-- These are placeholder products with Unsplash images
-- You can update them later through the admin dashboard

-- First, make sure the products table has all required columns
-- Run ADD_MISSING_COLUMNS.sql first if you haven't already

-- 1. VEGETABLES (10 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Organic Tomatoes', 'Fresh, juicy organic tomatoes perfect for salads and cooking', 5.99, 'Vegetables', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500&auto=format&fit=crop&q=80', 150, true, false, 4.8, 0),
('Fresh Lettuce', 'Crisp green lettuce, perfect for fresh salads', 3.49, 'Vegetables', 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=80', 200, true, true, 4.5, 10),
('Bell Peppers Mix', 'Colorful mix of red, yellow, and green bell peppers', 6.99, 'Vegetables', 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=500&auto=format&fit=crop&q=80', 120, false, true, 4.7, 0),
('Fresh Carrots', 'Sweet, crunchy organic carrots rich in vitamins', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=80', 180, false, false, 4.6, 0),
('Broccoli Crowns', 'Fresh broccoli crowns, nutrient-packed', 4.49, 'Vegetables', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=80', 90, false, true, 4.5, 15),
('Red Onions', 'Fresh red onions, adds flavor to any dish', 3.29, 'Vegetables', 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?w=500&auto=format&fit=crop&q=80', 160, false, false, 4.3, 0),
('Fresh Spinach', 'Tender baby spinach leaves, iron-rich', 4.99, 'Vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=80', 100, true, false, 4.7, 0),
('Cucumber', 'Fresh, crispy cucumbers', 2.49, 'Vegetables', 'https://images.unsplash.com/photo-1604977042122-4ee9ce0e18d8?w=500&auto=format&fit=crop&q=80', 140, false, false, 4.4, 0),
('Zucchini', 'Fresh green zucchini', 3.99, 'Vegetables', 'https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=500&auto=format&fit=crop&q=80', 110, false, false, 4.5, 0),
('Fresh Cauliflower', 'White cauliflower heads, versatile vegetable', 5.49, 'Vegetables', 'https://images.unsplash.com/photo-1568584711743-99df7ab7b0e3?w=500&auto=format&fit=crop&q=80', 80, false, false, 4.6, 0);

-- 2. FRUITS (10 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Fresh Strawberries', 'Sweet, juicy strawberries - perfect for desserts', 6.99, 'Fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80', 100, true, true, 5.0, 20),
('Organic Bananas', 'Ripe organic bananas, great source of potassium', 3.99, 'Fruits', 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80', 250, false, true, 4.8, 0),
('Green Apples', 'Crisp Granny Smith apples, perfect for snacking', 5.49, 'Fruits', 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=80', 180, true, false, 4.7, 0),
('Fresh Oranges', 'Juicy Valencia oranges, vitamin C rich', 7.99, 'Fruits', 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=500&auto=format&fit=crop&q=80', 150, false, true, 4.9, 15),
('Red Grapes', 'Sweet seedless red grapes', 8.99, 'Fruits', 'https://images.unsplash.com/photo-1599819177795-d961994799f1?w=500&auto=format&fit=crop&q=80', 120, false, false, 4.6, 0),
('Pineapple', 'Fresh tropical pineapple, sweet and tangy', 12.99, 'Fruits', 'https://images.unsplash.com/photo-1550828486-856334bc2f7e?w=500&auto=format&fit=crop&q=80', 60, false, false, 4.8, 0),
('Fresh Watermelon', 'Large, juicy watermelon - summer favorite', 9.99, 'Fruits', 'https://images.unsplash.com/photo-1587049352846-4a222e784fe4?w=500&auto=format&fit=crop&q=80', 40, true, true, 4.9, 10),
('Blueberries', 'Fresh blueberries, antioxidant-rich superfood', 9.49, 'Fruits', 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=500&auto=format&fit=crop&q=80', 90, false, true, 5.0, 0),
('Mango', 'Sweet tropical mangoes, ripe and ready', 4.99, 'Fruits', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&auto=format&fit=crop&q=80', 70, false, false, 4.7, 0),
('Fresh Lemons', 'Juicy lemons, perfect for cooking and drinks', 4.49, 'Fruits', 'https://images.unsplash.com/photo-1590502593747-42a996133562?w=500&auto=format&fit=crop&q=80', 130, false, false, 4.5, 0);

-- 3. DAIRY (5 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Fresh Whole Milk', 'Farm-fresh whole milk, vitamin D fortified', 4.99, 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80', 200, true, true, 4.9, 0),
('Greek Yogurt', 'Thick and creamy Greek yogurt, high protein', 6.49, 'Dairy', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=80', 150, false, true, 4.8, 0),
('Cheddar Cheese Block', 'Sharp cheddar cheese, aged to perfection', 8.99, 'Dairy', 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=500&auto=format&fit=crop&q=80', 100, false, false, 4.7, 0),
('Organic Butter', 'Creamy organic butter, perfect for baking', 7.49, 'Dairy', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=80', 120, false, true, 4.8, 0),
('Farm Fresh Eggs', 'Free-range eggs, dozen pack', 5.99, 'Dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=80', 180, true, false, 4.9, 0);

-- 4. BAKERY (5 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Whole Wheat Bread', 'Freshly baked whole wheat bread loaf', 4.49, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', 80, true, false, 4.6, 0),
('Butter Croissants', 'Flaky French butter croissants, pack of 6', 8.99, 'Bakery', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&auto=format&fit=crop&q=80', 50, false, true, 5.0, 0),
('Bagels Assorted', 'Fresh bagels - plain, sesame, poppy seed (6 pack)', 6.99, 'Bakery', 'https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=500&auto=format&fit=crop&q=80', 60, false, false, 4.7, 0),
('Chocolate Muffins', 'Rich chocolate chip muffins, pack of 4', 7.49, 'Bakery', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&auto=format&fit=crop&q=80', 40, false, false, 4.8, 15),
('Artisan Sourdough', 'Traditional sourdough bread, crusty exterior', 9.99, 'Bakery', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500&auto=format&fit=crop&q=80', 30, false, true, 4.9, 0);

-- 5. MEAT & SEAFOOD (5 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Fresh Chicken Breast', 'Boneless, skinless chicken breast, per lb', 12.99, 'Meat', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80', 80, false, true, 4.7, 0),
('Ground Beef', 'Lean ground beef, 90/10, per lb', 14.99, 'Meat', 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=500&auto=format&fit=crop&q=80', 60, false, false, 4.6, 0),
('Fresh Salmon Fillets', 'Wild-caught salmon fillets, per lb', 22.99, 'Seafood', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80', 40, true, true, 4.9, 0),
('Shrimp Jumbo', 'Fresh jumbo shrimp, peeled and deveined, per lb', 18.99, 'Seafood', 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=500&auto=format&fit=crop&q=80', 50, false, false, 4.8, 10),
('Pork Chops', 'Center-cut pork chops, per lb', 11.99, 'Meat', 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=500&auto=format&fit=crop&q=80', 70, false, false, 4.5, 0);

-- 6. BEVERAGES (5 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Orange Juice', 'Fresh-squeezed orange juice, no added sugar (1L)', 7.99, 'Beverages', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80', 100, false, true, 4.8, 0),
('Green Tea', 'Premium green tea leaves, 100 bags', 9.49, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80', 80, false, false, 4.6, 0),
('Coconut Water', 'Pure coconut water, 6-pack', 12.99, 'Beverages', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80', 60, false, false, 4.7, 0),
('Cold Brew Coffee', 'Organic cold brew coffee concentrate (32oz)', 11.99, 'Beverages', 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&auto=format&fit=crop&q=80', 50, true, false, 4.9, 0),
('Sparkling Water', 'Flavored sparkling water, 12-pack', 8.99, 'Beverages', 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500&auto=format&fit=crop&q=80', 120, false, true, 4.5, 0);

-- 7. SNACKS (5 products)
INSERT INTO products (name, description, price, category, image_url, stock, is_featured, is_bestseller, rating, discount) VALUES
('Organic Chips', 'Kettle-cooked organic potato chips', 5.49, 'Snacks', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80', 150, false, true, 4.7, 0),
('Mixed Nuts', 'Roasted mixed nuts, lightly salted (16oz)', 12.99, 'Snacks', 'https://images.unsplash.com/photo-1508747703725-719777637510?w=500&auto=format&fit=crop&q=80', 90, true, true, 4.9, 0),
('Granola Bars', 'Chewy granola bars, variety pack (12 bars)', 8.49, 'Snacks', 'https://images.unsplash.com/photo-1606312619070-d48b4cbc5e0f?w=500&auto=format&fit=crop&q=80', 110, false, false, 4.6, 0),
('Dark Chocolate Bar', 'Premium 70% dark chocolate', 4.99, 'Snacks', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500&auto=format&fit=crop&q=80', 130, false, false, 4.8, 0),
('Popcorn Kernels', 'Organic popcorn kernels (2lb bag)', 6.99, 'Snacks', 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&auto=format&fit=crop&q=80', 100, false, false, 4.5, 0);

-- Verify insertion
SELECT category, COUNT(*) as product_count, 
       SUM(CASE WHEN is_featured THEN 1 ELSE 0 END) as featured_count,
       SUM(CASE WHEN is_bestseller THEN 1 ELSE 0 END) as bestseller_count
FROM products
GROUP BY category
ORDER BY category;

-- =====================================================
-- SAMPLE PRODUCTS INSERTED!
-- Total: 50 products across 7 categories
-- All with professional Unsplash images
-- =====================================================
