import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  compare_price?: number;
  stock: number;
  sku: string;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin' | 'vendor';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  platform_fee: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface NigeriaStateAnalytics {
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

export interface PlatformSettings {
  id: string;
  platform_fee_percentage: number;
  tax_rate: number;
  minimum_order: number;
  shipping_fee: number;
  free_shipping_threshold: number;
  site_name: string;
  support_email: string;
  currency: string;
  timezone: string;
  updated_at: string;
}
