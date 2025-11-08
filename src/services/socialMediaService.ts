import { supabase } from '../lib/supabase';

interface SocialPost {
  platform: 'twitter' | 'facebook' | 'instagram' | 'whatsapp';
  author_name: string;
  author_handle: string;
  post_content: string;
  post_url: string;
  contact_info?: string;
  keywords_matched: string[];
  sentiment: 'positive' | 'neutral' | 'urgent';
}

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  description?: string;
}

interface TwitterTweet {
  id: string;
  text: string;
  author_id: string;
  created_at?: string;
  public_metrics?: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
}

// Keywords to monitor for lead generation
const KEYWORDS = [
  'need groceries',
  'buy vegetables',
  'fresh fruits',
  'grocery delivery',
  'need food',
  'supermarket near me',
  'bulk buying',
  'corporate catering',
  'office supplies food',
];

export class SocialMediaService {
  private static readonly SUPABASE_FUNCTIONS_URL = `${process.env.REACT_APP_SUPABASE_URL}/functions/v1`;
  private static readonly SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

  /**
   * Scan Twitter via Supabase Edge Function (fixes CORS issue)
   */
  static async scanTwitterLeads(): Promise<SocialPost[]> {
    console.log('\n🐦 Starting Twitter scan via Edge Function...');
    
    if (!this.SUPABASE_FUNCTIONS_URL || !this.SUPABASE_ANON_KEY) {
      const message = 'Supabase configuration missing';
      console.error('❌', message);
      throw new Error(message);
    }

    try {
      const functionUrl = `${this.SUPABASE_FUNCTIONS_URL}/scan-twitter`;
      console.log('🌐 Edge Function URL:', functionUrl);
      console.log('📡 Calling Edge Function...');
      
      const startTime = Date.now();
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const duration = Date.now() - startTime;
      console.log(`⏱️ Request completed in ${duration}ms`);
      console.log('📊 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Edge Function error response:');
        console.error('Status:', response.status);
        console.error('Error Body:', errorText);
        
        throw new Error(`Edge Function error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Edge Function response received');
      console.log('📦 Response:', data);
      
      if (data.success && data.leads) {
        console.log(`🎯 Found ${data.leads.length} leads from Edge Function`);
        return data.leads;
      } else if (data.error) {
        throw new Error(data.error);
      }
      
      console.log('⚠️ No leads found');
      return [];
      
    } catch (error) {
      console.error('💥 Error calling Edge Function:');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Full error:', error);
      
      throw error;
    }
  }

  /**
   * Transform Twitter API response to our SocialPost format
   */
  private static transformTwitterData(data: any): SocialPost[] {
    console.log('🔄 Transforming Twitter data...');
    
    if (!data.data) {
      console.log('⚠️ No data.data in response');
      return [];
    }
    
    if (!data.includes?.users) {
      console.log('⚠️ No data.includes.users in response');
      return [];
    }

    const users = new Map<string, TwitterUser>(
      data.includes.users.map((u: TwitterUser) => [u.id, u])
    );
    
    console.log(`👥 Loaded ${users.size} users`);

    return data.data.map((tweet: TwitterTweet) => {
      const user = users.get(tweet.author_id);
      const matchedKeywords = KEYWORDS.filter(keyword =>
        tweet.text.toLowerCase().includes(keyword.toLowerCase())
      );

      return {
        platform: 'twitter' as const,
        author_name: user?.name || 'Unknown',
        author_handle: user?.username || 'unknown',
        post_content: tweet.text,
        post_url: `https://twitter.com/${user?.username}/status/${tweet.id}`,
        contact_info: user?.description,
        keywords_matched: matchedKeywords,
        sentiment: this.analyzeSentiment(tweet.text),
      };
    });
  }

  /**
   * Simple sentiment analysis
   */
  private static analyzeSentiment(text: string): 'positive' | 'neutral' | 'urgent' {
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

  /**
   * Save leads to database
   */
  static async saveLeadsToDatabase(leads: SocialPost[]): Promise<number> {
    // Edge Function now handles saving to database
    // This method kept for backward compatibility
    console.log('ℹ️ Leads are automatically saved by Edge Function');
    return leads.length;
  }

  /**
   * Scan Facebook (requires Facebook Graph API)
   */
  static async scanFacebookLeads(): Promise<SocialPost[]> {
    console.log('-facebook Starting Facebook scan...');
    
    // Get Facebook credentials from environment variables
    const FACEBOOK_ACCESS_TOKEN = process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN;
    const FACEBOOK_PAGE_ID = process.env.REACT_APP_FACEBOOK_PAGE_ID;
    
    if (!FACEBOOK_ACCESS_TOKEN || !FACEBOOK_PAGE_ID) {
      console.log('⚠️ Facebook credentials not configured');
      return [];
    }

    try {
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
      
      console.log('📡 Calling Facebook Graph API...');
      const response = await fetch(`${searchUrl}?${params}`);
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Facebook API error:', errorText);
        return [];
      }
      
      const data = await response.json();
      console.log('✅ Got Facebook data');
      
      // Transform to our format
      const leads = this.transformFacebookData(data);
      console.log(`✨ Transformed ${leads.length} Facebook leads`);
      
      return leads;
      
    } catch (error) {
      console.error('💥 Facebook scan error:', error);
      return [];
    }
  }

  /**
   * Transform Facebook API response to our SocialPost format
   */
  private static transformFacebookData(data: any): SocialPost[] {
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
          platform: 'facebook' as const,
          author_name: post.from?.name || 'Unknown',
          author_handle: post.from?.id || 'unknown',
          post_content: post.message,
          post_url: post.permalink_url || `https://facebook.com/${post.id}`,
          contact_info: '', // Facebook doesn't expose contact info in public posts
          keywords_matched: matchedKeywords,
          sentiment: this.analyzeSentiment(post.message),
        };
      });
  }

  /**
   * Scan Instagram (requires Instagram Basic Display API - placeholder)
   */
  static async scanInstagramLeads(): Promise<SocialPost[]> {
    // Instagram API integration would go here
    console.log('Instagram scanning not yet implemented - requires Instagram API setup');
    return [];
  }

  /**
   * Main scan function - scans all platforms
   */
  static async scanAllPlatforms(): Promise<{ total: number; byPlatform: Record<string, number> }> {
    console.log('\n🚀 Starting scan of all platforms...');
    console.log('⏰ Scan started at:', new Date().toISOString());
    
    const byPlatform: Record<string, number> = {};

    // Scan Twitter via Edge Function
    try {
      console.log('\n📍 Scanning Twitter via Edge Function...');
      const twitterLeads = await this.scanTwitterLeads();
      byPlatform.twitter = twitterLeads.length;
      console.log(`✅ Twitter scan complete: ${twitterLeads.length} leads`);
    } catch (error) {
      console.error('❌ Twitter scan failed:', error);
      byPlatform.twitter = 0;
    }
    
    // Scan Facebook
    try {
      console.log('\n📍 Scanning Facebook...');
      const facebookLeads = await this.scanFacebookLeads();
      byPlatform.facebook = facebookLeads.length;
      console.log(`✅ Facebook scan complete: ${facebookLeads.length} leads`);
    } catch (error) {
      console.error('❌ Facebook scan failed:', error);
      byPlatform.facebook = 0;
    }

    const total = byPlatform.twitter + byPlatform.facebook;
    
    console.log('\n📊 Scan Summary:');
    console.log('├─ Twitter:', byPlatform.twitter);
    console.log('├─ Facebook:', byPlatform.facebook);
    console.log('├─ Instagram: 0 (not implemented)');
    console.log('└─ Total:', total);

    return {
      total,
      byPlatform,
    };
  }

  /**
   * Update lead status
   */
  static async updateLeadStatus(leadId: string, status: 'contacted' | 'converted' | 'ignored'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('social_leads')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating lead status:', error);
      return false;
    }
  }
}
