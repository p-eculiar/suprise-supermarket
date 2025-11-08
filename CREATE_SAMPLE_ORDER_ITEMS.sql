-- Create sample order items for the bank transfer orders
-- First check the structure of the order_items table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;

-- Check if the sample orders exist
SELECT id, order_number FROM orders WHERE id IN (
    'a1b2c3d4-e5f6-7890-1234-567890123456',
    'b2c3d4e5-f6a7-8901-2345-678901234567',
    'c3d4e5f6-a7b8-9012-3456-789012345678'
);

-- Create sample order items for the bank transfer orders
INSERT INTO order_items (
    id,
    order_id,
    product_id,
    product_name,
    sku,
    quantity,
    price,
    discount,
    tax,
    total
) VALUES 
-- Order items for order BT001
(
    'a1b2c3d4-e5f6-7890-1234-567890123457',
    'a1b2c3d4-e5f6-7890-1234-567890123456',
    'prod-001',
    'Organic Brown Rice',
    'RICE-001',
    2,
    7500.00,
    0.00,
    375.00,
    15375.00
),
(
    'a1b2c3d4-e5f6-7890-1234-567890123458',
    'a1b2c3d4-e5f6-7890-1234-567890123456',
    'prod-002',
    'Fresh Milk',
    'MILK-001',
    1,
    2000.00,
    0.00,
    100.00,
    2100.00
),
-- Order items for order BT002
(
    'b2c3d4e5-f6a7-8901-2345-678901234568',
    'b2c3d4e5-f6a7-8901-2345-678901234567',
    'prod-003',
    'Whole Wheat Bread',
    'BREAD-001',
    3,
    3500.00,
    200.00,
    199.50,
    10799.50
),
(
    'b2c3d4e5-f6a7-8901-2345-678901234569',
    'b2c3d4e5-f6a7-8901-2345-678901234567',
    'prod-004',
    'Fresh Eggs',
    'EGGS-001',
    2,
    2000.00,
    0.00,
    200.00,
    4200.00
),
(
    'b2c3d4e5-f6a7-8901-2345-678901234570',
    'b2c3d4e5-f6a7-8901-2345-678901234567',
    'prod-005',
    'Banana',
    'FRUIT-001',
    5,
    500.00,
    0.00,
    125.00,
    2625.00
),
-- Order items for order BT003
(
    'c3d4e5f6-a7b8-9012-3456-789012345679',
    'c3d4e5f6-a7b8-9012-3456-789012345678',
    'prod-006',
    'Tomato',
    'VEG-001',
    3,
    1500.00,
    0.00,
    225.00,
    4725.00
),
(
    'c3d4e5f6-a7b8-9012-3456-789012345680',
    'c3d4e5f6-a7b8-9012-3456-789012345678',
    'prod-007',
    'Onion',
    'VEG-002',
    2,
    2000.00,
    0.00,
    300.00,
    4300.00
)
ON CONFLICT (id) DO UPDATE SET
    order_id = EXCLUDED.order_id,
    product_name = EXCLUDED.product_name,
    quantity = EXCLUDED.quantity,
    price = EXCLUDED.price,
    total = EXCLUDED.total;

-- Verify the order items were created
SELECT 
    oi.id,
    oi.order_id,
    o.order_number,
    oi.product_name,
    oi.quantity,
    oi.price,
    oi.total
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE oi.order_id IN (
    'a1b2c3d4-e5f6-7890-1234-567890123456',
    'b2c3d4e5-f6a7-8901-2345-678901234567',
    'c3d4e5f6-a7b8-9012-3456-789012345678'
)
ORDER BY oi.order_id, oi.id;