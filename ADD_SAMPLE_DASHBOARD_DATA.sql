-- Add sample orders for testing dashboard
INSERT INTO orders (
  id,
  order_number,
  customer_name,
  customer_email,
  customer_phone,
  delivery_address,
  delivery_city,
  delivery_state,
  delivery_postal_code,
  subtotal,
  tax,
  delivery_fee,
  discount,
  total,
  status,
  payment_status,
  payment_method,
  created_at
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'ORD-001',
  'John Doe',
  'john.doe@example.com',
  '+1234567890',
  '123 Main St',
  'Lagos',
  'Lagos',
  '100001',
  100.00,
  7.50,
  5.00,
  0.00,
  112.50,
  'completed',
  'paid',
  'card',
  NOW() - INTERVAL '1 day'
),
(
  '22222222-2222-2222-2222-222222222222',
  'ORD-002',
  'Jane Smith',
  'jane.smith@example.com',
  '+1234567891',
  '456 Oak Ave',
  'Abuja',
  'FCT',
  '100002',
  75.00,
  5.63,
  5.00,
  0.00,
  85.63,
  'completed',
  'paid',
  'card',
  NOW() - INTERVAL '2 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'ORD-003',
  'Bob Johnson',
  'bob.johnson@example.com',
  '+1234567892',
  '789 Pine Rd',
  'Port Harcourt',
  'Rivers',
  '100003',
  150.00,
  11.25,
  5.00,
  10.00,
  156.25,
  'processing',
  'pending',
  'bank_transfer',
  NOW() - INTERVAL '3 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'ORD-004',
  'Alice Brown',
  'alice.brown@example.com',
  '+1234567893',
  '321 Elm St',
  'Kano',
  'Kano',
  '100004',
  200.00,
  15.00,
  5.00,
  0.00,
  220.00,
  'pending',
  'pending',
  'card',
  NOW() - INTERVAL '4 days'
),
(
  '55555555-5555-5555-5555-555555555555',
  'ORD-005',
  'Charlie Wilson',
  'charlie.wilson@example.com',
  '+1234567894',
  '654 Maple Dr',
  'Ibadan',
  'Oyo',
  '100005',
  50.00,
  3.75,
  5.00,
  0.00,
  58.75,
  'completed',
  'paid',
  'card',
  NOW() - INTERVAL '5 days'
)
ON CONFLICT DO NOTHING;

-- Add sample order items
INSERT INTO order_items (
  id,
  order_id,
  product_id,
  product_name,
  quantity,
  price
) VALUES 
-- Order 1 items
(
  '11111111-1111-1111-1111-111111111112',
  '11111111-1111-1111-1111-111111111111',
  (SELECT id FROM products LIMIT 1),
  (SELECT name FROM products LIMIT 1),
  2,
  50.00
),
-- Order 2 items
(
  '22222222-2222-2222-2222-222222222223',
  '22222222-2222-2222-2222-222222222222',
  (SELECT id FROM products LIMIT 1 OFFSET 1),
  (SELECT name FROM products LIMIT 1 OFFSET 1),
  1,
  75.00
),
-- Order 3 items
(
  '33333333-3333-3333-3333-333333333334',
  '33333333-3333-3333-3333-333333333333',
  (SELECT id FROM products LIMIT 1 OFFSET 2),
  (SELECT name FROM products LIMIT 1 OFFSET 2),
  3,
  50.00
),
-- Order 4 items
(
  '44444444-4444-4444-4444-444444444445',
  '44444444-4444-4444-4444-444444444444',
  (SELECT id FROM products LIMIT 1 OFFSET 3),
  (SELECT name FROM products LIMIT 1 OFFSET 3),
  4,
  50.00
),
-- Order 5 items
(
  '55555555-5555-5555-5555-555555555556',
  '55555555-5555-5555-5555-555555555555',
  (SELECT id FROM products LIMIT 1 OFFSET 4),
  (SELECT name FROM products LIMIT 1 OFFSET 4),
  1,
  50.00
)
ON CONFLICT DO NOTHING;

-- Update product stock for testing inventory alerts
UPDATE products 
SET stock = 2 
WHERE id IN (SELECT id FROM products LIMIT 5);

-- Insert sample inventory alerts
INSERT INTO inventory_alerts (
  product_id,
  product_name,
  current_stock,
  threshold,
  alert_type,
  resolved
) 
SELECT 
  id as product_id,
  name as product_name,
  stock as current_stock,
  5 as threshold,
  'low_stock' as alert_type,
  FALSE as resolved
FROM products 
WHERE stock <= 5
LIMIT 3
ON CONFLICT DO NOTHING;