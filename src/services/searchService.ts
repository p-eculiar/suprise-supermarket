import { supabase } from '../lib/supabase';

export interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'page';
  title: string;
  description?: string;
  imageUrl?: string;
  url: string;
  price?: number;
  category?: string;
}

export class SearchService {
  /**
   * Global search across products, categories, and pages
   */
  static async globalSearch(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    try {
      // Search products
      const productResults = await this.searchProducts(searchTerm, limit);
      results.push(...productResults);

      // Search categories
      const categoryResults = await this.searchCategories(searchTerm);
      results.push(...categoryResults);

      // Add static pages if they match
      const pageResults = this.searchStaticPages(searchTerm);
      results.push(...pageResults);

      return results.slice(0, limit);
    } catch (error) {
      console.error('Error performing global search:', error);
      return [];
    }
  }

  /**
   * Search products by name, description, category
   */
  private static async searchProducts(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, image_url, price, category, categoryName')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%,categoryName.ilike.%${query}%`)
        .eq('isActive', true)
        .limit(limit);

      if (error) throw error;

      return (data || []).map(product => ({
        id: product.id,
        type: 'product' as const,
        title: product.name,
        description: product.description,
        imageUrl: product.image_url,
        url: `/products/${product.id}`,
        price: product.price,
        category: product.categoryName || product.category,
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Search categories
   */
  private static async searchCategories(query: string): Promise<SearchResult[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image_url')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (error) throw error;

      return (data || []).map(category => ({
        id: category.id,
        type: 'category' as const,
        title: category.name,
        description: category.description,
        imageUrl: category.image_url,
        url: `/products?category=${category.name.toLowerCase()}`,
      }));
    } catch (error) {
      console.error('Error searching categories:', error);
      return [];
    }
  }

  /**
   * Search static pages
   */
  private static searchStaticPages(query: string): SearchResult[] {
    const pages = [
      {
        id: 'about',
        title: 'About Us',
        description: 'Learn more about Surprise Supermarket',
        url: '/about',
        keywords: ['about', 'company', 'story', 'mission'],
      },
      {
        id: 'services',
        title: 'Our Services',
        description: 'Explore our delivery and pickup services',
        url: '/services',
        keywords: ['service', 'delivery', 'pickup', 'catering'],
      },
      {
        id: 'contact',
        title: 'Contact Us',
        description: 'Get in touch with our team',
        url: '/contact',
        keywords: ['contact', 'support', 'help', 'email', 'phone'],
      },
      {
        id: 'subscriptions',
        title: 'Subscriptions',
        description: 'Subscribe to our services',
        url: '/subscriptions',
        keywords: ['subscribe', 'membership', 'plan', 'premium'],
      },
      {
        id: 'diaspora',
        title: 'Diaspora Gifting',
        description: 'Send gifts to loved ones in Nigeria',
        url: '/diaspora-gifting',
        keywords: ['diaspora', 'gift', 'send', 'nigeria', 'family'],
      },
    ];

    return pages
      .filter(page => 
        page.title.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.keywords.some(k => k.includes(query))
      )
      .map(page => ({
        id: page.id,
        type: 'page' as const,
        title: page.title,
        description: page.description,
        url: page.url,
      }));
  }

  /**
   * Get search suggestions (autocomplete)
   */
  static async getSearchSuggestions(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('name')
        .ilike('name', `%${query}%`)
        .eq('isActive', true)
        .limit(8);

      if (error) throw error;

      return (data || []).map(p => p.name);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Save search history for user
   */
  static async saveSearchHistory(userId: string, query: string): Promise<void> {
    try {
      await supabase
        .from('search_history')
        .insert([{
          user_id: userId,
          query,
          created_at: new Date().toISOString(),
        }]);
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  /**
   * Get user's recent searches
   */
  static async getRecentSearches(userId: string, limit: number = 5): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('search_history')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(s => s.query);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  }

  /**
   * Get popular/trending searches
   */
  static async getTrendingSearches(limit: number = 10): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_trending_searches', { search_limit: limit });

      if (error) throw error;

      return (data || []).map((item: any) => item.query);
    } catch (error) {
      // If function doesn't exist, return default popular searches
      return [
        'Fresh vegetables',
        'Fruits',
        'Dairy products',
        'Meat',
        'Rice',
        'Cooking oil',
        'Bread',
        'Eggs',
      ];
    }
  }
}
