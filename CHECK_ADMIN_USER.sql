-- Check if there's an admin user
SELECT id, email, role FROM profiles WHERE role = 'admin';