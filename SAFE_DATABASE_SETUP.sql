-- ================================================================
-- SAFE DATABASE SETUP - Handles Existing Objects
-- Run this if you get "already exists" errors
-- ================================================================

-- ================================================================
-- 1. DROP EXISTING POLICIES (Safe way to recreate)
-- ================================================================

-- Drop messages policies if they exist
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;
DROP POLICY IF EXISTS "Users cannot update messages" ON messages;
DROP POLICY IF EXISTS "Users cannot delete messages" ON messages;

-- Drop feedback policies if they exist
DROP POLICY IF EXISTS "Users can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON feedback;

-- Drop notifications policies if they exist
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Drop delivery_tracking policies if they exist
DROP POLICY IF EXISTS "Users can view own order tracking" ON delivery_tracking;

-- Drop search_history policies if they exist
DROP POLICY IF EXISTS "Users can view own search history" ON search_history;
DROP POLICY IF EXISTS "Users can insert own search history" ON search_history;

-- ================================================================
-- 2. CREATE TABLES (IF NOT EXISTS)
-- ================================================================

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'replied', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('order_status', 'delivery_update', 'payment', 'promotion', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Delivery Tracking Table
CREATE TABLE IF NOT EXISTS delivery_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL UNIQUE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
  current_location JSONB,
  driver_name TEXT,
  driver_phone TEXT,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  delivery_notes TEXT,
  tracking_history JSONB DEFAULT '[]'::jsonb,
  signature_url TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Leads Table
CREATE TABLE IF NOT EXISTS social_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(20) CHECK (platform IN ('twitter', 'facebook', 'instagram', 'whatsapp')),
  author_name TEXT NOT NULL,
  author_handle TEXT,
  post_content TEXT NOT NULL,
  post_url TEXT,
  contact_info TEXT,
  keywords_matched TEXT[] DEFAULT '{}'::TEXT[],
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'urgent')),
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search History Table
CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unanswered Questions Table (for chatbot)
CREATE TABLE IF NOT EXISTS unanswered_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  user_email TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'ignored')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  answered_at TIMESTAMP WITH TIME ZONE
);

-- Chat Sessions Table (for chatbot)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  messages JSONB NOT NULL,
  user_email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 3. CREATE INDEXES (IF NOT EXISTS)
-- ================================================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Delivery tracking indexes
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(status);

-- Social leads indexes
CREATE INDEX IF NOT EXISTS idx_social_leads_platform ON social_leads(platform);
CREATE INDEX IF NOT EXISTS idx_social_leads_status ON social_leads(status);
CREATE INDEX IF NOT EXISTS idx_social_leads_created_at ON social_leads(created_at DESC);

-- Search history indexes
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

-- Unanswered questions indexes
CREATE INDEX IF NOT EXISTS idx_unanswered_questions_status ON unanswered_questions(status);
CREATE INDEX IF NOT EXISTS idx_unanswered_questions_created_at ON unanswered_questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unanswered_questions_user_email ON unanswered_questions(user_email);

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- ================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 5. CREATE POLICIES (Fresh - no conflicts)
-- ================================================================

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update messages" ON messages
  FOR UPDATE USING (false);

CREATE POLICY "Users cannot delete messages" ON messages
  FOR DELETE USING (false);

-- Feedback policies
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Delivery tracking policies
CREATE POLICY "Users can view own order tracking" ON delivery_tracking
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Search history policies
CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ================================================================
-- 6. GRANT PERMISSIONS
-- ================================================================

GRANT SELECT, INSERT ON messages TO authenticated;
GRANT SELECT, INSERT ON feedback TO authenticated;
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON delivery_tracking TO authenticated;
GRANT SELECT, INSERT ON search_history TO authenticated;
GRANT SELECT, INSERT ON unanswered_questions TO authenticated;
GRANT SELECT, INSERT ON unanswered_questions TO anon;
GRANT SELECT, INSERT ON chat_sessions TO authenticated;
GRANT SELECT, INSERT ON chat_sessions TO anon;

-- ================================================================
-- 7. CREATE FUNCTIONS & TRIGGERS
-- ================================================================

-- Trending searches function
CREATE OR REPLACE FUNCTION get_trending_searches(search_limit INTEGER DEFAULT 10)
RETURNS TABLE(query TEXT, search_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    search_history.query,
    COUNT(*) as search_count
  FROM search_history
  WHERE created_at >= NOW() - INTERVAL '7 days'
  GROUP BY search_history.query
  ORDER BY search_count DESC
  LIMIT search_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS update_delivery_tracking_updated_at ON delivery_tracking;
DROP TRIGGER IF EXISTS update_social_leads_updated_at ON social_leads;
DROP TRIGGER IF EXISTS trigger_create_delivery_tracking ON orders;
DROP TRIGGER IF EXISTS trigger_order_status_notification ON orders;

-- Create triggers for updated_at
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_leads_updated_at BEFORE UPDATE ON social_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create delivery tracking function
CREATE OR REPLACE FUNCTION create_delivery_tracking_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO delivery_tracking (order_id, status, estimated_delivery_time)
  VALUES (
    NEW.id,
    'pending',
    NOW() + INTERVAL '2 hours'
  )
  ON CONFLICT (order_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create delivery tracking
CREATE TRIGGER trigger_create_delivery_tracking
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_tracking_on_order();

-- Auto-send notification function
CREATE OR REPLACE FUNCTION send_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (
      NEW.user_id,
      'order_status',
      'Order Status Updated',
      CASE NEW.status
        WHEN 'confirmed' THEN 'Your order has been confirmed!'
        WHEN 'preparing' THEN 'Your order is being prepared.'
        WHEN 'out_for_delivery' THEN 'Your order is out for delivery!'
        WHEN 'delivered' THEN 'Your order has been delivered.'
        WHEN 'cancelled' THEN 'Your order has been cancelled.'
        ELSE 'Your order status has been updated.'
      END,
      jsonb_build_object('order_id', NEW.id, 'status', NEW.status),
      '/dashboard/orders'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for order notifications
CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification();

-- ================================================================
-- 8. CREATE STORAGE BUCKETS (IF NOT EXISTS)
-- ================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 9. VERIFICATION
-- ================================================================

-- List all tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'messages',
  'feedback',
  'notifications',
  'delivery_tracking',
  'social_leads',
  'search_history',
  'unanswered_questions',
  'chat_sessions'
)
ORDER BY tablename;

-- Count rows in each table
SELECT 'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'delivery_tracking', COUNT(*) FROM delivery_tracking
UNION ALL
SELECT 'social_leads', COUNT(*) FROM social_leads
UNION ALL
SELECT 'search_history', COUNT(*) FROM search_history
UNION ALL
SELECT 'unanswered_questions', COUNT(*) FROM unanswered_questions
UNION ALL
SELECT 'chat_sessions', COUNT(*) FROM chat_sessions;

-- ================================================================
-- SETUP COMPLETE! ALL CONFLICTS RESOLVED! ✅
-- ================================================================
