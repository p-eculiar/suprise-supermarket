-- First create the payment_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    reference TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    provider TEXT NOT NULL,
    provider_reference TEXT,
    status TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order_id ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(reference);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);

-- Check if we have any users to associate with these orders
SELECT id, email FROM auth.users LIMIT 5;

-- Create sample bank transfer orders with valid UUIDs
INSERT INTO orders (
    id,
    order_number,
    user_id,
    customer_name,
    customer_email,
    customer_phone,
    delivery_address,
    delivery_city,
    delivery_state,
    subtotal,
    tax,
    delivery_fee,
    discount,
    total,
    status,
    payment_status,
    payment_method,
    bank_transfer_details,
    created_at
) VALUES 
(
    'a1b2c3d4-e5f6-7890-1234-567890123456',  -- Valid UUID
    'BT001',
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3',  -- Test user ID
    'John Doe',
    'john.doe@example.com',
    '+2348012345678',
    '123 Main Street',
    'Lagos',
    'Lagos',
    15000.00,
    750.00,
    1500.00,
    0.00,
    17250.00,
    'pending',
    'pending',
    'bank_transfer',
    '{"bank_name": "First Bank", "account_number": "1234567890", "account_name": "John Doe"}',
    NOW() - INTERVAL '1 day'
),
(
    'b2c3d4e5-f6a7-8901-2345-678901234567',  -- Valid UUID
    'BT002',
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3',  -- Test user ID
    'Jane Smith',
    'jane.smith@example.com',
    '+2348098765432',
    '456 Oak Avenue',
    'Abuja',
    'FCT',
    25000.00,
    1250.00,
    2000.00,
    500.00,
    27750.00,
    'pending',
    'pending',
    'bank_transfer',
    '{"bank_name": "GTBank", "account_number": "0987654321", "account_name": "Jane Smith"}',
    NOW() - INTERVAL '2 hours'
),
(
    'c3d4e5f6-a7b8-9012-3456-789012345678',  -- Valid UUID
    'BT003',
    '0295638e-27f2-45eb-ac0b-be7d8f2d0bf3',  -- Test user ID
    'Mike Johnson',
    'mike.johnson@example.com',
    '+2348055556666',
    '789 Pine Road',
    'Port Harcourt',
    'Rivers',
    8500.00,
    425.00,
    1000.00,
    200.00,
    9725.00,
    'pending',
    'pending',
    'bank_transfer',
    '{"bank_name": "Access Bank", "account_number": "1122334455", "account_name": "Mike Johnson"}',
    NOW() - INTERVAL '30 minutes'
)
ON CONFLICT (id) DO UPDATE SET
    order_number = EXCLUDED.order_number,
    customer_name = EXCLUDED.customer_name,
    customer_email = EXCLUDED.customer_email,
    total = EXCLUDED.total,
    payment_status = EXCLUDED.payment_status,
    bank_transfer_details = EXCLUDED.bank_transfer_details;

-- Verify the orders were created
SELECT 
    id,
    order_number,
    customer_name,
    total,
    payment_method,
    payment_status,
    bank_transfer_details,
    created_at
FROM orders
WHERE payment_method = 'bank_transfer'
ORDER BY created_at DESC;