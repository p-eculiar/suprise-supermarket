-- Insert more sample invoices
INSERT INTO invoices (order_id, invoice_number, customer_name, customer_email, items, subtotal, tax, delivery_fee, discount, total, payment_method, payment_status, order_date, due_date, status)
VALUES 
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'INV-002', 'Jane Smith', 'jane@example.com', '[{"name": "Organic Tomatoes", "quantity": 2, "price": 4.99}]', 9.98, 0.80, 5.00, 0.00, 15.78, 'paystack', 'paid', NOW(), NOW() + INTERVAL '30 days', 'paid'),
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'INV-003', 'Bob Johnson', 'bob@example.com', '[{"name": "Premium Beef", "quantity": 1, "price": 15.99}]', 15.99, 1.28, 5.00, 0.00, 22.27, 'bank_transfer', 'pending', NOW(), NOW() + INTERVAL '30 days', 'pending')
ON CONFLICT (invoice_number) DO NOTHING;

-- Insert more sample receipts
INSERT INTO receipts (order_id, receipt_number, customer_name, customer_email, items, subtotal, tax, delivery_fee, discount, total, payment_method, payment_status, payment_date, transaction_reference)
VALUES 
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'REC-002', 'Jane Smith', 'jane@example.com', '[{"name": "Organic Tomatoes", "quantity": 2, "price": 4.99}]', 9.98, 0.80, 5.00, 0.00, 15.78, 'paystack', 'paid', NOW(), 'txn_987654321'),
  ('12a93c70-9831-4d63-a7e4-d0431ae6a049', 'REC-003', 'Bob Johnson', 'bob@example.com', '[{"name": "Premium Beef", "quantity": 1, "price": 15.99}]', 15.99, 1.28, 5.00, 0.00, 22.27, 'bank_transfer', 'pending', NOW(), 'txn_456789123')
ON CONFLICT (receipt_number) DO NOTHING;

-- Verify the data
SELECT COUNT(*) as total_invoices FROM invoices;
SELECT COUNT(*) as total_receipts FROM receipts;
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5;
SELECT * FROM receipts ORDER BY created_at DESC LIMIT 5;