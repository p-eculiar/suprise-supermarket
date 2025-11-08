-- ================================================================
-- SURPRISE SUPERMARKET - COMPLETE DATABASE SETUP
-- All tables, functions, policies, and indexes for 100% functionality
-- Run this script in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. MESSAGES TABLE (User-Admin Communication)
-- ================================================================

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

CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON messages TO authenticated;

COMMENT ON TABLE messages IS 'Stores messages between users and admin support team';

-- ================================================================
-- 2. FEEDBACK TABLE (User Reviews & Ratings)
-- ================================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  category VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON feedback TO authenticated;

COMMENT ON TABLE feedback IS 'Stores user feedback and ratings';

-- ================================================================
-- 3. NOTIFICATIONS TABLE (Real-Time Notifications)
-- ================================================================

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

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

GRANT SELECT, UPDATE ON notifications TO authenticated;

COMMENT ON TABLE notifications IS 'Real-time notifications for users';

-- ================================================================
-- 4. DELIVERY TRACKING TABLE (Order Tracking System)
-- ================================================================

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

CREATE INDEX IF NOT EXISTS idx_delivery_tracking_order_id ON delivery_tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_status ON delivery_tracking(status);

ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order tracking" ON delivery_tracking
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

GRANT SELECT ON delivery_tracking TO authenticated;

COMMENT ON TABLE delivery_tracking IS 'Real-time delivery tracking for orders';

-- ================================================================
-- 5. SOCIAL LEADS TABLE (Social Media Lead Generation)
-- ================================================================

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

CREATE INDEX IF NOT EXISTS idx_social_leads_platform ON social_leads(platform);
CREATE INDEX IF NOT EXISTS idx_social_leads_status ON social_leads(status);
CREATE INDEX IF NOT EXISTS idx_social_leads_created_at ON social_leads(created_at DESC);

COMMENT ON TABLE social_leads IS 'Social media leads from Twitter, Facebook, Instagram';

-- ================================================================
-- 6. SEARCH HISTORY TABLE (User Search Analytics)
-- ================================================================

CREATE TABLE IF NOT EXISTS search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at DESC);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search history" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON search_history TO authenticated;

COMMENT ON TABLE search_history IS 'User search history for analytics';

-- ================================================================
-- 7. TRENDING SEARCHES FUNCTION
-- ================================================================

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

COMMENT ON FUNCTION get_trending_searches IS 'Returns trending search queries from last 7 days';

-- ================================================================
-- 8. STORAGE BUCKETS FOR FILE UPLOADS
-- ================================================================

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('delivery-proofs', 'delivery-proofs', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for delivery proofs
CREATE POLICY "Anyone can view delivery proofs" ON storage.objects
  FOR SELECT USING (bucket_id = 'delivery-proofs');

CREATE POLICY "Authenticated users can upload delivery proofs" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'delivery-proofs' AND auth.role() = 'authenticated');

-- Storage policies for product images
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- ================================================================
-- 9. AUTO-CREATE DELIVERY TRACKING TRIGGER
-- ================================================================

CREATE OR REPLACE FUNCTION create_delivery_tracking_on_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO delivery_tracking (order_id, status, estimated_delivery_time)
  VALUES (
    NEW.id,
    'pending',
    NOW() + INTERVAL '2 hours' -- Default 2 hours for delivery
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_delivery_tracking
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION create_delivery_tracking_on_order();

COMMENT ON FUNCTION create_delivery_tracking_on_order IS 'Auto-creates delivery tracking when order is placed';

-- ================================================================
-- 10. AUTO-SEND NOTIFICATION TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION send_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification when order status changes
  IF NEW.status != OLD.status THEN
    INSERT INTO notifications (user_id, type, title, message, data, action_url)
    VALUES (
      NEW.user_id,
      'order',  -- Changed from 'order_status' to 'order' to match allowed types
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

CREATE TRIGGER trigger_order_status_notification
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION send_order_notification();

-- ================================================================
-- 11. UPDATE TIMESTAMPS TRIGGERS
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_tracking_updated_at BEFORE UPDATE ON delivery_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_leads_updated_at BEFORE UPDATE ON social_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 12. ANALYTICS VIEWS
-- ================================================================

-- View for order analytics
CREATE OR REPLACE VIEW order_analytics AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(total) as revenue,
  AVG(total) as avg_order_value,
  COUNT(DISTINCT user_id) as unique_customers
FROM orders
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

-- View for product performance
CREATE OR REPLACE VIEW product_performance AS
SELECT 
  p.id,
  p.name,
  p.category,
  COUNT(oi.id) as times_ordered,
  SUM(oi.quantity) as units_sold,
  SUM(oi.price * oi.quantity) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name, p.category
ORDER BY total_revenue DESC NULLS LAST;

-- ================================================================
-- 13. SAMPLE DATA (OPTIONAL - Remove if not needed)
-- ================================================================

-- Sample notification for testing
-- INSERT INTO notifications (user_id, type, title, message)
-- SELECT 
--   id as user_id,
--   'system',
--   'Welcome to Surprise Supermarket!',
--   'Thank you for joining us. Start shopping for fresh products today!'
-- FROM auth.users
-- LIMIT 1;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================

-- Verify all tables created
SELECT 
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'messages',
  'feedback',
  'notifications',
  'delivery_tracking',
  'social_leads',
  'search_history'
)
ORDER BY tablename;

-- Show table counts
SELECT 
  'messages' as table_name, COUNT(*) as row_count FROM messages
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'delivery_tracking', COUNT(*) FROM delivery_tracking
UNION ALL
SELECT 'social_leads', COUNT(*) FROM social_leads
UNION ALL
SELECT 'search_history', COUNT(*) FROM search_history;
