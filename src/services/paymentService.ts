import { supabase } from '../lib/supabase';

export interface OrderData {
  user_id: string;
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
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image_url: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PaystackConfig {
  reference: string;
  email: string;
  amount: number; // in kobo (multiply by 100)
  publicKey: string;
  metadata?: {
    custom_fields: { display_name: string; variable_name: string; value: string }[];
  };
}

class PaymentService {
  private paystackPublicKey: string;

  constructor() {
    this.paystackPublicKey = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || '';
    if (!this.paystackPublicKey) {
      console.warn('Paystack public key not configured');
    }
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `PAY-${timestamp}-${random}`;
  }

  /**
   * Create an order in the database
   */
  async createOrder(orderData: OrderData): Promise<{ orderId: string; orderNumber: string } | null> {
    try {
      // Generate order number
      const { data: orderNumberData, error: orderNumberError } = await supabase
        .rpc('generate_order_number');

      if (orderNumberError) {
        console.error('Error generating order number:', orderNumberError);
        throw orderNumberError;
      }

      const orderNumber = orderNumberData as string;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: orderData.user_id,
            order_number: orderNumber,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            delivery_address: orderData.delivery_address,
            delivery_city: orderData.delivery_city,
            delivery_state: orderData.delivery_state,
            delivery_postal_code: orderData.delivery_postal_code,
            delivery_notes: orderData.delivery_notes,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            delivery_fee: orderData.delivery_fee,
            discount: orderData.discount,
            total: orderData.total,
            payment_status: 'pending',
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) {
        console.error('Error creating order:', orderError);
        throw orderError;
      }

      // Create order items
      const orderItems = orderData.items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image_url: item.product_image_url,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }

      return {
        orderId: order.id,
        orderNumber: order.order_number,
      };
    } catch (error) {
      console.error('Create order error:', error);
      return null;
    }
  }

  /**
   * Get Paystack configuration for payment
   */
  getPaystackConfig(
    email: string,
    amount: number,
    orderId: string,
    customerName: string
  ): PaystackConfig {
    const reference = this.generateReference();

    return {
      reference,
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      publicKey: this.paystackPublicKey,
      metadata: {
        custom_fields: [
          {
            display_name: 'Order ID',
            variable_name: 'order_id',
            value: orderId,
          },
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: customerName,
          },
        ],
      },
    };
  }

  /**
   * Update order payment status
   */
  async updateOrderPaymentStatus(
    orderId: string,
    status: 'paid' | 'failed' | 'pending',
    paystackReference?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        payment_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
        updateData.status = 'processing';
      }

      if (paystackReference) {
        updateData.paystack_reference = paystackReference;
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order payment status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Update payment status error:', error);
      return false;
    }
  }

  /**
   * Create payment transaction record
   */
  async createPaymentTransaction(
    orderId: string,
    reference: string,
    amount: number,
    status: 'success' | 'failed' | 'pending',
    providerReference?: string,
    providerResponse?: any
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('payment_transactions')
        .insert([
          {
            order_id: orderId,
            reference,
            amount,
            currency: 'NGN',
            provider: 'paystack',
            provider_reference: providerReference,
            provider_response: providerResponse,
            status,
          },
        ]);

      if (error) {
        console.error('Error creating payment transaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Create payment transaction error:', error);
      return false;
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Error fetching order:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get order error:', error);
      return null;
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get user orders error:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
