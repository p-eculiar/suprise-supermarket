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
  private static readonly TWITTER_API_URL = 'https://api.twitter.com/2';
  private static readonly TWITTER_BEARER_TOKEN = process.env.REACT_APP_TWITTER_BEARER_TOKEN;

  /**
   * Scan Twitter for potential leads using Twitter API v2
   */
  static async scanTwitterLeads(): Promise<SocialPost[]> {
    if (!this.TWITTER_BEARER_TOKEN) {
      console.warn('Twitter API token not configured. Skipping Twitter scan.');
      return [];
    }

    try {
      // Build search query from keywords
      const query = KEYWORDS.map(k => `"${k}"`).join(' OR ');
      
      // Twitter API v2 recent search endpoint
      const searchUrl = `${this.TWITTER_API_URL}/tweets/search/recent`;
      const params = new URLSearchParams({
        query: `${query} -is:retweet lang:en`,
        max_results: '50',
        'tweet.fields': 'author_id,created_at,text,public_metrics',
        'user.fields': 'name,username,description',
        expansions: 'author_id',
      });

      const response = await fetch(`${searchUrl}?${params}`, {
        headers: {
          Authorization: `Bearer ${this.TWITTER_BEARER_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Twitter data to our format
      return this.transformTwitterData(data);
    } catch (error) {
      console.error('Error scanning Twitter:', error);
      return [];
    }
  }

  /**
   * Transform Twitter API response to our SocialPost format
   */
  private static transformTwitterData(data: any): SocialPost[] {
    if (!data.data || !data.includes?.users) return [];

    const users = new Map(data.includes.users.map((u: any) => [u.id, u]));

    return data.data.map((tweet: any) => {
      const user = users.get(tweet.author_id);
      const matchedKeywords = KEYWORDS.filter(keyword =>
        tweet.text.toLowerCase().includes(keyword.toLowerCase())
      );

      return {
        platform: 'twitter' as const,
        author_name: user?.name || 'Unknown',
        author_handle: `@${user?.username || 'unknown'}`,
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
    if (leads.length === 0) return 0;

    try {
      const leadsToInsert = leads.map(lead => ({
        ...lead,
        status: 'new',
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('social_leads')
        .insert(leadsToInsert);

      if (error) throw error;

      return leads.length;
    } catch (error) {
      console.error('Error saving leads to database:', error);
      return 0;
    }
  }

  /**
   * Scan Facebook (requires Facebook Graph API - placeholder)
   */
  static async scanFacebookLeads(): Promise<SocialPost[]> {
    // Facebook Graph API integration would go here
    // Requires Facebook App ID, App Secret, and Page Access Token
    console.log('Facebook scanning not yet implemented - requires Graph API setup');
    return [];
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
    const results: SocialPost[] = [];
    const byPlatform: Record<string, number> = {};

    // Scan Twitter
    const twitterLeads = await this.scanTwitterLeads();
    results.push(...twitterLeads);
    byPlatform.twitter = twitterLeads.length;

    // Scan Facebook (when implemented)
    const facebookLeads = await this.scanFacebookLeads();
    results.push(...facebookLeads);
    byPlatform.facebook = facebookLeads.length;

    // Scan Instagram (when implemented)
    const instagramLeads = await this.scanInstagramLeads();
    results.push(...instagramLeads);
    byPlatform.instagram = instagramLeads.length;

    // Save all leads to database
    const savedCount = await this.saveLeadsToDatabase(results);

    return {
      total: savedCount,
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
