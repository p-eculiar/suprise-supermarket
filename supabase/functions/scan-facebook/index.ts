// Supabase Edge Function to scan Facebook API
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
    console.log('-facebook Starting Facebook scan from Edge Function...')
    
    // Get Facebook credentials from environment
    const FACEBOOK_ACCESS_TOKEN = Deno.env.get('FACEBOOK_ACCESS_TOKEN')
    const FACEBOOK_PAGE_ID = Deno.env.get('FACEBOOK_PAGE_ID')
    
    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
      throw new Error('FACEBOOK_ACCESS_TOKEN or FACEBOOK_PAGE_ID not configured in Supabase Edge Function secrets')
    }
    
    console.log('✅ Facebook credentials found')
    
    // Search for posts in Port Harcourt area with our keywords
    const keywords = KEYWORDS.join(' OR ');
    const searchQuery = encodeURIComponent(`${keywords} (Port Harcourt OR "Rivers State" OR PH OR PHC OR "Garden City")`);
    
    // Facebook Graph API search endpoint
    const searchUrl = `https://graph.facebook.com/v18.0/search`;
    const params = new URLSearchParams({
      q: searchQuery,
      type: 'post',
      fields: 'id,message,from,created_time,permalink_url',
      limit: '50',
      access_token: FACEBOOK_ACCESS_TOKEN
    });
    
    console.log('📡 Calling Facebook Graph API...')
    const response = await fetch(`${searchUrl}?${params}`);
    
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Facebook API error:', errorText);
      throw new Error(`Facebook API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Got Facebook data');
    
    // Transform to our format
    const leads = transformFacebookData(data);
    console.log(`✨ Transformed ${leads.length} Facebook leads`);
    
    // Save to Supabase database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    if (leads.length > 0) {
      console.log('💾 Saving leads to database...');
      const { error: insertError } = await supabase
        .from('social_leads')
        .insert(leads.map(lead => ({
          ...lead,
          status: 'new',
          created_at: new Date().toISOString(),
        })));
      
      if (insertError) {
        console.error('❌ Database error:', insertError);
        throw insertError;
      }
      
      console.log('✅ Saved leads successfully');
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        total: leads.length,
        leads: leads,
        message: `Found and saved ${leads.length} new leads from Facebook`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('💥 Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Transform Facebook data to our format
function transformFacebookData(data: any): any[] {
  if (!data.data) {
    return [];
  }
  
  return data.data
    .filter((post: any) => post.message) // Only posts with messages
    .map((post: any) => {
      const matchedKeywords = KEYWORDS.filter(keyword =>
        post.message.toLowerCase().includes(keyword.toLowerCase())
      );
      
      return {
        platform: 'facebook',
        author_name: post.from?.name || 'Unknown',
        author_handle: post.from?.id || 'unknown',
        post_content: post.message,
        post_url: post.permalink_url || `https://facebook.com/${post.id}`,
        contact_info: '', // Facebook doesn't expose contact info in public posts
        keywords_matched: matchedKeywords,
        sentiment: analyzeSentiment(post.message),
      };
    });
}

// Simple sentiment analysis
function analyzeSentiment(text: string): 'positive' | 'neutral' | 'urgent' {
  const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'emergency', 'quick', 'fast'];
  const positiveWords = ['great', 'excellent', 'love', 'amazing', 'best', 'good'];
  const lowerText = text.toLowerCase();
  
  if (urgentWords.some(word => lowerText.includes(word))) {
    return 'urgent';
  }
  if (positiveWords.some(word => lowerText.includes(word))) {
    return 'positive';
  }
  return 'neutral';
}