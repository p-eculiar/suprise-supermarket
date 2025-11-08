import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface InventoryAlert {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  threshold: number;
  alert_type: 'low_stock' | 'out_of_stock' | 'overstock';
  created_at: string;
  resolved: boolean;
}

class InventoryService {
  // Check and create low stock alerts
  async checkLowStockAlerts(threshold: number = 10) {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('id, name, stock, low_stock_threshold')
        .eq('active', true);

      if (error) throw error;

      const alerts: any[] = [];
      
      for (const product of products || []) {
        const stockThreshold = product.low_stock_threshold || threshold;
        
        if (product.stock <= stockThreshold && product.stock > 0) {
          // Create low stock alert
          await this.createInventoryAlert({
            product_id: product.id,
            product_name: product.name,
            current_stock: product.stock,
            threshold: stockThreshold,
            alert_type: 'low_stock'
          });

          // Send notification to admins
          await notificationService.createLowStockNotification(
            product.id,
            product.name,
            product.stock
          );
        } else if (product.stock === 0) {
          // Create out of stock alert
          await this.createInventoryAlert({
            product_id: product.id,
            product_name: product.name,
            current_stock: 0,
            threshold: stockThreshold,
            alert_type: 'out_of_stock'
          });
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking low stock alerts:', error);
      throw error;
    }
  }

  // Create inventory alert
  async createInventoryAlert(alertData: Omit<InventoryAlert, 'id' | 'created_at' | 'resolved'>) {
    try {
      // Check if alert already exists for this product
      const { data: existingAlert } = await supabase
        .from('inventory_alerts')
        .select('id')
        .eq('product_id', alertData.product_id)
        .eq('alert_type', alertData.alert_type)
        .eq('resolved', false)
        .single();

      if (existingAlert) {
        // Update existing alert
        const { error } = await supabase
          .from('inventory_alerts')
          .update({
            current_stock: alertData.current_stock,
            threshold: alertData.threshold
          })
          .eq('id', existingAlert.id);

        if (error) throw error;
        return existingAlert.id;
      } else {
        // Create new alert
        const { data, error } = await supabase
          .from('inventory_alerts')
          .insert([alertData])
          .select()
          .single();

        if (error) throw error;
        return data.id;
      }
    } catch (error) {
      console.error('Error creating inventory alert:', error);
      throw error;
    }
  }

  // Get all inventory alerts
  async getInventoryAlerts(resolved?: boolean) {
    try {
      let query = supabase
        .from('inventory_alerts')
        .select(`
          *,
          product:products (
            name,
            image_url,
            price
          )
        `)
        .order('created_at', { ascending: false });

      if (resolved !== undefined) {
        query = query.eq('resolved', resolved);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching inventory alerts:', error);
      throw error;
    }
  }

  // Resolve inventory alert
  async resolveInventoryAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from('inventory_alerts')
        .update({ resolved: true })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resolving inventory alert:', error);
      throw error;
    }
  }

  // Update product stock
  async updateProductStock(productId: string, newStock: number, reason?: string) {
    try {
      // First, get the current stock to log the movement
      const { data: currentProduct, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from('products')
        .update({ 
          stock: newStock,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) throw error;

      // Log stock movement
      await this.logStockMovement(productId, newStock, reason || 'Manual update', currentProduct?.stock);

      // Check if this creates any alerts
      await this.checkLowStockAlerts();

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Log stock movement
  async logStockMovement(productId: string, newStock: number, reason: string, previousStock?: number) {
    try {
      const { error } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: productId,
          previous_stock: previousStock || null,
          new_stock: newStock,
          movement_type: newStock > (previousStock || 0) ? 'in' : 'out',
          quantity: Math.abs(newStock - (previousStock || 0)),
          reason: reason,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging stock movement:', error);
      throw error;
    }
  }

  // Get stock movements for a product
  async getStockMovements(productId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products (
            name,
            image_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  }

  // Get inventory analytics
  async getInventoryAnalytics() {
    try {
      const { data: products, error } = await supabase
        .from('products')
        .select('stock, price, category')
        .eq('active', true);

      if (error) throw error;

      const analytics = {
        totalProducts: products?.length || 0,
        totalStockValue: 0,
        lowStockProducts: 0,
        outOfStockProducts: 0,
        overstockProducts: 0,
        categoryBreakdown: {} as Record<string, { count: number; value: number }>
      };

      for (const product of products || []) {
        const productValue = product.stock * product.price;
        analytics.totalStockValue += productValue;

        if (product.stock === 0) {
          analytics.outOfStockProducts++;
        } else if (product.stock < 10) {
          analytics.lowStockProducts++;
        } else if (product.stock > 100) {
          analytics.overstockProducts++;
        }

        // Category breakdown
        if (!analytics.categoryBreakdown[product.category]) {
          analytics.categoryBreakdown[product.category] = { count: 0, value: 0 };
        }
        analytics.categoryBreakdown[product.category].count++;
        analytics.categoryBreakdown[product.category].value += productValue;
      }

      return analytics;
    } catch (error) {
      console.error('Error getting inventory analytics:', error);
      throw error;
    }
  }

  // Set up real-time inventory monitoring
  setupInventoryMonitoring(onAlert: (alert: InventoryAlert) => void) {
    const channel = supabase
      .channel('inventory-monitoring')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
        },
        async (payload) => {
          const updatedProduct = payload.new as any;
          
          // Check if stock changed significantly
          if (payload.old && (payload.old as any).stock !== updatedProduct.stock) {
            await this.checkLowStockAlerts();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_alerts',
        },
        (payload) => {
          const newAlert = payload.new as InventoryAlert;
          onAlert(newAlert);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Bulk stock update
  async bulkStockUpdate(updates: Array<{ productId: string; newStock: number; reason?: string }>) {
    try {
      const promises = updates.map(update => 
        this.updateProductStock(update.productId, update.newStock, update.reason)
      );

      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Error in bulk stock update:', error);
      throw error;
    }
  }

  // Auto-reorder suggestions
  async getReorderSuggestions() {
    try {
      const { data: alerts, error } = await supabase
        .from('inventory_alerts')
        .select(`
          *,
          product:products (
            name,
            category,
            price,
            supplier,
            reorder_point,
            reorder_quantity
          )
        `)
        .eq('resolved', false)
        .eq('alert_type', 'low_stock')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return alerts?.map(alert => ({
        ...alert,
        suggestedReorderQuantity: alert.product?.reorder_quantity || 50,
        estimatedCost: (alert.product?.reorder_quantity || 50) * (alert.product?.price || 0)
      })) || [];
    } catch (error) {
      console.error('Error getting reorder suggestions:', error);
      throw error;
    }
  }
}

export const inventoryService = new InventoryService();
