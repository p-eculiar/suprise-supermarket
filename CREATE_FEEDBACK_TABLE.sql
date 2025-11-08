-- Create feedback table for user reviews and ratings
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users cannot update feedback
CREATE POLICY "Users cannot update feedback" ON feedback
  FOR UPDATE
  USING (false);

-- Policy: Users cannot delete feedback
CREATE POLICY "Users cannot delete feedback" ON feedback
  FOR DELETE
  USING (false);

-- Grant permissions
GRANT SELECT, INSERT ON feedback TO authenticated;

-- Insert sample feedback (optional - for testing)
-- INSERT INTO feedback (user_id, rating, category, message)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   5,
--   'Product Quality',
--   'Excellent service! Products are always fresh and delivery is fast.'
-- );

COMMENT ON TABLE feedback IS 'Stores user feedback and ratings for the service';
COMMENT ON COLUMN feedback.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN feedback.category IS 'Feedback category: Product Quality, Delivery Service, Customer Support, Website Experience, Pricing, Other';
COMMENT ON COLUMN feedback.admin_response IS 'Admin response to user feedback (optional)';
