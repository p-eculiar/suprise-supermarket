import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  discount?: number;
  is_featured?: boolean;
  is_bestseller?: boolean;
  rating?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  featured?: boolean;
  bestseller?: boolean;
}

class ProductService {
  /**
   * Get all products with optional filters
   */
  async getAllProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
      let query = supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      if (filters?.bestseller) {
        query = query.eq('is_bestseller', true);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Get all products error:', error);
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
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Get featured products error:', error);
      return [];
    }
  }

  /**
   * Get best seller products
   */
  async getBestSellers(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_bestseller', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching bestsellers:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Get bestsellers error:', error);
      return [];
    }
  }

  /**
   * Get popular products (high rating)
   */
  async getPopularProducts(limit: number = 6): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching popular products:', error);
        return [];
      }

      return data as Product[];
    } catch (error) {
      console.error('Get popular products error:', error);
      return [];
    }
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<Product[]> {
    return this.getAllProducts({ search: query });
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
        .select('category');

      if (error) {
        console.error('Error counting products:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      data.forEach((product: any) => {
        counts[product.category] = (counts[product.category] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Get product count error:', error);
      return {};
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
        featured: allProducts.filter(p => p.is_featured).length,
        bestsellers: allProducts.filter(p => p.is_bestseller).length,
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
