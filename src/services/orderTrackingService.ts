import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface OrderTrackingEvent {
  id: string;
  order_id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  description: string;
  estimated_delivery?: string;
  driver_info?: {
    name: string;
    phone: string;
    vehicle: string;
    photo?: string;
  };
  created_at: string;
}

export interface DeliveryRoute {
  order_id: string;
  driver_id: string;
  stops: Array<{
    order_id: string;
    customer_address: string;
    customer_name: string;
    customer_phone: string;
    estimated_time: string;
    completed: boolean;
  }>;
  current_location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  estimated_completion: string;
}

class OrderTrackingService {
  // Create tracking event
  async createTrackingEvent(eventData: Omit<OrderTrackingEvent, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('order_tracking_events')
        .insert([eventData])
        .select()
        .single();

      if (error) throw error;

      // Update order status
      await this.updateOrderStatus(eventData.order_id, eventData.status);

      // Send notification to customer
      await this.sendStatusNotification(eventData.order_id, eventData.status, eventData.description);

      return data;
    } catch (error: any) {
      console.error('Error creating tracking event:', error);
      throw new Error(`Failed to create tracking event: ${error.message || 'Unknown error'}`);
    }
  }

  // Get order tracking events
  async getOrderTrackingEvents(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_tracking_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching tracking events:', error);
      throw new Error(`Failed to fetch tracking events: ${error.message || 'Unknown error'}`);
    }
  }

  // Update order status
  async updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Get order details for notification
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, order_number')
        .eq('id', orderId)
        .single();

      if (order) {
        await notificationService.createOrderNotification(
          order.user_id,
          orderId,
          status,
          order.order_number
        );
      }
      
      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      throw new Error(`Failed to update order status: ${error.message || 'Unknown error'}`);
    }
  }

  // Assign driver to order
  async assignDriver(orderId: string, driverId: string, driverInfo: any) {
    try {
      // Update order with driver info
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          driver_id: driverId,
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (orderError) throw orderError;

      // Create tracking event
      await this.createTrackingEvent({
        order_id: orderId,
        status: 'confirmed',
        description: `Order assigned to driver ${driverInfo.name}`,
        driver_info: driverInfo,
        estimated_delivery: this.calculateEstimatedDelivery()
      });

      return true;
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      throw new Error(`Failed to assign driver: ${error.message || 'Unknown error'}`);
    }
  }

  // Update driver location (GPS tracking)
  async updateDriverLocation(driverId: string, location: { latitude: number; longitude: number; address: string }) {
    try {
      const { error } = await supabase
        .from('driver_locations')
        .upsert([{
          driver_id: driverId,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          timestamp: new Date().toISOString()
        }], {
          onConflict: 'driver_id'
        });

      if (error) throw error;

      // Update all active orders for this driver
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('id, status')
        .eq('driver_id', driverId)
        .in('status', ['out_for_delivery', 'confirmed']);

      for (const order of activeOrders || []) {
        await this.createTrackingEvent({
          order_id: order.id,
          status: order.status as any,
          description: `Driver location updated`,
          location: {
            ...location,
            timestamp: new Date().toISOString()
          }
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error updating driver location:', error);
      throw new Error(`Failed to update driver location: ${error.message || 'Unknown error'}`);
    }
  }

  // Get driver location
  async getDriverLocation(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('driver_locations')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting driver location:', error);
      throw new Error(`Failed to get driver location: ${error.message || 'Unknown error'}`);
    }
  }

  // Get real-time order tracking
  async getRealTimeOrderTracking(orderId: string) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          driver:profiles (
            id,
            full_name,
            phone,
            avatar
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const trackingEvents = await this.getOrderTrackingEvents(orderId);
      const driverLocation = order.driver_id ? await this.getDriverLocation(order.driver_id) : null;

      return {
        order,
        trackingEvents,
        driverLocation,
        currentStatus: order.status,
        estimatedDelivery: this.calculateEstimatedDelivery(order.created_at)
      };
    } catch (error: any) {
      console.error('Error getting real-time tracking:', error);
      throw new Error(`Failed to get real-time tracking: ${error.message || 'Unknown error'}`);
    }
  }

  // Set up real-time tracking subscription
  setupTrackingSubscription(orderId: string, onUpdate: (tracking: any) => void) {
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_tracking_events',
          filter: `order_id=eq.${orderId}`,
        },
        async (payload) => {
          try {
            // Refetch tracking data
            const tracking = await this.getRealTimeOrderTracking(orderId);
            onUpdate(tracking);
          } catch (error) {
            console.error('Error in tracking subscription:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        async (payload) => {
          try {
            // Refetch tracking data
            const tracking = await this.getRealTimeOrderTracking(orderId);
            onUpdate(tracking);
          } catch (error) {
            console.error('Error in order update subscription:', error);
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Successfully subscribed to order tracking for order ${orderId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to order tracking for order ${orderId}:`, err);
        } else if (status === 'CLOSED') {
          console.log(`Closed subscription to order tracking for order ${orderId}`);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Calculate estimated delivery time
  private calculateEstimatedDelivery(orderCreatedAt?: string): string {
    const now = new Date();
    const orderTime = orderCreatedAt ? new Date(orderCreatedAt) : now;
    
    // Add 30-45 minutes for preparation and delivery
    const estimatedTime = new Date(orderTime.getTime() + (45 * 60 * 1000));
    
    return estimatedTime.toISOString();
  }

  // Send status notification
  private async sendStatusNotification(orderId: string, status: string, description: string) {
    try {
      const { data: order } = await supabase
        .from('orders')
        .select('user_id, order_number')
        .eq('id', orderId)
        .single();

      if (order) {
        await notificationService.createOrderNotification(
          order.user_id,
          orderId,
          status,
          order.order_number
        );
      }
    } catch (error) {
      console.error('Error sending status notification:', error);
    }
  }

  // Create delivery route
  async createDeliveryRoute(driverId: string, orderIds: string[]) {
    try {
      // Get order details for route planning
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          delivery_address,
          status,
          created_at
        `)
        .in('id', orderIds)
        .eq('driver_id', driverId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const route: DeliveryRoute = {
        order_id: orderIds[0], // Primary order
        driver_id: driverId,
        stops: orders?.map(order => ({
          order_id: order.id,
          customer_address: order.delivery_address,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          estimated_time: this.calculateEstimatedDelivery(order.created_at),
          completed: order.status === 'delivered'
        })) || [],
        estimated_completion: this.calculateEstimatedDelivery()
      };

      // Save route to database
      const { error: routeError } = await supabase
        .from('delivery_routes')
        .upsert([{
          driver_id: driverId,
          route_data: route,
          created_at: new Date().toISOString()
        }], {
          onConflict: 'driver_id'
        });

      if (routeError) throw routeError;

      return route;
    } catch (error: any) {
      console.error('Error creating delivery route:', error);
      throw new Error(`Failed to create delivery route: ${error.message || 'Unknown error'}`);
    }
  }

  // Get delivery route
  async getDeliveryRoute(driverId: string) {
    try {
      const { data, error } = await supabase
        .from('delivery_routes')
        .select('*')
        .eq('driver_id', driverId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.route_data as DeliveryRoute;
    } catch (error: any) {
      console.error('Error getting delivery route:', error);
      throw new Error(`Failed to get delivery route: ${error.message || 'Unknown error'}`);
    }
  }

  // Mark delivery stop as completed
  async completeDeliveryStop(driverId: string, orderId: string) {
    try {
      const route = await this.getDeliveryRoute(driverId);
      if (!route) throw new Error('Route not found');

      // Update route
      route.stops = route.stops.map(stop => 
        stop.order_id === orderId 
          ? { ...stop, completed: true }
          : stop
      );

      // Update route in database
      await supabase
        .from('delivery_routes')
        .update({ route_data: route })
        .eq('driver_id', driverId);

      // Update order status
      await this.createTrackingEvent({
        order_id: orderId,
        status: 'delivered',
        description: 'Order delivered successfully'
      });

      return true;
    } catch (error: any) {
      console.error('Error completing delivery stop:', error);
      throw new Error(`Failed to complete delivery stop: ${error.message || 'Unknown error'}`);
    }
  }

  // Get delivery analytics
  async getDeliveryAnalytics(dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          created_at,
          delivered_at,
          total,
          delivery_address,
          driver:profiles (full_name)
        `)
        .eq('status', 'delivered');

      if (dateRange) {
        query = query.gte('created_at', dateRange.start).lte('created_at', dateRange.end);
      }

      const { data: orders, error } = await query;
      if (error) throw error;

      const analytics = {
        totalDeliveries: orders?.length || 0,
        averageDeliveryTime: 0,
        totalRevenue: orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
        topDeliveryAreas: {} as Record<string, number>,
        driverPerformance: {} as Record<string, { deliveries: number; revenue: number }>
      };

      let totalDeliveryTime = 0;

      for (const order of orders || []) {
        // Calculate delivery time
        if (order.delivered_at) {
          const deliveryTime = new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime();
          totalDeliveryTime += deliveryTime;
        }

        // Count delivery areas
        const area = order.delivery_address?.split(',')[0] || 'Unknown';
        analytics.topDeliveryAreas[area] = (analytics.topDeliveryAreas[area] || 0) + 1;

        // Driver performance
        const driverName = (order as any).driver?.full_name || 'Unassigned';
        if (!analytics.driverPerformance[driverName]) {
          analytics.driverPerformance[driverName] = { deliveries: 0, revenue: 0 };
        }
        analytics.driverPerformance[driverName].deliveries++;
        analytics.driverPerformance[driverName].revenue += order.total || 0;
      }

      analytics.averageDeliveryTime = analytics.totalDeliveries > 0 
        ? totalDeliveryTime / analytics.totalDeliveries 
        : 0;

      return analytics;
    } catch (error: any) {
      console.error('Error getting delivery analytics:', error);
      throw new Error(`Failed to get delivery analytics: ${error.message || 'Unknown error'}`);
    }
  }
}

export const orderTrackingService = new OrderTrackingService();
