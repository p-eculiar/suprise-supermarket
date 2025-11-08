-- Quick Script: Remove ALL Sample/Test Data from social_leads
-- Keep ONLY real Twitter API leads

-- Delete all sample leads (created before Twitter API integration)
DELETE FROM social_leads
WHERE author_handle IN (
  'sarahj_biz',
  'corporate_buyer', 
  'maryfoods',
  'jane_organics',
  'bulk_buyer_ng',
  'cateringpro',
  'officemgr_lagos',
  'restaurant_supply'
);

-- Show what remains (should be only real Twitter leads)
SELECT 
  'Remaining leads after cleanup' as status,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN platform = 'twitter' THEN 1 END) as twitter_leads
FROM social_leads;
