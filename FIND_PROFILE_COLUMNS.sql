-- Let's see what columns actually exist in the profiles table
SELECT * FROM profiles LIMIT 1;

-- Or if that fails, let's try to get column info differently
SELECT attname 
FROM pg_attribute 
WHERE attrelid = 'profiles'::regclass 
AND attnum > 0 
AND NOT attisdropped 
ORDER BY attnum;