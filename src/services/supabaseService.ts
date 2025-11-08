import { supabase } from '../lib/supabase';
import type { 
  Product, 
  User, 
  Order, 
  NigeriaStateAnalytics, 
  ProductRecommendation,
  PlatformSettings 
} from '../lib/supabase';

// Authentication Services
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },
};

// Product Services
export const productService = {
  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Product[];
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Product;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async searchProducts(query: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(20);
    
    if (error) throw error;
    return data as Product[];
  },
};

// User Services
export const userService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Order Services
export const orderService = {
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },

  async getOrderById(id: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Order;
  },

  async createOrder(order: Partial<Order>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data as Order;
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Order;
  },

  async getOrdersByUser(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Order[];
  },
};

// Nigeria Analytics Services
export const analyticsService = {
  async getNigeriaStateAnalytics() {
    const { data, error } = await supabase
      .from('nigeria_state_analytics')
      .select('*')
      .order('market_share', { ascending: false });
    
    if (error) throw error;
    return data as NigeriaStateAnalytics[];
  },

  async getProductRecommendations() {
    const { data, error } = await supabase
      .from('product_recommendations')
      .select('*')
      .order('growth_rate', { ascending: false })
      .limit(10);
    
    if (error) throw error;
    return data as ProductRecommendation[];
  },

  async getStateAnalyticsByState(state: string) {
    const { data, error } = await supabase
      .from('nigeria_state_analytics')
      .select('*')
      .eq('state', state)
      .single();
    
    if (error) throw error;
    return data as NigeriaStateAnalytics;
  },

  async updateStateAnalytics(stateData: Partial<NigeriaStateAnalytics>) {
    const { data, error } = await supabase
      .from('nigeria_state_analytics')
      .upsert([stateData])
      .select()
      .single();
    
    if (error) throw error;
    return data as NigeriaStateAnalytics;
  },
};

// Settings Services
export const settingsService = {
  async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*')
      .single();
    
    if (error) throw error;
    return data as PlatformSettings;
  },

  async updatePlatformSettings(settings: Partial<PlatformSettings>) {
    const { data, error } = await supabase
      .from('platform_settings')
      .update(settings)
      .eq('id', settings.id || '1')
      .select()
      .single();
    
    if (error) throw error;
    return data as PlatformSettings;
  },
};

// Dashboard Statistics
export const dashboardService = {
  async getDashboardStats() {
    // Get total revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, platform_fee, status');
    
    // Get user counts
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    // Get product count
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const platformFees = orders?.reduce((sum, order) => sum + order.platform_fee, 0) || 0;
    const activeOrders = orders?.filter(o => o.status === 'processing' || o.status === 'pending').length || 0;
    
    return {
      totalRevenue,
      totalOrders: orders?.length || 0,
      totalUsers: totalUsers || 0,
      totalProducts: totalProducts || 0,
      platformFees,
      activeOrders,
    };
  },

  async getRecentOrders(limit = 10) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Order[];
  },

  async getTopProducts(limit = 5) {
    const { data, error } = await supabase
      .rpc('get_top_selling_products', { limit_count: limit });
    
    if (error) throw error;
    return data;
  },
};

// File Upload Service
export const storageService = {
  async uploadProductImage(file: File, productId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteProductImage(filePath: string) {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;
  },
};
