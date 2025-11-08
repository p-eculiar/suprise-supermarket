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
  // In-memory cache to speed up loads between navigations
  private cache = new Map<string, { at: number; data: any }>();
  private ttlMs = 60 * 1000; // 60 seconds

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
    // Temporarily disable cache for debugging
    // const cached = this.getFromCache<Product[]>(cacheKey);
    // if (cached) {
    //   console.log('Returning cached products:', cached.length, 'filters:', filters);
    //   return cached;
    // }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Product loading timeout - please check your internet connection')), 15000)
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
        
        if (filters.minRating !== undefined) {
          console.log('Applying minRating filter:', filters.minRating);
          query = query.gte('rating', filters.minRating);
        }
        
        if (filters.maxRating !== undefined) {
          console.log('Applying maxRating filter:', filters.maxRating);
          query = query.lte('rating', filters.maxRating);
        }
        
        if (filters.inStock !== undefined) {
          if (filters.inStock) {
            console.log('Applying inStock filter: true');
            query = query.gt('stock', 0);
          } else {
            console.log('Applying inStock filter: false');
            query = query.eq('stock', 0);
          }
        }

        if (filters.search) {
          console.log('Applying search filter:', filters.search);
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters.featured) {
          console.log('Applying featured filter');
          query = query.eq('featured', true);
        }

        if (filters.bestseller) {
          console.log('Applying bestseller filter');
          query = query.eq('active', true);
        }
      }
      // Removed the else clause that was applying active filter by default

      let { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching products:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Try a fallback query without RLS restrictions for debugging
        console.log('Trying fallback query...');
        const fallbackQuery = supabase
          .from('products')
          .select('id,name,description,price,category,image_url,stock,rating,featured,active,created_at,discount')
          .order('created_at', { ascending: false });
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          console.error('Fallback error details:', {
            message: fallbackError.message,
            details: fallbackError.details,
            hint: fallbackError.hint
          });
          
          // Try an even simpler query as last resort
          console.log('Trying last resort query...');
          const lastResortQuery = supabase
            .from('products')
            .select('id,name,price,category,image_url,stock')
            .limit(100);
            
          const { data: lastResortData, error: lastResortError } = await lastResortQuery;
          if (lastResortError) {
            console.error('❌ Last resort query also failed:', lastResortError);
            // Even if all queries fail, return empty array instead of throwing error
            return [];
          }
          
          console.log('✅ Last resort query successful, got', lastResortData?.length, 'products');
          // Map to proper Product type with default values
          const result = (lastResortData || []).map(item => ({
            id: item.id,
            name: item.name,
            description: '',
            price: item.price,
            category: item.category,
            image_url: item.image_url,
            stock: item.stock,
            rating: 0,
            featured: false,
            active: true,
            created_at: new Date().toISOString(),
            discount: 0
          }));
          this.setCache(`all:${JSON.stringify(filters || {})}`, result);
          return result;
        }
        
        console.log('✅ Fallback query successful, got', fallbackData?.length, 'products');
        // No active filter on fallback data either
        data = fallbackData;
        const result = data || [];
        console.log('Fallback query result:', result.length, 'products');
        this.setCache(`all:${JSON.stringify(filters || {})}`, result);
        return result;
      }

      console.log('✅ Main query successful, got', data?.length, 'products');
      const result = data as Product[];
      this.setCache(`all:${JSON.stringify(filters || {})}`, result);
      return result;
    } catch (error) {
      console.error('Unexpected error in _getAllProductsInternal:', error);
      // Even if there's an unexpected error, return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        return null;
      }

      return data as Product;
    } catch (error) {
      console.error('Get product by ID error:', error);
      return null;
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.getAllProducts({ category });
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const cacheKey = `featured:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) {
      console.log('Returning cached featured products:', cached.length);
      return cached;
    }
    try {
      console.log('🔄 Fetching featured products from database...');
      
      // Log the current user session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ProductService - Featured products - Current session:', session);
      
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('featured', true)
        .eq('active', true)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching featured products:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        // Try a fallback query without some of the restrictions
        console.log('Trying fallback query for featured products...');
        const fallbackQuery = supabase
          .from('products')
          .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
          .eq('featured', true)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(limit);
      
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          return [];
        }
      
        const filteredData = (fallbackData || []).filter(p => p.image_url && p.image_url !== '');
        console.log('Fallback query successful, filtered data:', filteredData.length);
        const result = filteredData as Product[];
        this.setCache(cacheKey, result);
        return result;
      }

      // Handle case where data might be null or undefined
      if (!data) {
        console.log('⚠️ No data returned from featured products query');
        return [];
      }

      console.log('✅ Featured products fetched:', data.length);
      const result = data as Product[];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('❌ Get featured products error:', error);
      return [];
    }
  }

  /**
   * Get best seller products
   */
  async getBestSellers(limit: number = 6): Promise<Product[]> {
    const cacheKey = `bestsellers:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) return cached;
    try {
      console.log('Fetching bestsellers from database...');
      
      // Log the current user session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ProductService - Best sellers - Current session:', session);
      
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('active', true)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching bestsellers:', error);
        // Try a fallback query without some of the restrictions
        console.log('Trying fallback query for bestsellers...');
        const fallbackQuery = supabase
          .from('products')
          .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
          .eq('active', true)
          .order('rating', { ascending: false })
          .limit(limit);
      
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return [];
        }
      
        const filteredData = (fallbackData || []).filter(p => p.image_url && p.image_url !== '');
        console.log('Fallback query successful, filtered data:', filteredData.length);
        const result = filteredData as Product[];
        this.setCache(cacheKey, result);
        return result;
      }

      // Handle case where data might be null or undefined
      if (!data) {
        console.log('No data returned from bestsellers query');
        return [];
      }

      console.log('Bestsellers fetched:', data.length);
      const result = data as Product[];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Get bestsellers error:', error);
      return [];
    }
  }

  /**
   * Get popular products (high rating)
   */
  async getPopularProducts(limit: number = 6): Promise<Product[]> {
    const cacheKey = `popular:${limit}`;
    const cached = this.getFromCache<Product[]>(cacheKey);
    if (cached) return cached;
    try {
      console.log('Fetching popular products from database...');
      
      // Log the current user session for debugging
      const { data: { session } } = await supabase.auth.getSession();
      console.log('ProductService - Popular products - Current session:', session);
      
      const { data, error } = await supabase
        .from('products')
        .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
        .eq('active', true)
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('stock', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular products:', error);
        // Try a fallback query without some of the restrictions
        console.log('Trying fallback query for popular products...');
        const fallbackQuery = supabase
          .from('products')
          .select('id,name,price,category,image_url,stock,rating,featured,active,created_at,discount')
          .eq('active', true)
          .order('stock', { ascending: false })
          .limit(limit);
      
        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        if (fallbackError) {
          console.error('Fallback query also failed:', fallbackError);
          return [];
        }
      
        const filteredData = (fallbackData || []).filter(p => p.image_url && p.image_url !== '');
        console.log('Fallback query successful, filtered data:', filteredData.length);
        const result = filteredData as Product[];
        this.setCache(cacheKey, result);
        return result;
      }

      // Handle case where data might be null or undefined
      if (!data) {
        console.log('No data returned from popular products query');
        return [];
      }

      console.log('Popular products fetched:', data.length);
      const result = data as Product[];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Get popular products error:', error);
      return [];
    }
  }

  /**
   * Get Deals of the Week (from dedicated table)
   */
  async getDealsOfWeek(limit: number = 8): Promise<Product[]> {
    try {
      console.log('🔄 Fetching deals of week from database...');
      
      // First check if the view exists and is accessible
      const { data: countData, error: countError } = await supabase
        .from('deals_of_week_view')
        .select('product_id', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Error checking deals_of_week_view existence:', countError);
        console.error('Error details:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint
        });
        // Try to check if the underlying table exists
        const { data: tableCheck, error: tableError } = await supabase
          .from('deals_of_week')
          .select('id', { count: 'exact', head: true });
        
        if (tableError) {
          console.error('❌ deals_of_week table also not accessible:', tableError);
          console.error('Table error details:', {
            message: tableError.message,
            details: tableError.details,
            hint: tableError.hint
          });
        } else {
          console.log('✅ deals_of_week table exists with', tableCheck?.length || 0, 'records');
        }
        
        // Return empty array if view is not accessible
        return [];
      } else {
        console.log('✅ deals_of_week_view accessible, found', countData?.length || 0, 'records');
      }
      
      // Use a simpler query that matches the view structure exactly
      let { data, error } = await supabase
        .from('deals_of_week_view')
        .select('*')
        .order('priority', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching deals of week:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Try a more basic query as fallback
        console.log('Trying fallback query...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('deals_of_week_view')
          .select('product_id, name, image_url, price, discount, category, stock, rating')
          .order('priority', { ascending: true })
          .limit(limit);
          
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          return [];
        }
        
        console.log('Fallback query successful, got', fallbackData?.length || 0, 'records');
        data = fallbackData;
      }
      
      console.log('✅ Deals of week fetched:', data?.length || 0);
      
      // Handle case where data might be null or undefined
      if (!data || data.length === 0) {
        console.log('⚠️ No data returned from deals of week query');
        return [];
      }

      // Debug: Log the raw data to see the structure
      console.log('-deals_of_week_view raw data:', JSON.stringify(data, null, 2));

      // Map the data properly to Product interface
      const result = (data as any[]).map((row, index) => {
        // Debug: Log each row to see the structure
        console.log(`Mapping row ${index}:`, JSON.stringify(row, null, 2));
        
        // Handle different possible column names based on view structure
        // Try to get the best available values for each field
        let name = 'Untitled Deal';
        if (row.custom_name && row.custom_name.trim() !== '') {
          name = row.custom_name;
        } else if (row.product_name && row.product_name.trim() !== '') {
          name = row.product_name;
        } else if (row.name && row.name.trim() !== '') {
          name = row.name;
        }
        
        let image_url = '';
        if (row.custom_image_url && row.custom_image_url.trim() !== '') {
          image_url = row.custom_image_url;
        } else if (row.image_url && row.image_url.trim() !== '') {
          image_url = row.image_url;
        }
        
        let price = 0;
        if (row.custom_price !== undefined && row.custom_price !== null && !isNaN(row.custom_price)) {
          price = row.custom_price;
        } else if (row.product_price !== undefined && row.product_price !== null && !isNaN(row.product_price)) {
          price = row.product_price;
        } else if (row.price !== undefined && row.price !== null && !isNaN(row.price)) {
          price = row.price;
        }
        
        let discount = 0;
        if (row.custom_discount !== undefined && row.custom_discount !== null && !isNaN(row.custom_discount)) {
          discount = row.custom_discount;
        } else if (row.product_discount !== undefined && row.product_discount !== null && !isNaN(row.product_discount)) {
          discount = row.product_discount;
        } else if (row.discount !== undefined && row.discount !== null && !isNaN(row.discount)) {
          discount = row.discount;
        }
        
        const category = (row.category && row.category.trim() !== '') ? row.category : 'Deals';
        const stock = (row.stock !== undefined && row.stock !== null && !isNaN(row.stock)) ? row.stock : 0;
        const rating = (row.rating !== undefined && row.rating !== null && !isNaN(row.rating)) ? row.rating : 0;
        
        const mappedProduct = {
          id: row.product_id || row.id || '',
          name: name,
          image_url: image_url,
          price: price,
          discount: discount,
          category: category,
          stock: stock,
          rating: rating,
          featured: false,
          active: true,
          created_at: new Date().toISOString()
        } as Product;
        
        console.log(`Mapped product ${index}:`, JSON.stringify(mappedProduct, null, 2));
        return mappedProduct;
      }).filter(product => {
        const isValid = product.id && product.name && product.image_url && product.name !== 'Untitled Deal';
        console.log('Filtering product:', product.name, 'isValid:', isValid);
        return isValid;
      }); // Filter out invalid products
      
      console.log('✅ Mapped deals result:', result.length);
      return result;
    } catch (e) {
      console.error('❌ Get deals error:', e);
      return [];
    }
  }

  /**
   * Get products with low stock
   */
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .lte('stock', threshold)
        .order('stock', { ascending: true });

      if (error) {
        console.error('Error fetching low stock products:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Get low stock products error:', error);
      return [];
    }
  }

  /**
   * Get product count by category
   */
  async getProductCountByCategory(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('active', true)
        .not('category', 'is', null)
        .neq('category', '');

      if (error) {
        console.error('Error counting products:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      data.forEach((product: any) => {
        if (product.category && product.category.trim()) {
          const category = product.category.trim();
          counts[category] = (counts[category] || 0) + 1;
        }
      });

      return counts;
    } catch (error) {
      console.error('Get product count error:', error);
      return {};
    }
  }

  /**
   * Get all distinct categories
   */
  async getCategories(): Promise<string[]> {
    const cacheKey = 'categories';
    const cached = this.getFromCache<string[]>(cacheKey);
    if (cached) {
      console.log('Returning cached categories:', cached.length);
      return cached;
    }
    try {
      console.log('🔄 Fetching categories from database...');
      
      // First check if products table exists and is accessible
      const { count: totalCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        console.error('❌ Error checking products table:', countError);
        console.error('Error details:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint
        });
      } else {
        console.log('✅ Products table accessible, found', totalCount, 'total records');
      }
      
      // Try to get all categories without filtering by status
      let { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('active', true);

      console.log('Categories query result:', { data: data?.length || 0, error });

      if (error) {
        console.error('❌ Error fetching categories:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Try a fallback query without active filter
        console.log('Trying fallback query without active filter...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('products')
          .select('category');
          
        if (fallbackError) {
          console.error('❌ Fallback query also failed:', fallbackError);
          return [];
        }
        
        console.log('Fallback query successful, got', fallbackData?.length || 0, 'records');
        data = fallbackData;
      }

      // Handle case where data might be null or undefined
      if (!data) {
        console.log('⚠️ No data returned from categories query');
        return [];
      }

      // Extract unique categories and filter out empty ones
      const filteredCategories = data
        .map((product: any) => product.category)
        .filter((cat: any) => cat && cat.trim() !== '');
      
      const categorySet = new Set(filteredCategories);
      const categories: string[] = Array.from(categorySet);
      
      console.log('✅ Unique categories extracted:', categories.length, categories);
      this.setCache(cacheKey, categories);
      return categories;
    } catch (error) {
      console.error('❌ Get categories error:', error);
      return [];
    }
  }

  /**
   * Create a new product (Admin only)
   */
  async createProduct(productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) {
        console.error('Error creating product:', error);
        throw error;
      }

      return data as Product;
    } catch (error) {
      console.error('Create product error:', error);
      return null;
    }
  }

  /**
   * Update a product (Admin only)
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update product error:', error);
      return false;
    }
  }

  /**
   * Delete a product (Admin only)
   */
  async deleteProduct(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      return false;
    }
  }

  /**
   * Update product stock
   */
  async updateStock(id: string, quantity: number): Promise<boolean> {
    try {
      const product = await this.getProductById(id);
      if (!product) return false;

      return await this.updateProduct(id, { stock: product.stock + quantity });
    } catch (error) {
      console.error('Update stock error:', error);
      return false;
    }
  }

  /**
   * Get product statistics (Admin)
   */
  async getProductStats(): Promise<{
    total: number;
    featured: number;
    bestsellers: number;
    lowStock: number;
    outOfStock: number;
  }> {
    try {
      const [allProducts, lowStock] = await Promise.all([
        this.getAllProducts(),
        this.getLowStockProducts(),
      ]);

      return {
        total: allProducts.length,
        featured: allProducts.filter(p => p.featured).length,
        bestsellers: allProducts.filter(p => p.active).length,
        lowStock: lowStock.length,
        outOfStock: allProducts.filter(p => p.stock === 0).length,
      };
    } catch (error) {
      console.error('Get product stats error:', error);
      return {
        total: 0,
        featured: 0,
        bestsellers: 0,
        lowStock: 0,
        outOfStock: 0,
      };
    }
  }
}

export const productService = new ProductService();
