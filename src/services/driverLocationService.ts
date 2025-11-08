import { supabase } from '../lib/supabase';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  address: string;
  timestamp: string;
  accuracy?: number;
}

export class DriverLocationService {
  /**
   * Update driver location in real-time
   */
  static async updateDriverLocation(
    orderId: string,
    location: DriverLocation
  ): Promise<boolean> {
    try {
      // Get existing tracking data
      const { data: tracking, error: fetchError } = await supabase
        .from('delivery_tracking')
        .select('tracking_history, current_location')
        .eq('order_id', orderId)
        .single();

      if (fetchError) throw fetchError;
      if (!tracking) throw new Error('Delivery tracking not found');

      // Update tracking history
      const updatedHistory = tracking.tracking_history || [];
      updatedHistory.push(location);

      // Update current location
      const { error: updateError } = await supabase
        .from('delivery_tracking')
        .update({
          current_location: location,
          tracking_history: updatedHistory,
          last_location_update: new Date().toISOString(),
          location_accuracy: location.accuracy || null,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error updating driver location:', error);
      return false;
    }
  }

  /**
   * Calculate estimated time of arrival based on current location and destination
   */
  static async calculateETA(
    orderId: string,
    currentLocation: DriverLocation,
    destination: { latitude: number; longitude: number }
  ): Promise<Date | null> {
    try {
      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        destination.latitude,
        destination.longitude
      );

      // Assume average delivery speed of 40 km/h
      const averageSpeedKmh = 40;
      const timeInHours = distance / averageSpeedKmh;
      const timeInMs = timeInHours * 60 * 60 * 1000;

      const eta = new Date(Date.now() + timeInMs);
      return eta;
    } catch (error) {
      console.error('Error calculating ETA:', error);
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
   * Update ETA in delivery tracking
   */
  static async updateETA(
    orderId: string,
    eta: Date
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          delivery_eta: eta.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating ETA:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time driver location updates
   */
  static subscribeToLocationUpdates(
    orderId: string,
    callback: (location: DriverLocation) => void
  ): () => void {
    const subscription = supabase
      .channel(`driver-location:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'delivery_tracking',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          if (payload.new.current_location) {
            callback(payload.new.current_location as DriverLocation);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}