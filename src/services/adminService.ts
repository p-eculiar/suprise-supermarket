import { supabase } from '../lib/supabase';
import { productService } from './productService';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
}

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.setMonth(now.getMonth() - 1));

      // Get all orders
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total, created_at, payment_status');

      // Get orders from last month for growth calculation
      const { data: lastMonthOrders } = await supabase
        .from('orders')
        .select('total')
        .lt('created_at', lastMonth.toISOString());

      // Get all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, created_at');

      // Get users from last month
      const { data: lastMonthUsers } = await supabase
        .from('profiles')
        .select('id')
        .lt('created_at', lastMonth.toISOString());

      // Get all products
      const products = await productService.getAllProducts();

      // Calculate totals
      const totalRevenue = allOrders
        ?.filter(o => o.payment_status === 'paid')
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

      const lastMonthRevenue = lastMonthOrders
        ?.reduce((sum, order) => sum + parseFloat(order.total || 0), 0) || 0;

      const totalOrders = allOrders?.length || 0;
      const totalCustomers = allUsers?.length || 0;
      const totalProducts = products.length;

      // Calculate growth
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const ordersGrowth = (lastMonthOrders?.length || 0) > 0
        ? ((totalOrders - (lastMonthOrders?.length || 0)) / (lastMonthOrders?.length || 1)) * 100
        : 0;

      const customersGrowth = (lastMonthUsers?.length || 0) > 0
        ? ((totalCustomers - (lastMonthUsers?.length || 0)) / (lastMonthUsers?.length || 1)) * 100
        : 0;

      return {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
      };
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        customersGrowth: 0,
      };
    }
  }

  /**
   * Get sales data for chart (last 7 days)
   */
  async getSalesData(days: number = 7): Promise<SalesData[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('orders')
        .select('total, created_at, payment_status')
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching sales data:', error);
        return [];
      }

      // Group by date
      const salesByDate: Record<string, { revenue: number; orders: number }> = {};

      data.forEach((order: any) => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!salesByDate[date]) {
          salesByDate[date] = { revenue: 0, orders: 0 };
        }
        salesByDate[date].revenue += parseFloat(order.total || 0);
        salesByDate[date].orders += 1;
      });

      // Convert to array
      return Object.entries(salesByDate).map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
      }));
    } catch (error) {
      console.error('Get sales data error:', error);
      return [];
    }
  }

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent orders:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get recent orders error:', error);
      return [];
    }
  }

  /**
   * Get all orders with pagination
   */
  async getAllOrders(page: number = 1, pageSize: number = 20) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return { orders: [], total: 0 };
      }

      return {
        orders: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Get all orders error:', error);
      return { orders: [], total: 0 };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update order status error:', error);
      return false;
    }
  }

  /**
   * Get all users
   */
  async getAllUsers(page: number = 1, pageSize: number = 20) {
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return { users: [], total: 0 };
      }

      return {
        users: data || [],
        total: count || 0,
      };
    } catch (error) {
      console.error('Get all users error:', error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Get top selling products
   */
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      // This requires joining order_items with products
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_id,
          product_name,
          quantity,
          price
        `);

      if (error) {
        console.error('Error fetching top products:', error);
        return [];
      }

      // Group by product and calculate totals
      const productSales: Record<string, any> = {};

      data.forEach((item: any) => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            id: item.product_id,
            name: item.product_name,
            sales: 0,
            revenue: 0,
          };
        }
        productSales[item.product_id].sales += item.quantity;
        productSales[item.product_id].revenue += item.quantity * parseFloat(item.price);
      });

      // Convert to array and sort
      const topProducts = Object.values(productSales)
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, limit);

      return topProducts as TopProduct[];
    } catch (error) {
      console.error('Get top products error:', error);
      return [];
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts() {
    return await productService.getLowStockProducts(10);
  }

  /**
   * Search orders
   */
  async searchOrders(query: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error searching orders:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Search orders error:', error);
      return [];
    }
  }

  /**
   * Get orders by status
   */
  async getOrdersByStatus(status: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders by status:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get orders by status error:', error);
      return [];
    }
  }

  /**
   * Get revenue by category
   */
  async getRevenueByCategory() {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product:products (category),
          price,
          quantity
        `);

      if (error) {
        console.error('Error fetching revenue by category:', error);
        return {};
      }

      const categoryRevenue: Record<string, number> = {};

      data.forEach((item: any) => {
        const category = item.product?.category || 'Unknown';
        const revenue = parseFloat(item.price) * item.quantity;
        categoryRevenue[category] = (categoryRevenue[category] || 0) + revenue;
      });

      return categoryRevenue;
    } catch (error) {
      console.error('Get revenue by category error:', error);
      return {};
    }
  }
}

export const adminService = new AdminService();
