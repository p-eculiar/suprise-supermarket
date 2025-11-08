-- Check if payment_transactions table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'payment_transactions';

-- If it exists, check its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'payment_transactions'
ORDER BY ordinal_position;

-- Check if there are any records in the payment_transactions table
SELECT COUNT(*) as count FROM payment_transactions;

-- Check the structure of the orders table to understand payment fields
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name ILIKE '%payment%'
ORDER BY ordinal_position;