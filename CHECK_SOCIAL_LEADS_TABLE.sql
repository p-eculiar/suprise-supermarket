-- Check if social_leads table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'social_leads'
) as table_exists;

-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'social_leads'
ORDER BY ordinal_position;

-- Count existing records
SELECT COUNT(*) as total_records FROM social_leads;

-- Sample data
SELECT * FROM social_leads LIMIT 5;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'social_leads';
