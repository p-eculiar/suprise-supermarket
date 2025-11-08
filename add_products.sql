-- Add sample products with images from the internet
INSERT INTO products (name, description, price, category, image_url, stock, rating, featured, active)
VALUES
  ('Fresh Organic Tomatoes', 'Locally sourced organic tomatoes, perfect for salads and cooking', 4.99, 'Vegetables', 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 100, 4.7, true, true),
  ('Premium Beef Steak', 'High-quality beef steak, perfect for grilling', 15.99, 'Meat', 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 50, 4.9, true, true),
  ('Organic Bananas', 'Sweet and nutritious organic bananas', 3.49, 'Fruits', 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 150, 4.5, true, true),
  ('Fresh Milk', 'Farm-fresh whole milk', 2.99, 'Dairy', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 80, 4.6, true, true),
  ('Whole Grain Bread', 'Freshly baked whole grain bread', 3.99, 'Bakery', 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 60, 4.4, false, true),
  ('Fresh Apples', 'Crisp and juicy apples', 4.49, 'Fruits', 'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 120, 4.7, false, true),
  ('Organic Carrots', 'Fresh organic carrots', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 90, 4.5, false, true),
  ('Free-Range Eggs', 'Farm-fresh free-range eggs', 5.99, 'Dairy', 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 100, 4.8, false, true),
  ('Organic Spinach', 'Fresh organic spinach', 3.49, 'Vegetables', 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 70, 4.6, false, true),
  ('Premium Cheese', 'Artisanal cheese selection', 8.99, 'Dairy', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 40, 4.9, false, true),
  ('Fresh Strawberries', 'Sweet and juicy strawberries', 6.99, 'Fruits', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 60, 4.7, true, true),
  ('Organic Avocados', 'Ripe and ready-to-eat avocados', 7.99, 'Fruits', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 50, 4.8, false, true),
  ('Fresh Salmon', 'Premium quality fresh salmon', 12.99, 'Seafood', 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 30, 4.9, true, true),
  ('Organic Chicken', 'Free-range organic chicken', 9.99, 'Meat', 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 40, 4.7, false, true),
  ('Fresh Oranges', 'Juicy and sweet oranges', 4.99, 'Fruits', 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab12?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 80, 4.6, false, true),
  ('Organic Potatoes', 'Fresh organic potatoes', 3.99, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 100, 4.5, false, true),
  ('Premium Chocolate', 'Luxury dark chocolate', 6.99, 'Snacks', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 60, 4.8, true, true),
  ('Fresh Broccoli', 'Crisp and fresh broccoli', 2.99, 'Vegetables', 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 70, 4.4, false, true),
  ('Organic Honey', 'Pure organic honey', 8.99, 'Pantry', 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 40, 4.9, false, true),
  ('Fresh Grapes', 'Sweet and juicy grapes', 5.99, 'Fruits', 'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', 60, 4.7, false, true);