-- Create messages table for user-admin communication
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own messages
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own messages
CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users cannot update messages (only admins can respond)
CREATE POLICY "Users cannot update messages" ON messages
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete messages
CREATE POLICY "Users cannot delete messages" ON messages
  FOR DELETE
  USING (false);

-- Grant permissions
GRANT SELECT, INSERT ON messages TO authenticated;

-- Insert sample message (optional - for testing)
-- INSERT INTO messages (user_id, subject, message, status)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'Question about delivery',
--   'When will my order arrive? I placed it yesterday.',
--   'open'
-- );

COMMENT ON TABLE messages IS 'Stores messages between users and admin support team';
COMMENT ON COLUMN messages.status IS 'Message status: open (awaiting response), replied (admin responded), closed (resolved)';
