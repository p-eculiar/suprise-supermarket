import { supabase } from '../lib/supabase';

export interface DeliveryLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
}

export interface DeliveryTracking {
  id: string;
  order_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  current_location?: DeliveryLocation;
  driver_name?: string;
  driver_phone?: string;
  estimated_delivery_time?: string;
  delivery_notes?: string;
  tracking_history: DeliveryLocation[];
  created_at: string;
  updated_at: string;
}

export class DeliveryTrackingService {
  /**
   * Get tracking information for an order
   */
  static async getOrderTracking(orderId: string): Promise<DeliveryTracking | null> {
    try {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      return data as DeliveryTracking;
    } catch (error) {
      console.error('Error fetching delivery tracking:', error);
      return null;
    }
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Calculate estimated time of arrival (ETA)
   */
  static calculateETA(
    currentLat: number,
    currentLon: number,
    destLat: number,
    destLon: number,
    averageSpeedKmh: number = 40
  ): Date {
    const distance = this.calculateDistance(currentLat, currentLon, destLat, destLon);
    const timeInHours = distance / averageSpeedKmh;
    const timeInMs = timeInHours * 60 * 60 * 1000;
    
    return new Date(Date.now() + timeInMs);
  }

  /**
   * Update delivery location (called by driver app or GPS system)
   */
  static async updateDeliveryLocation(
    orderId: string,
    location: DeliveryLocation
  ): Promise<boolean> {
    try {
      // Get existing tracking
      const tracking = await this.getOrderTracking(orderId);
      
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      // Update tracking history
      const updatedHistory = [...tracking.tracking_history, location];

      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          current_location: location,
          tracking_history: updatedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (error) throw error;

      // Send real-time notification to user
      await this.notifyUserOfLocationUpdate(orderId, location);

      return true;
    } catch (error) {
      console.error('Error updating delivery location:', error);
      return false;
    }
  }

  /**
   * Create delivery tracking for new order
   */
  static async createDeliveryTracking(
    orderId: string,
    deliveryAddress: string,
    estimatedDeliveryTime: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .insert([{
          order_id: orderId,
          status: 'pending',
          estimated_delivery_time: estimatedDeliveryTime,
          tracking_history: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating delivery tracking:', error);
      return false;
    }
  }

  /**
   * Update delivery status
   */
  static async updateDeliveryStatus(
    orderId: string,
    status: DeliveryTracking['status'],
    notes?: string
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.delivery_notes = notes;
      }

      const { error } = await supabase
        .from('delivery_tracking')
        .update(updateData)
        .eq('order_id', orderId);

      if (error) throw error;

      // Send notification
      await this.notifyUserOfStatusChange(orderId, status);

      return true;
    } catch (error) {
      console.error('Error updating delivery status:', error);
      return false;
    }
  }

  /**
   * Assign driver to delivery
   */
  static async assignDriver(
    orderId: string,
    driverName: string,
    driverPhone: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          driver_name: driverName,
          driver_phone: driverPhone,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error assigning driver:', error);
      return false;
    }
  }

  /**
   * Send real-time notification to user
   */
  private static async notifyUserOfLocationUpdate(
    orderId: string,
    location: DeliveryLocation
  ): Promise<void> {
    // This would integrate with your notification service
    // For now, we'll create a notification record
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert([{
          user_id: order.user_id,
          type: 'delivery_update',
          title: 'Delivery Location Updated',
          message: `Your order is currently at ${location.address}`,
          data: { orderId, location },
          read: false,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error sending location notification:', error);
    }
  }

  /**
   * Send status change notification
   */
  private static async notifyUserOfStatusChange(
    orderId: string,
    status: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      pending: 'Your order is pending confirmation',
      confirmed: 'Your order has been confirmed',
      preparing: 'Your order is being prepared',
      out_for_delivery: 'Your order is out for delivery',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    try {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', orderId)
        .single();

      if (order) {
        await supabase.from('notifications').insert([{
          user_id: order.user_id,
          type: 'order_status',
          title: 'Order Status Update',
          message: statusMessages[status] || 'Your order status has been updated',
          data: { orderId, status },
          read: false,
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  }

  /**
   * Subscribe to real-time delivery updates
   */
  static subscribeToDeliveryUpdates(
    orderId: string,
    callback: (tracking: DeliveryTracking) => void
  ): () => void {
    const subscription = supabase
      .channel(`delivery:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          callback(payload.new as DeliveryTracking);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }

  /**
   * Get delivery proof (signature, photo)
   */
  static async uploadDeliveryProof(
    orderId: string,
    proofType: 'signature' | 'photo',
    file: File
  ): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orderId}-${proofType}-${Date.now()}.${fileExt}`;
      const filePath = `delivery-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('delivery-proofs')
        .getPublicUrl(filePath);

      // Update delivery tracking with proof
      await supabase
        .from('delivery_tracking')
        .update({
          [`${proofType}_url`]: data.publicUrl,
          status: 'delivered',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading delivery proof:', error);
      return null;
    }
  }
}
