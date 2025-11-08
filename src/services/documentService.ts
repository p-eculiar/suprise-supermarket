import { supabase } from '../lib/supabase';

export interface InvoiceData {
  order_id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  billing_address: string;
  shipping_address: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  order_date: string;
  due_date: string;
}

export interface ReceiptData {
  order_id: string;
  receipt_number: string;
  customer_name: string;
  customer_email: string;
  items: {
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
  subtotal: number;
  tax: number;
  delivery_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  payment_date: string;
  transaction_reference: string;
}

class DocumentService {
  /**
   * Generate a unique invoice number
   */
  generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  /**
   * Generate a unique receipt number
   */
  generateReceiptNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `REC-${timestamp}-${random}`;
  }

  /**
   * Create an invoice for an order
   */
  async createInvoice(invoiceData: InvoiceData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('invoices')
        .insert([invoiceData]);

      if (error) {
        console.error('Error creating invoice:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Create invoice error:', error);
      return false;
    }
  }

  /**
   * Create a receipt for an order
   */
  async createReceipt(receiptData: ReceiptData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('receipts')
        .insert([receiptData]);

      if (error) {
        console.error('Error creating receipt:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Create receipt error:', error);
      return false;
    }
  }

  /**
   * Get invoice by order ID
   */
  async getInvoiceByOrderId(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        console.error('Error fetching invoice:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get invoice error:', error);
      return null;
    }
  }

  /**
   * Get receipt by order ID
   */
  async getReceiptByOrderId(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        console.error('Error fetching receipt:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get receipt error:', error);
      return null;
    }
  }

  /**
   * Get all invoices for admin
   */
  async getAllInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          orders (
            order_number,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get invoices error:', error);
      return [];
    }
  }

  /**
   * Get all receipts for admin
   */
  async getAllReceipts() {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          orders (
            order_number,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching receipts:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Get receipts error:', error);
      return [];
    }
  }
}

export const documentService = new DocumentService();