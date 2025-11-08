-- Remove all sample/test social leads data
-- This keeps only the real Twitter API leads

-- Delete sample leads (the 8 sample leads we created earlier)
-- These have specific patterns we can identify
DELETE FROM social_leads
WHERE 
  -- Sample leads have these specific author handles
  author_handle IN (
    'sarahj_biz',
    'corporate_buyer',
    'maryfoods',
    'jane_organics',
    'bulk_buyer_ng',
    'cateringpro',
    'officemgr_lagos',
    'restaurant_supply'
  )
  OR
  -- Sample leads have these specific post URLs
  post_url LIKE '%/status/12345678%'
  OR post_url LIKE '%/status/98765432%'
  OR post_url LIKE '%/posts/fb_%'
  OR post_url LIKE '%/p/insta_%'
  OR post_url LIKE 'https://wa.me/%';

-- Verify deletion
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN platform = 'twitter' THEN 1 END) as twitter_leads,
  COUNT(CASE WHEN platform = 'facebook' THEN 1 END) as facebook_leads,
  COUNT(CASE WHEN platform = 'instagram' THEN 1 END) as instagram_leads,
  COUNT(CASE WHEN platform = 'whatsapp' THEN 1 END) as whatsapp_leads,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_leads,
  COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_leads,
  COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted_leads
FROM social_leads;

-- Show remaining leads (should only be real Twitter API leads)
SELECT 
  id,
  platform,
  author_name,
  author_handle,
  LEFT(post_content, 50) as preview,
  status,
  created_at
FROM social_leads
ORDER BY created_at DESC
LIMIT 20;
