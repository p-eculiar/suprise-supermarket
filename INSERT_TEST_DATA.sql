-- Insert test feedback data (you'll need to replace 'user_id' with an actual user ID)
INSERT INTO feedback (user_id, rating, category, message)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 5, 'Product Quality', 'Great products!'),
  ('00000000-0000-0000-0000-000000000000', 4, 'Delivery Service', 'Fast delivery'),
  ('00000000-0000-0000-0000-000000000000', 3, 'Customer Support', 'Average support experience');

-- Insert test messages data (you'll need to replace 'user_id' with an actual user ID)
INSERT INTO messages (user_id, subject, message, status)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'Order Inquiry', 'I have a question about my order', 'open'),
  ('00000000-0000-0000-0000-000000000000', 'Product Issue', 'I received a damaged product', 'open'),
  ('00000000-0000-0000-0000-000000000000', 'Return Request', 'I want to return an item', 'replied');