-- Check the exact column structure of orders table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check if the current user has admin role - alternative approach
SELECT 
    id,
    email,
    role
FROM profiles 
WHERE id = (SELECT auth.uid());

-- Check all users and their roles
SELECT 
    p.id,
    u.email,
    p.role
FROM profiles p
JOIN auth.users u ON p.id = u.id;