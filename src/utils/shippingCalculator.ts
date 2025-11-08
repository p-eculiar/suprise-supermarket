// Supermarket location: 6 Farm Road, Off Ada George, Port Harcourt, Rivers State, Nigeria
const SUPERMARKET_LOCATION = {
  latitude: 4.8489,   // Approximate coordinates for Port Harcourt
  longitude: 7.0364   // Approximate coordinates for Port Harcourt
};

// Port Harcourt boundaries (approximate)
const PORT_HARCOURT_BOUNDS = {
  minLat: 4.7000,
  maxLat: 4.9000,
  minLng: 6.9000,
  maxLng: 7.2000
};

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in kilometers
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
 * Calculate shipping fee based on distance and order subtotal
 * @param customerLat Customer's latitude
 * @param customerLng Customer's longitude
 * @param subtotal Order subtotal
 * @returns Shipping fee in NGN
 */
export function calculateShippingFee(
  customerLat: number, 
  customerLng: number, 
  subtotal: number,
  freeShippingThreshold: number = 50000
): number {
  // Check if customer is within Port Harcourt
  if (customerLat < PORT_HARCOURT_BOUNDS.minLat || 
      customerLat > PORT_HARCOURT_BOUNDS.maxLat ||
      customerLng < PORT_HARCOURT_BOUNDS.minLng || 
      customerLng > PORT_HARCOURT_BOUNDS.maxLng) {
    // Outside Port Harcourt - delivery not available
    throw new Error("Sorry, we only deliver within Port Harcourt, Rivers State.");
  }
  
  // Check if order qualifies for free shipping
  if (subtotal >= freeShippingThreshold) {
    return 0;
  }
  
  // Calculate distance from supermarket
  const distance = calculateDistance(
    SUPERMARKET_LOCATION.latitude,
    SUPERMARKET_LOCATION.longitude,
    customerLat,
    customerLng
  );
  
  // Base shipping fee
  let shippingFee = 500; // ₦500 base fee
  
  // Add distance-based fee
  if (distance > 5) {
    // ₦100 per additional kilometer beyond 5km
    shippingFee += Math.ceil(distance - 5) * 100;
  }
  
  // Cap maximum shipping fee at ₦2000
  return Math.min(shippingFee, 2000);
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
 * Get approximate coordinates for Port Harcourt areas
 * @param area Area name in Port Harcourt
 * @returns Approximate coordinates
 */
export function getCoordinatesForArea(area: string): { latitude: number, longitude: number } {
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
  return areaCoordinates[normalizedArea] || 
         areaCoordinates['port harcourt'] || 
         { latitude: 4.8489, longitude: 7.0364 }; // Default to Port Harcourt center
}