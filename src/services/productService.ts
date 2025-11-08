import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image_url: string;
  stock: number;
  rating: number;
  featured: boolean;
  active: boolean;
  created_at: string;
  discount?: number;
}

export interface ProductFilters {
  category?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
  active?: boolean;
  minRating?: number;
  maxRating?: number;
  inStock?: boolean;
  brand?: string | string[];
}

class ProductService {
  // Enhanced in-memory cache with LRU eviction
  private cache = new Map<string, { at: number; data: any }>();
  private cacheSize = 200; // Increased cache size for better performance
  private ttlMs = 15 * 60 * 1000; // 15 minutes (increased from 10 minutes)

  // LRU eviction helper
  private evictLRU() {
    if (this.cache.size <= this.cacheSize) return;
    
    // Find oldest entry
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    this.cache.forEach((value, key) => {
      if (value.at < oldestTime) {
        oldestTime = value.at;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private getFromCache<T>(key: string): T | null {
    const hit = this.cache.get(key);
    if (!hit) return null;
    if (Date.now() - hit.at > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return hit.data as T;
  }

  private setCache<T>(key: string, data: T) {
    // Evict oldest entry if cache is full
    this.evictLRU();
    
    this.cache.set(key, { at: Date.now(), data });
  }

  // Add method to clear cache
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get all products with optional filters
   */
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    const cacheKey = `all:${JSON.stringify(filters || {})}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      console.log('Returning cached products:', cached.length, 'filters:', filters);
      return cached;
    }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Product loading timeout - please check your internet connection')), 10000) // Reduced timeout to 10s
      );
      
      // Race the main operation with a timeout
      const operationPromise = this._getAllProductsInternal(filters);
      
      const result = await Promise.race([
        operationPromise,
        timeoutPromise
      ]) as Product[];
      
      // Cache the result
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('❌ Get all products error:', error);
      
      // Try one last fallback - return empty array to prevent app crash
      return [];
    }
  }
  
  // Internal method to separate the main logic from timeout handling
  private async _getAllProductsInternal(filters?: ProductFilters): Promise<Product[]> {
    try {
      // Log the current user session for debugging
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('ProductService - Current session:', session);
      
      // Even if there's a session error, we should still try to fetch products
      if (sessionError) {
        console.warn('Session error (continuing anyway):', sessionError);
      }
      
      // First, let's get a count of all products to understand what we're working with
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('Error counting total products:', countError);
        console.error('Error details:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint
        });
      } else {
        console.log('Total products in database:', totalCount);
      }
      
      // Get count of active products
      const { count: activeCount, error: activeCountError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);
      
      if (activeCountError) {
        console.error('Error counting active products:', activeCountError);
        console.error('Error details:', {
          message: activeCountError.message,
          details: activeCountError.details,
          hint: activeCountError.hint
        });
      } else {
        console.log('Active products in database:', activeCount);
      }
      
      let query = supabase
        .from('products')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .order('created_at', { ascending: false });

      // Apply filters only if they exist
      if (filters) {
        console.log('Applying filters:', filters);
        // Apply active filter ONLY if explicitly set to true
        // This change removes the default active filter that was preventing all products from loading
        if (filters.active === true) {
          console.log('Applying active=true filter');
          query = query.eq('active', true);
        }
        
        if (filters.category) {
          if (Array.isArray(filters.category)) {
            // Multiple categories - use 'in' operator
            if (filters.category.length > 0) {
              console.log('Applying category filter:', filters.category);
              query = query.in('category', filters.category);
            }
          } else {
            // Single category
            console.log('Applying single category filter:', filters.category);
            query = query.eq('category', filters.category);
          }
        }

        if (filters.minPrice !== undefined) {
          console.log('Applying minPrice filter:', filters.minPrice);
          query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
          console.log('Applying maxPrice filter:', filters.maxPrice);
          query = query.lte('price', filters.maxPrice);
        }

        if (filters.search) {
          console.log('Applying search filter:', filters.search);
          // Use full text search for better performance
          query = query.textSearch('name', filters.search, {
            type: 'websearch',
            config: 'english'
          });
        }

        if (filters.featured === true) {
          console.log('Applying featured filter');
          query = query.eq('featured', true);
        }

        if (filters.bestseller === true) {
          // This would require a join or a separate view
          console.log('Applying bestseller filter (would require join or view)');
        }

        if (filters.minRating !== undefined) {
          console.log('Applying minRating filter:', filters.minRating);
          query = query.gte('rating', filters.minRating);
        }

        if (filters.maxRating !== undefined) {
          console.log('Applying maxRating filter:', filters.maxRating);
          query = query.lte('rating', filters.maxRating);
        }

        if (filters.inStock === true) {
          console.log('Applying inStock filter');
          query = query.gt('stock', 0);
        }

        if (filters.brand) {
          if (Array.isArray(filters.brand)) {
            if (filters.brand.length > 0) {
              console.log('Applying brand filter:', filters.brand);
              // Assuming brand is part of the name or a separate field
              // This is a simplified approach - you might need to adjust based on your data model
              query = query.in('category', filters.brand); // Using category as brand placeholder
            }
          } else {
            console.log('Applying single brand filter:', filters.brand);
            query = query.eq('category', filters.brand); // Using category as brand placeholder
          }
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Get all products database error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ Products fetched from database:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Get all products error:', error);
      // Return empty array to prevent app crash
      return [];
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    const cached = this.getFromCache<Product>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product by ID:', error);
        return null;
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || null;
    } catch (error) {
      console.error('Error in getProductById:', error);
      return null;
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const cacheKey = `featured:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('featured', true)
        .eq('active', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return [];
    }
  }

  /**
   * Get bestseller products
   */
  async getBestsellers(limit: number = 8): Promise<Product[]> {
    const cacheKey = `bestsellers:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Using the bestsellers_view for better performance
      const { data, error } = await supabase
        .from('bestsellers_view')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount,sales_count')
        .limit(limit);

      if (error) {
        console.error('Error fetching bestsellers:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getBestsellers:', error);
      return [];
    }
  }

  /**
   * Get popular products
   */
  async getPopularProducts(limit: number = 8): Promise<Product[]> {
    const cacheKey = `popular:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Using the popular_products_view for better performance
      const { data, error } = await supabase
        .from('popular_products_view')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount,view_count')
        .limit(limit);

      if (error) {
        console.error('Error fetching popular products:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getPopularProducts:', error);
      return [];
    }
  }

  /**
   * Get deals of the week
   */
  async getDealsOfTheWeek(limit: number = 6): Promise<Product[]> {
    const cacheKey = `deals:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Using the deals_of_week_view for better performance
      const { data, error } = await supabase
        .from('deals_of_week_view')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount,custom_name,custom_price,custom_discount,custom_description')
        .limit(limit);

      if (error) {
        console.error('Error fetching deals of the week:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getDealsOfTheWeek:', error);
      return [];
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string, limit: number = 20): Promise<Product[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .textSearch('name', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching products:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in searchProducts:', error);
      return [];
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string, limit?: number): Promise<Product[]> {
    const cacheKey = `category:${category}:${limit || 'all'}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      let query = supabase
        .from('products')
        .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('category', category)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products by category:', error);
        return [];
      }

      if (data) {
        this.setCache(cacheKey, data);
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      return [];
    }
  }

  /**
   * Get product categories with counts
   */
  async getProductCategories(): Promise<{ name: string; count: number }[]> {
    const cacheKey = 'categories';
    const cached = this.getFromCache<{ name: string; count: number }[]>(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      // Get count for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', category.name)
            .eq('active', true);
          
          return {
            name: category.name,
            count: count || 0
          };
        })
      );

      if (categoriesWithCounts) {
        this.setCache(cacheKey, categoriesWithCounts);
      }
      
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error in getProductCategories:', error);
      return [];
    }
  }
}

export const productService = new ProductService();