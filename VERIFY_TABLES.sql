-- Check if invoices table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'invoices';

-- Check if receipts table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'receipts';

-- Check invoices table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices' 
ORDER BY ordinal_position;

-- Check receipts table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'receipts' 
ORDER BY ordinal_position;