// Supabase Edge Function to scan Twitter API
// This runs on Supabase's servers, bypassing CORS restrictions

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Comprehensive Nigerian supermarket keywords (120+ keywords)
// Optimized for Port Harcourt, Rivers State, Nigeria
const KEYWORDS = [
  // General groceries & food - Port Harcourt specific
  'need groceries Port Harcourt',
  'buy groceries PH',
  'foodstuff supplier Port Harcourt',
  'bulk foodstuff PH',
  'provision store Port Harcourt',
  'provision supplier Rivers State',
  'need provisions PH',
  'buy provisions Port Harcourt',
  'groceries Garden City',
  
  // Bulk & corporate
  'bulk buying Port Harcourt',
  'bulk order PH',
  'bulk supply Rivers State',
  'corporate catering Port Harcourt',
  'office supplies food PH',
  'office pantry Port Harcourt',
  'company provisions Garden City',
  'wholesale foodstuff PH',
  'wholesale groceries Port Harcourt',
  
  // Bulk & corporate
  'bulk buying Nigeria',
  'bulk order Lagos',
  'bulk supply Nigeria',
  'corporate catering Nigeria',
  'office supplies food',
  'office pantry Nigeria',
  'company provisions',
  'wholesale foodstuff',
  'wholesale groceries Nigeria',
  
  // Rice & grains
  'buy rice Nigeria',
  'bulk rice Lagos',
  'bag of rice',
  'foreign rice Nigeria',
  'local rice supplier',
  'beans supplier Nigeria',
  'garri supplier',
  'semovita bulk',
  'wheat flour Nigeria',
  
  // Cooking essentials
  'vegetable oil Nigeria',
  'groundnut oil bulk',
  'palm oil supplier',
  'tomato paste bulk',
  'seasoning cubes Nigeria',
  'Maggi supplier',
  'curry powder Nigeria',
  'salt bulk Nigeria',
  'sugar supplier Lagos',
  
  // Beverages
  'soft drinks supplier Nigeria',
  'malt drink bulk',
  'fruit juice Nigeria',
  'bottled water supplier',
  'energy drink bulk',
  'coffee supplier Nigeria',
  'tea bags bulk',
  'chocolate drink Nigeria',
  'Milo bulk',
  'Bournvita supplier',
  
  // Snacks & biscuits
  'biscuits supplier Nigeria',
  'bulk biscuits Lagos',
  'crackers wholesale',
  'chin chin supplier',
  'popcorn bulk Nigeria',
  'peanuts supplier',
  'cashew nuts Nigeria',
  'chips supplier Lagos',
  'gala supplier',
  'meat pie bulk',
  
  // Dairy & proteins
  'milk supplier Nigeria',
  'Peak milk bulk',
  'cheese supplier Lagos',
  'butter bulk Nigeria',
  'yogurt supplier',
  'eggs supplier Nigeria',
  'frozen chicken Nigeria',
  'frozen fish supplier',
  'turkey supplier Lagos',
  
  // Pasta & noodles
  'spaghetti bulk Nigeria',
  'macaroni supplier',
  'indomie supplier',
  'noodles bulk Lagos',
  'pasta wholesale Nigeria',
  
  // Canned & packaged
  'canned food Nigeria',
  'corned beef supplier',
  'sardine bulk Nigeria',
  'baked beans supplier',
  'sweet corn Nigeria',
  'green peas bulk',
  
  // Toiletries & hygiene
  'toiletries supplier Nigeria',
  'soap bulk Lagos',
  'detergent supplier',
  'tissue paper bulk',
  'toothpaste supplier Nigeria',
  'bathing soap Nigeria',
  'washing powder bulk',
  
  // Perfumes & cosmetics
  'perfume supplier Nigeria',
  'body spray bulk Lagos',
  'deodorant supplier',
  'fragrance wholesale Nigeria',
  'cologne supplier Lagos',
  'perfume oil Nigeria',
  'designer perfume Nigeria',
  
  // Baby products
  'baby food Nigeria',
  'diapers bulk Lagos',
  'baby formula supplier',
  'cerelac Nigeria',
  'pampers supplier',
  
  // Household items
  'disinfectant bulk Nigeria',
  'air freshener supplier',
  'insecticide Nigeria',
  'cleaning supplies bulk',
  'mop supplier Lagos',
  
  // Fresh produce
  'fresh vegetables Nigeria',
  'fresh fruits Lagos',
  'tomatoes supplier',
  'onions bulk Nigeria',
  'pepper supplier Lagos',
  'Irish potato Nigeria',
  'yam supplier',
  
  // Delivery & services
  'grocery delivery Lagos',
  'home delivery groceries',
  'send groceries Nigeria',
  'foodstuff delivery Abuja',
  'provision delivery Nigeria',
  
  // Urgent/immediate needs
  'urgent foodstuff needed',
  'need groceries ASAP',
  'immediate provision supply',
  'same day delivery groceries',
  
  // Event supplies
  'party jollof ingredients',
  'event catering supplies',
  'wedding reception food',
  'birthday party provisions',
  
  // Diaspora gifting
  'send food Nigeria',
  'gift groceries Nigeria',
  'surprise groceries Lagos',
  'diaspora grocery gift',
]

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🐦 Starting Twitter scan from Edge Function...')
    
    // Get Twitter Bearer Token from environment
    const TWITTER_BEARER_TOKEN = Deno.env.get('TWITTER_BEARER_TOKEN')
    
    if (!TWITTER_BEARER_TOKEN) {
      throw new Error('TWITTER_BEARER_TOKEN not configured in Supabase Edge Function secrets')
    }
    
    console.log('✅ Twitter token found')
    
    // Build search query with Nigerian location targeting
    // Twitter allows max 512 characters in query, so we batch keywords
    const keywordBatches = [];
    let currentBatch = [];
    let currentLength = 0;
    
    for (const keyword of KEYWORDS) {
      const keywordQuery = `"${keyword}"`;
      const newLength = currentLength + keywordQuery.length + 4; // +4 for " OR "
      
      if (newLength > 400) { // Leave room for location filter
        keywordBatches.push(currentBatch.join(' OR '));
        currentBatch = [keywordQuery];
        currentLength = keywordQuery.length;
      } else {
        currentBatch.push(keywordQuery);
        currentLength = newLength;
      }
    }
    if (currentBatch.length > 0) {
      keywordBatches.push(currentBatch.join(' OR '));
    }
    
    // Use first batch for this scan (rotate batches in future scans)
    // Targeting Port Harcourt, Nigeria specifically
    const query = `(${keywordBatches[0]}) ("Port Harcourt" OR PH OR PHC OR "Rivers State" OR "Garden City")`;
    console.log('🔍 Search query:', query);
    console.log('📍 Location: Port Harcourt, Nigeria');
    console.log('📊 Total keyword batches:', keywordBatches.length);
    
    // Call Twitter API
    const searchUrl = `https://api.twitter.com/2/tweets/search/recent`
    const params = new URLSearchParams({
      query: `${query} -is:retweet lang:en`,
      max_results: '50',
      'tweet.fields': 'author_id,created_at,text,public_metrics',
      'user.fields': 'name,username,description',
      expansions: 'author_id',
    })
    
    console.log('📡 Calling Twitter API...')
    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
        'Content-Type': 'application/json',
      },
    })
    
    console.log('📊 Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Twitter API error:', errorText)
      throw new Error(`Twitter API error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    console.log('✅ Got Twitter data')
    
    // Transform to our format
    const leads = transformTwitterData(data)
    console.log(`✨ Transformed ${leads.length} leads`)
    
    // Save to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    if (leads.length > 0) {
      console.log('💾 Saving leads to database...')
      const { error: insertError } = await supabase
        .from('social_leads')
        .insert(leads.map(lead => ({
          ...lead,
          status: 'new',
          created_at: new Date().toISOString(),
        })))
      
      if (insertError) {
        console.error('❌ Database error:', insertError)
        throw insertError
      }
      
      console.log('✅ Saved leads successfully')
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        total: leads.length,
        leads: leads,
        message: `Found and saved ${leads.length} new leads from Twitter`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
    
  } catch (error) {
    console.error('💥 Error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

// Transform Twitter data to our format
function transformTwitterData(data: any): any[] {
  if (!data.data || !data.includes?.users) {
    return []
  }
  
  const users = new Map(
    data.includes.users.map((u: any) => [u.id, u])
  )
  
  return data.data.map((tweet: any) => {
    const user = users.get(tweet.author_id)
    const matchedKeywords = KEYWORDS.filter(keyword =>
      tweet.text.toLowerCase().includes(keyword.toLowerCase())
    )
    
    return {
      platform: 'twitter',
      author_name: user?.name || 'Unknown',
      author_handle: user?.username || 'unknown',
      post_content: tweet.text,
      post_url: `https://twitter.com/${user?.username}/status/${tweet.id}`,
      contact_info: user?.description,
      keywords_matched: matchedKeywords,
      sentiment: analyzeSentiment(tweet.text),
    }
  })
}

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'urgent' {
  const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'emergency', 'quick', 'fast']
  const positiveWords = ['great', 'excellent', 'love', 'amazing', 'best', 'good']
  const lowerText = text.toLowerCase()
  
  if (urgentWords.some(word => lowerText.includes(word))) {
    return 'urgent'
  }
  if (positiveWords.some(word => lowerText.includes(word))) {
    return 'positive'
  }
  return 'neutral'
}
