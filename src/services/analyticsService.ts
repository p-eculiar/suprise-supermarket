import { supabase } from '../lib/supabase';

// Types for our analytics data
export interface StateData {
  id: string;
  state: string;
  top_product: string;
  total_purchases: number;
  average_price: number;
  trend: string;
  market_share: number;
  supermarkets_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductRecommendation {
  id: string;
  product_name: string;
  average_price: number;
  total_sales: number;
  top_states: string[];
  growth_rate: number;
  profit_margin: number;
  created_at: string;
}

// Service class for analytics data
class AnalyticsService {
  // Fetch data from database (original method)
  async fetchFromDatabase(): Promise<{ states: StateData[], recommendations: ProductRecommendation[] }> {
    try {
      // Check if nigeria_state_analytics table exists
      const { error: statesCheckError } = await supabase
        .from('nigeria_state_analytics')
        .select('id')
        .limit(1);

      // Check if product_recommendations table exists
      const { error: recommendationsCheckError } = await supabase
        .from('product_recommendations')
        .select('id')
        .limit(1);

      // If either table doesn't exist, throw error to fallback to mock data
      if (statesCheckError?.message?.includes('Could not find the table') || 
          recommendationsCheckError?.message?.includes('Could not find the table')) {
        throw new Error('Database tables not found');
      }

      // Fetch Nigeria state analytics data
      const { data: statesData, error: statesError } = await supabase
        .from('nigeria_state_analytics')
        .select('*')
        .order('market_share', { ascending: false });

      if (statesError) {
        throw new Error(`Failed to fetch state analytics: ${statesError.message}`);
      }

      // Fetch product recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('product_recommendations')
        .select('*')
        .order('total_sales', { ascending: false })
        .limit(10);

      if (recommendationsError) {
        throw new Error(`Failed to fetch recommendations: ${recommendationsError.message}`);
      }

      return {
        states: statesData || [],
        recommendations: recommendationsData || []
      };
    } catch (error) {
      throw error;
    }
  }

  // Fetch data from external APIs
  async fetchFromExternalAPIs(): Promise<{ states: StateData[], recommendations: ProductRecommendation[] }> {
    // External API integration removed - using database only
    throw new Error('External API integration not configured. Please use database.');
  }

  // Main function to fetch analytics data
  // Uses ONLY database - no mock data
  async fetchAnalyticsData(): Promise<{ states: StateData[], recommendations: ProductRecommendation[], source: 'database' | 'api' | 'mock' }> {
    try {
      console.log('📊 Fetching Nigerian market analytics from database...');
      
      // Fetch from database
      const databaseData = await this.fetchFromDatabase();
      
      // If database has data, use it
      if (databaseData.states.length > 0 && databaseData.recommendations.length > 0) {
        console.log('✅ Using database data:', {
          states: databaseData.states.length,
          recommendations: databaseData.recommendations.length
        });
        return {
          ...databaseData,
          source: 'database'
        };
      }
      
      // If database is empty, return empty arrays (admin needs to populate)
      console.warn('⚠️ Database tables are empty. Please run the setup SQL script.');
      return {
        states: [],
        recommendations: [],
        source: 'database'
      };
      
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      
      // Return empty data - no fallback to mock
      return {
        states: [],
        recommendations: [],
        source: 'database'
      };
    }
  }

  // Function to create analytics tables if they don't exist
  async createAnalyticsTables(): Promise<void> {
    try {
      // Create nigeria_state_analytics table
      const createStateTableQuery = `
        CREATE TABLE IF NOT EXISTS nigeria_state_analytics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          state TEXT UNIQUE NOT NULL,
          top_product TEXT NOT NULL,
          total_purchases INTEGER NOT NULL DEFAULT 0,
          average_price DECIMAL(10, 2) NOT NULL,
          trend TEXT NOT NULL,
          market_share DECIMAL(5, 2) NOT NULL,
          supermarkets_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Try to execute the query directly
      const { error: createStateError } = await supabase.rpc('execute_sql', { sql: createStateTableQuery });
      if (createStateError) {
        // If RPC doesn't work, the table might already exist or we'll use mock data
        console.warn('Note: Could not create nigeria_state_analytics table via RPC');
      }
      
      // Create product_recommendations table
      const createRecommendationsTableQuery = `
        CREATE TABLE IF NOT EXISTS product_recommendations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_name TEXT NOT NULL,
          average_price DECIMAL(10, 2) NOT NULL,
          total_sales INTEGER NOT NULL DEFAULT 0,
          top_states TEXT[] DEFAULT '{}',
          growth_rate DECIMAL(5, 2) NOT NULL,
          profit_margin DECIMAL(5, 2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createRecommendationsError } = await supabase.rpc('execute_sql', { sql: createRecommendationsTableQuery });
      if (createRecommendationsError) {
        // If RPC doesn't work, the table might already exist or we'll use mock data
        console.warn('Note: Could not create product_recommendations table via RPC');
      }
      
      // Insert sample data
      const sampleStates = [
        { state: 'Lagos', top_product: 'Organic Tomatoes', total_purchases: 15420, average_price: 5.99, trend: '+23%', market_share: 28.5, supermarkets_count: 342 },
        { state: 'Abuja (FCT)', top_product: 'Fresh Strawberries', total_purchases: 8960, average_price: 7.50, trend: '+18%', market_share: 16.8, supermarkets_count: 156 },
        { state: 'Rivers', top_product: 'Organic Tomatoes', total_purchases: 6540, average_price: 6.25, trend: '+15%', market_share: 12.3, supermarkets_count: 98 },
        { state: 'Kano', top_product: 'Green Peas', total_purchases: 5890, average_price: 2.99, trend: '+12%', market_share: 11.0, supermarkets_count: 124 },
        { state: 'Oyo', top_product: 'Organic Tomatoes', total_purchases: 4320, average_price: 5.75, trend: '+20%', market_share: 8.1, supermarkets_count: 87 }
      ];
      
      const { error: insertStatesError } = await supabase
        .from('nigeria_state_analytics')
        .upsert(sampleStates, { onConflict: 'state' });
      
      if (insertStatesError) {
        console.warn('Note: Could not insert sample state data:', insertStatesError.message);
      }
      
      const sampleRecommendations = [
        { product_name: 'Organic Tomatoes', average_price: 5.99, total_sales: 26280, top_states: ['Lagos', 'Rivers', 'Oyo', 'Enugu', 'Kaduna'], growth_rate: 23.5, profit_margin: 35.2 },
        { product_name: 'Fresh Strawberries', average_price: 7.25, total_sales: 12740, top_states: ['Abuja', 'Delta', 'Lagos', 'Anambra'], growth_rate: 18.3, profit_margin: 42.8 },
        { product_name: 'Green Peas', average_price: 2.99, total_sales: 10450, top_states: ['Kano', 'Kaduna', 'Sokoto', 'Katsina'], growth_rate: 15.7, profit_margin: 28.5 }
      ];
      
      const { error: insertRecommendationsError } = await supabase
        .from('product_recommendations')
        .upsert(sampleRecommendations);
      
      if (insertRecommendationsError) {
        console.warn('Note: Could not insert sample recommendations:', insertRecommendationsError.message);
      }
    } catch (error) {
      console.error('Error in createAnalyticsTables:', error);
      // Don't throw the error - we want the app to continue working with mock data
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
