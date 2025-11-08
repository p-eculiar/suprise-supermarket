-- Check the role of the specific user
SELECT p.id, u.email, p.full_name, p.role 
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'chikwendupeculiar66@gmail.com';