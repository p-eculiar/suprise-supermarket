-- ================================================================
-- AI CHATBOT DATABASE TABLES
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Unanswered Questions Table
-- Stores questions that the chatbot couldn't answer
CREATE TABLE IF NOT EXISTS unanswered_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'ignored')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_unanswered_questions_status ON unanswered_questions(status);
CREATE INDEX IF NOT EXISTS idx_unanswered_questions_created_at ON unanswered_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unanswered_questions_user_email ON unanswered_questions(user_email);

COMMENT ON TABLE unanswered_questions IS 'Questions from chatbot that need admin response';

-- 2. Chat Sessions Table
-- Stores complete chat conversations for analytics
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL,
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

COMMENT ON TABLE chat_sessions IS 'Complete chat conversation logs for analytics';

-- Grant permissions
GRANT SELECT, INSERT ON unanswered_questions TO authenticated;
GRANT SELECT ON unanswered_questions TO anon;
GRANT SELECT, INSERT ON chat_sessions TO authenticated;
GRANT SELECT, INSERT ON chat_sessions TO anon;

-- Verification
SELECT 
  'unanswered_questions' as table_name, 
  COUNT(*) as row_count 
FROM unanswered_questions
UNION ALL
SELECT 
  'chat_sessions', 
  COUNT(*) 
FROM chat_sessions;

-- ================================================================
-- ADMIN VIEW - Unanswered Questions Dashboard
-- ================================================================

CREATE OR REPLACE VIEW admin_unanswered_questions AS
SELECT 
  id,
  question,
  user_email,
  status,
  created_at,
  CASE 
    WHEN answered_at IS NULL THEN NULL
    ELSE answered_at - created_at 
  END as response_time
FROM unanswered_questions
ORDER BY created_at DESC;

COMMENT ON VIEW admin_unanswered_questions IS 'Admin dashboard view for unanswered questions';

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
