-- Check if feedback table exists and show its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'feedback'
ORDER BY ordinal_position;

-- Check if messages table exists and show its structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- Check if RLS is enabled on feedback table
SELECT tablename, relrowsecurity 
FROM pg_tables 
WHERE tablename = 'feedback';

-- Check if RLS is enabled on messages table
SELECT tablename, relrowsecurity 
FROM pg_tables 
WHERE tablename = 'messages';

-- Check policies on feedback table
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'feedback';

-- Check policies on messages table
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename = 'messages';

-- Count existing records in feedback table
SELECT COUNT(*) as feedback_count FROM feedback;

-- Count existing records in messages table
SELECT COUNT(*) as messages_count FROM messages;