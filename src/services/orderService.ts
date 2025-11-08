import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface OrderItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  delivery_city: string;
  delivery_state: string;
  delivery_postal_code?: string;
  delivery_notes?: string;
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  payment_reference?: string;
  paystack_reference?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  delivered_at?: string;
  approved_at?: string;
  approved_by?: string;
  approval_status?: string;
  approval_notes?: string;
  driver_id?: string;
  bank_transfer_details?: any;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  reference: string;
  amount: number;
  currency: string;
  provider: string;
  provider_reference?: string;
  provider_response?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

class OrderService {
  // Create a new order
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>, items: OrderItem[]) {
    try {
      // Start a transaction
      const { data: order, error: orderError } = await supabase.rpc('create_order_with_items', {
        p_user_id: orderData.user_id,
        p_customer_name: orderData.customer_name,
        p_customer_email: orderData.customer_email,
        p_customer_phone: orderData.customer_phone,
        p_delivery_address: orderData.delivery_address,
        p_delivery_city: orderData.delivery_city,
        p_delivery_state: orderData.delivery_state,
        p_delivery_postal_code: orderData.delivery_postal_code,
        p_delivery_notes: orderData.delivery_notes,
        p_subtotal: orderData.subtotal,
        p_tax: orderData.tax,
        p_delivery_fee: orderData.delivery_fee,
        p_discount: orderData.discount,
        p_total: orderData.total,
        p_payment_method: orderData.payment_method,
        p_items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.subtotal
        }))
      });

      if (orderError) throw orderError;

      // Create notification for user
      await notificationService.createOrderNotification(
        orderData.user_id,
        order.id,
        'pending',
        order.order_number
      );

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // Get user orders
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  // Get order items
  async getOrderItems(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching order items:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string, userId: string, orderNumber?: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      // Create notification for user
      if (data) {
        await notificationService.createOrderNotification(
          data.user_id,
          orderId,
          status,
          orderNumber || data.order_number
        );
      }

      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId: string, paymentStatus: string, reference?: string) {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString()
      };

      if (paymentStatus === 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      if (reference) {
        updateData.paystack_reference = reference;
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Create payment transaction
  async createPaymentTransaction(transaction: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert([transaction])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw error;
    }
  }

  // Get payment transactions for an order
  async getOrderTransactions(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payment transactions:', error);
      throw error;
    }
  }

  // Get admin orders with pagination
  async getAdminOrders(page: number = 1, limit: number = 20, status?: string) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          user:users(full_name, email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { orders: data || [], count: count || 0 };
    } catch (error) {
      console.error('Error fetching admin orders:', error);
      throw error;
    }
  }

  // Get order statistics for admin dashboard
  async getOrderStats() {
    try {
      const { data, error } = await supabase.rpc('get_order_statistics');
      if (error) throw error;
      return data[0] || {
        total_orders: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0
      };
    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {
        total_orders: 0,
        pending_orders: 0,
        processing_orders: 0,
        shipped_orders: 0,
        delivered_orders: 0,
        cancelled_orders: 0,
        total_revenue: 0
      };
    }
  }

  // Search orders
  async searchOrders(query: string, userId?: string) {
    try {
      let supabaseQuery = supabase
        .from('orders')
        .select('*')
        .or(`order_number.ilike.%${query}%,customer_name.ilike.%${query}%,customer_email.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(20);

      if (userId) {
        supabaseQuery = supabaseQuery.eq('user_id', userId);
      }

      const { data, error } = await supabaseQuery;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching orders:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();