import axios from 'axios';

// Supermarket location: 6 Farm Road, Off Ada George, Port Harcourt, Rivers State, Nigeria
const SUPERMARKET_LOCATION = {
  latitude: 4.8489,
  longitude: 7.0364
};

// Port Harcourt boundaries (approximate)
const PORT_HARCOURT_BOUNDS = {
  minLat: 4.7000,
  maxLat: 4.9000,
  minLng: 6.9000,
  maxLng: 7.2000
};

/**
 * Geocode an address to coordinates using Nominatim (OpenStreetMap)
 * @param address The address to geocode
 * @returns Promise with latitude and longitude
 */
async function geocodeAddress(address: string): Promise<{ latitude: number, longitude: number }> {
  try {
    console.log('Geocoding address:', address);
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'SupriseSupermarket/1.0 (contact@suprisesupermarket.com)'
      }
    });

    console.log('Geocoding response:', response.data);

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      const coordinates = {
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon)
      };
      console.log('Geocoded coordinates:', coordinates);
      return coordinates;
    } else {
      throw new Error('Address not found');
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to area-based coordinates
    return getCoordinatesForArea(address);
  }
}

/**
 * Calculate road distance using OSRM (Open Source Routing Machine)
 * @param startLat Starting latitude
 * @param startLng Starting longitude
 * @param endLat Ending latitude
 * @param endLng Ending longitude
 * @returns Promise with distance in kilometers
 */
async function calculateRoadDistance(
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number
): Promise<number> {
  try {
    console.log('Calculating road distance from:', startLat, startLng, 'to:', endLat, endLng);
    // Using OSRM public instance
    const response = await axios.get(
      `http://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`
    );
    
    console.log('OSRM response:', response.data);
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      // Distance is in meters, convert to kilometers
      const distance = response.data.routes[0].distance / 1000;
      console.log('OSRM distance:', distance, 'km');
      return distance;
    } else {
      console.log('OSRM failed, using straight-line distance');
      // Fallback to straight-line distance if OSRM fails
      return calculateStraightLineDistance(startLat, startLng, endLat, endLng);
    }
  } catch (error) {
    console.error('OSRM routing error:', error);
    console.log('OSRM failed, using straight-line distance');
    // Fallback to straight-line distance if OSRM fails
    return calculateStraightLineDistance(startLat, startLng, endLat, endLng);
  }
}

/**
 * Calculate straight-line distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateStraightLineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Get approximate coordinates for Port Harcourt areas
 * @param area Area name in Port Harcourt
 * @returns Approximate coordinates
 */
function getCoordinatesForArea(area: string): { latitude: number, longitude: number } {
  // Simplified mapping of common Port Harcourt areas
  const areaCoordinates: { [key: string]: { latitude: number, longitude: number } } = {
    'ada george': { latitude: 4.8489, longitude: 7.0364 },
    'trans amadi': { latitude: 4.8500, longitude: 7.0500 },
    'elekahia': { latitude: 4.8300, longitude: 7.0700 },
    'diobu': { latitude: 4.8200, longitude: 7.0200 },
    'rumuokoro': { latitude: 4.8600, longitude: 7.0400 },
    'port harcourt': { latitude: 4.8489, longitude: 7.0364 },
    'rivers state': { latitude: 4.8489, longitude: 7.0364 },
    'ph': { latitude: 4.8489, longitude: 7.0364 }
  };
  
  const normalizedArea = area.toLowerCase().trim();
  
  // Check if any area key is contained in the address
  // Prioritize more specific areas first
  const priorityAreas = ['elekahia', 'trans amadi', 'diobu', 'rumuokoro', 'ada george', 'port harcourt', 'ph', 'rivers state'];
  
  for (const key of priorityAreas) {
    if (normalizedArea.includes(key)) {
      const coordinates = areaCoordinates[key];
      console.log(`Matched area '${key}' in address '${area}'`);
      return coordinates;
    }
  }
  
  console.log(`No area match found for '${area}', using Port Harcourt center`);
  // Fallback to Port Harcourt center
  return areaCoordinates['port harcourt'] || { latitude: 4.8489, longitude: 7.0364 };
}

/**
 * Validate if delivery is available to a location
 * @param customerLat Customer's latitude
 * @param customerLng Customer's longitude
 * @returns boolean indicating if delivery is available
 */
export function isDeliveryAvailable(customerLat: number, customerLng: number): boolean {
  // Check if customer is within Port Harcourt
  return !(customerLat < PORT_HARCOURT_BOUNDS.minLat || 
           customerLat > PORT_HARCOURT_BOUNDS.maxLat ||
           customerLng < PORT_HARCOURT_BOUNDS.minLng || 
           customerLng > PORT_HARCOURT_BOUNDS.maxLng);
}

/**
 * Calculate accurate shipping fee based on road distance and order subtotal
 * @param deliveryAddress Customer's delivery address
 * @param subtotal Order subtotal
 * @param freeShippingThreshold Threshold for free shipping
 * @returns Promise with shipping fee
 */
export async function calculateAccurateShippingFee(
  deliveryAddress: string,
  subtotal: number,
  freeShippingThreshold: number = 50000
): Promise<number> {
  try {
    console.log('Calculating shipping for:', deliveryAddress);
    
    // 1. Geocode the delivery address to get coordinates
    const customerLocation = await geocodeAddress(deliveryAddress);
    
    console.log('Customer location:', customerLocation);
    console.log('Supermarket location:', SUPERMARKET_LOCATION);
    
    // 2. Validate delivery availability
    if (!isDeliveryAvailable(customerLocation.latitude, customerLocation.longitude)) {
      throw new Error("Sorry, we only deliver within Port Harcourt, Rivers State.");
    }
    
    // 3. Check if order qualifies for free shipping
    if (subtotal >= freeShippingThreshold) {
      return 0;
    }
    
    // 4. Calculate road distance from supermarket to customer
    console.log('Calculating distance between:', 
      SUPERMARKET_LOCATION, 'and', customerLocation);
    const distance = await calculateRoadDistance(
      SUPERMARKET_LOCATION.latitude,
      SUPERMARKET_LOCATION.longitude,
      customerLocation.latitude,
      customerLocation.longitude
    );
    
    console.log('Calculated distance:', distance, 'km');
    console.log('Start coords:', SUPERMARKET_LOCATION.latitude, SUPERMARKET_LOCATION.longitude);
    console.log('End coords:', customerLocation.latitude, customerLocation.longitude);
    
    // 5. Calculate shipping fee based on distance
    let shippingFee = 500; // ₦500 base fee
    
    // Add distance-based fee
    if (distance > 5) {
      // ₦100 per additional kilometer beyond 5km
      const additionalKm = Math.ceil(distance - 5);
      console.log('Additional km:', additionalKm);
      shippingFee += additionalKm * 100;
    }
    
    console.log('Calculated shipping fee:', shippingFee);
    
    // Cap maximum shipping fee at ₦2000
    const finalFee = Math.min(shippingFee, 2000);
    console.log('Final shipping fee:', finalFee);
    return finalFee;
  } catch (error) {
    console.error('Shipping calculation error:', error);
    throw error;
  }
}