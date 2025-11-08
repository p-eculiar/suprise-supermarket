import { createClient } from '@supabase/supabase-js';

// Supabase configuration - supports both Vite (VITE_*) and CRA (REACT_APP_*)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const viteEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : {}) || {};
const supabaseUrl = viteEnv.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = viteEnv.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase env vars missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
}

// Create Supabase client with real-time enabled
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Expose for debugging in browser console
// Usage: window.__SUPABASE__
// This helps verify the app is pointed at the expected project at runtime
// (safe: only the anon client already in the bundle)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__SUPABASE__ = supabase;
try {
  const base = (supabase as any)?.storageUrl?.replace('/storage/v1', '') || supabaseUrl;
  // eslint-disable-next-line no-console
  console.log('[Supabase] Base URL:', base);
} catch {
  // ignore
}

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
