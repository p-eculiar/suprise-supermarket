-- Create social_leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS social_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'whatsapp')),
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_url TEXT NOT NULL,
  contact_info TEXT,
  keywords_matched TEXT[] DEFAULT '{}',
  sentiment TEXT NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'urgent')) DEFAULT 'neutral',
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'converted', 'ignored')) DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_leads_platform ON social_leads(platform);
CREATE INDEX IF NOT EXISTS idx_social_leads_status ON social_leads(status);
CREATE INDEX IF NOT EXISTS idx_social_leads_created_at ON social_leads(created_at DESC);

-- Enable RLS
ALTER TABLE social_leads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view social leads" ON social_leads;
DROP POLICY IF EXISTS "Admins can manage social leads" ON social_leads;

-- Create RLS policies
CREATE POLICY "Anyone can view social leads"
  ON social_leads FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage social leads"
  ON social_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Insert sample data for testing
INSERT INTO social_leads (platform, author_name, author_handle, post_content, post_url, contact_info, keywords_matched, sentiment, status)
VALUES
  (
    'twitter',
    'John Doe',
    '@johndoe',
    'Looking for a reliable grocery delivery service in Lagos. Need fresh fruits and vegetables delivered to my office weekly. Anyone know a good supplier?',
    'https://twitter.com/johndoe/status/1234567890',
    '+234 803 123 4567',
    ARRAY['need groceries', 'grocery delivery', 'fresh fruits'],
    'neutral',
    'new'
  ),
  (
    'twitter',
    'Sarah Johnson',
    '@sarahj_biz',
    'URGENT: Need bulk order of foodstuff for corporate event next week. Looking for supermarket that can deliver 100+ items. Please contact ASAP!',
    'https://twitter.com/sarahj_biz/status/1234567891',
    '+234 801 234 5678',
    ARRAY['bulk order', 'foodstuff', 'corporate catering'],
    'urgent',
    'new'
  ),
  (
    'facebook',
    'Mike Peters',
    'mikepeters',
    'Anyone can recommend a good supermarket in Abuja? Need to stock up my office pantry with snacks and beverages for the team.',
    'https://facebook.com/mikepeters/posts/123456',
    'mike@company.com',
    ARRAY['office supplies food', 'supermarket near me'],
    'positive',
    'contacted'
  ),
  (
    'twitter',
    'Grace Okafor',
    '@graceokafor',
    'Planning to send groceries to my family in Nigeria from abroad. Any reliable service that delivers fresh produce and basic food items?',
    'https://twitter.com/graceokafor/status/1234567892',
    '+1 234 567 8900',
    ARRAY['send groceries to Nigeria', 'need food'],
    'neutral',
    'new'
  ),
  (
    'whatsapp',
    'David Chen',
    '+2348034567890',
    'Need regular weekly delivery of fresh vegetables and fruits for my restaurant. Looking for wholesale supplier with consistent quality.',
    'https://wa.me/2348034567890',
    '+234 803 456 7890',
    ARRAY['buy vegetables', 'fresh fruits', 'bulk buying'],
    'positive',
    'new'
  ),
  (
    'instagram',
    'FoodieNaija',
    '@foodienaija',
    'Best supermarket experience! Their delivery service is amazing. Fresh groceries delivered right to my door. Highly recommend! 🛒✨',
    'https://instagram.com/p/ABC123XYZ',
    NULL,
    ARRAY['grocery delivery', 'fresh fruits'],
    'positive',
    'converted'
  ),
  (
    'twitter',
    'Emma Wilson',
    '@emmawilson_ng',
    'Just moved to a new area, looking for good grocery shops nearby. Need someone who can deliver fresh produce daily for my small restaurant.',
    'https://twitter.com/emmawilson_ng/status/1234567893',
    '+234 805 678 9012',
    ARRAY['need groceries', 'fresh fruits', 'grocery delivery'],
    'neutral',
    'contacted'
  ),
  (
    'facebook',
    'Corporate Solutions Ltd',
    'corporatesolutionsltd',
    'Seeking supplier for monthly bulk food orders. Office of 50+ employees. Need fruits, snacks, beverages. Professional service required.',
    'https://facebook.com/corporatesolutionsltd/posts/789012',
    'procurement@corpsol.com',
    ARRAY['bulk order', 'office supplies food', 'corporate catering'],
    'urgent',
    'new'
  )
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 
  platform,
  status,
  COUNT(*) as count
FROM social_leads
GROUP BY platform, status
ORDER BY platform, status;

-- Show total count
SELECT COUNT(*) as total_leads FROM social_leads;
