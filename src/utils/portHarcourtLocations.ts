// Comprehensive list of Port Harcourt locations with coordinates and shipping information
export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
  baseDistance: number; // Distance from supermarket in km
  shippingFee: number;  // Pre-calculated shipping fee
  aliases: string[];    // Alternative names for matching
  area: string;         // General area for grouping
}

// Supermarket location: 6 Farm Road, Off Ada George, Port Harcourt
const SUPERMARKET_COORDS = {
  latitude: 4.8489,
  longitude: 7.0364
};

// Calculate straight-line distance between two points using Haversine formula
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

// Predefined locations in Port Harcourt with shipping fees
export const PORT_HARCOURT_LOCATIONS: LocationData[] = [
  // Ada George Area (Closest to supermarket)
  {
    name: "Ada George",
    latitude: 4.8489,
    longitude: 7.0364,
    baseDistance: 0,
    shippingFee: 500,
    aliases: ["ada george", "farm road", "6 farm road"],
    area: "Central"
  },
  {
    name: "Trans Amadi",
    latitude: 4.8500,
    longitude: 7.0500,
    baseDistance: 1.5,
    shippingFee: 500,
    aliases: ["trans amadi", "trans-amadi"],
    area: "Central"
  },
  {
    name: "Rumuokoro",
    latitude: 4.8600,
    longitude: 7.0400,
    baseDistance: 1.2,
    shippingFee: 500,
    aliases: ["rumuokoro"],
    area: "Central"
  },
  {
    name: "Rumueprikom",
    latitude: 4.8550,
    longitude: 7.0450,
    baseDistance: 1.0,
    shippingFee: 500,
    aliases: ["rumueprikom"],
    area: "Central"
  },
  {
    name: "Rumukabok",
    latitude: 4.8650,
    longitude: 7.0350,
    baseDistance: 1.8,
    shippingFee: 500,
    aliases: ["rumukabok"],
    area: "Central"
  },
  
  // Diobu Area
  {
    name: "Diobu",
    latitude: 4.8200,
    longitude: 7.0200,
    baseDistance: 3.5,
    shippingFee: 500,
    aliases: ["diobu"],
    area: "West"
  },
  {
    name: "Mile 1",
    latitude: 4.8150,
    longitude: 7.0150,
    baseDistance: 4.2,
    shippingFee: 500,
    aliases: ["mile 1", "mile one"],
    area: "West"
  },
  {
    name: "Mile 2",
    latitude: 4.8100,
    longitude: 7.0100,
    baseDistance: 5.0,
    shippingFee: 500,
    aliases: ["mile 2", "mile two"],
    area: "West"
  },
  {
    name: "Mile 3",
    latitude: 4.8050,
    longitude: 7.0050,
    baseDistance: 5.8,
    shippingFee: 600,
    aliases: ["mile 3", "mile three"],
    area: "West"
  },
  {
    name: "Mile 4",
    latitude: 4.8000,
    longitude: 7.0000,
    baseDistance: 6.5,
    shippingFee: 700,
    aliases: ["mile 4", "mile four"],
    area: "West"
  },
  {
    name: "Mile 5",
    latitude: 4.7950,
    longitude: 6.9950,
    baseDistance: 7.2,
    shippingFee: 800,
    aliases: ["mile 5", "mile five"],
    area: "West"
  },
  
  // Elekahia Area
  {
    name: "Elekahia",
    latitude: 4.8300,
    longitude: 7.0700,
    baseDistance: 3.8,
    shippingFee: 500,
    aliases: ["elekahia", "elekahia housing estate"],
    area: "East"
  },
  {
    name: "Rumuola",
    latitude: 4.8200,
    longitude: 7.0600,
    baseDistance: 4.5,
    shippingFee: 500,
    aliases: ["rumuola", "40 rumuola road"],
    area: "East"
  },
  {
    name: "Rumukurushi",
    latitude: 4.8100,
    longitude: 7.0500,
    baseDistance: 5.2,
    shippingFee: 600,
    aliases: ["rumukurushi"],
    area: "East"
  },
  {
    name: "Rumukurike",
    latitude: 4.8150,
    longitude: 7.0550,
    baseDistance: 4.8,
    shippingFee: 500,
    aliases: ["rumukurike"],
    area: "East"
  },
  {
    name: "Rumuokurusi",
    latitude: 4.8250,
    longitude: 7.0650,
    baseDistance: 4.2,
    shippingFee: 500,
    aliases: ["rumuokurusi"],
    area: "East"
  },
  {
    name: "Rumuokwu",
    latitude: 4.8350,
    longitude: 7.0750,
    baseDistance: 4.5,
    shippingFee: 500,
    aliases: ["rumuokwu"],
    area: "East"
  },
  
  // GRA Area
  {
    name: "GRA",
    latitude: 4.8400,
    longitude: 7.0200,
    baseDistance: 2.0,
    shippingFee: 500,
    aliases: ["gra", "government reserved area"],
    area: "Central"
  },
  {
    name: "Phase 1 GRA",
    latitude: 4.8350,
    longitude: 7.0150,
    baseDistance: 2.5,
    shippingFee: 500,
    aliases: ["phase 1 gra", "gra phase 1"],
    area: "Central"
  },
  {
    name: "Phase 2 GRA",
    latitude: 4.8450,
    longitude: 7.0250,
    baseDistance: 1.8,
    shippingFee: 500,
    aliases: ["phase 2 gra", "gra phase 2"],
    area: "Central"
  },
  {
    name: "Phase 3 GRA",
    latitude: 4.8550,
    longitude: 7.0350,
    baseDistance: 2.2,
    shippingFee: 500,
    aliases: ["phase 3 gra", "gra phase 3"],
    area: "Central"
  },
  
  // D-Line Area
  {
    name: "D-Line",
    latitude: 4.8600,
    longitude: 7.0200,
    baseDistance: 2.8,
    shippingFee: 500,
    aliases: ["d-line", "d line"],
    area: "Central"
  },
  {
    name: "D-Line Roundabout",
    latitude: 4.8650,
    longitude: 7.0250,
    baseDistance: 3.0,
    shippingFee: 500,
    aliases: ["d-line roundabout"],
    area: "Central"
  },
  
  // Old GRA Area
  {
    name: "Old GRA",
    latitude: 4.8500,
    longitude: 7.0100,
    baseDistance: 3.2,
    shippingFee: 500,
    aliases: ["old gra"],
    area: "Central"
  },
  {
    name: "Old GRA Junction",
    latitude: 4.8550,
    longitude: 7.0150,
    baseDistance: 3.5,
    shippingFee: 500,
    aliases: ["old gra junction"],
    area: "Central"
  },
  
  // Woji Area
  {
    name: "Woji",
    latitude: 4.8700,
    longitude: 7.0300,
    baseDistance: 2.5,
    shippingFee: 500,
    aliases: ["woji"],
    area: "Central"
  },
  {
    name: "Woji Market",
    latitude: 4.8750,
    longitude: 7.0350,
    baseDistance: 3.0,
    shippingFee: 500,
    aliases: ["woji market"],
    area: "Central"
  },
  {
    name: "Woji Roundabout",
    latitude: 4.8800,
    longitude: 7.0400,
    baseDistance: 3.5,
    shippingFee: 500,
    aliases: ["woji roundabout"],
    area: "Central"
  },
  
  // Eliozu Area
  {
    name: "Eliozu",
    latitude: 4.8800,
    longitude: 7.0400,
    baseDistance: 3.8,
    shippingFee: 500,
    aliases: ["eliozu"],
    area: "East"
  },
  {
    name: "Eliozu Market",
    latitude: 4.8850,
    longitude: 7.0450,
    baseDistance: 4.2,
    shippingFee: 500,
    aliases: ["eliozu market"],
    area: "East"
  },
  {
    name: "Eliozu Junction",
    latitude: 4.8900,
    longitude: 7.0500,
    baseDistance: 4.5,
    shippingFee: 500,
    aliases: ["eliozu junction"],
    area: "East"
  },
  
  // Eagle Island Area
  {
    name: "Eagle Island",
    latitude: 4.8900,
    longitude: 7.0500,
    baseDistance: 5.2,
    shippingFee: 600,
    aliases: ["eagle island"],
    area: "East"
  },
  {
    name: "Eagle Island Roundabout",
    latitude: 4.8950,
    longitude: 7.0550,
    baseDistance: 5.8,
    shippingFee: 600,
    aliases: ["eagle island roundabout"],
    area: "East"
  },
  
  // Okuru-Ali Area
  {
    name: "Okuru-Ali",
    latitude: 4.9000,
    longitude: 7.0600,
    baseDistance: 6.5,
    shippingFee: 700,
    aliases: ["okuru-ali", "okuru ali"],
    area: "East"
  },
  {
    name: "Okuru-Ali Market",
    latitude: 4.9050,
    longitude: 7.0650,
    baseDistance: 7.2,
    shippingFee: 800,
    aliases: ["okuru-ali market"],
    area: "East"
  },
  
  // Igbo Etche Area
  {
    name: "Igbo Etche",
    latitude: 4.9100,
    longitude: 7.0700,
    baseDistance: 7.8,
    shippingFee: 800,
    aliases: ["igbo etche"],
    area: "East"
  },
  {
    name: "Igbo Etche Roundabout",
    latitude: 4.9150,
    longitude: 7.0750,
    baseDistance: 8.5,
    shippingFee: 900,
    aliases: ["igbo etche roundabout"],
    area: "East"
  },
  
  // Rukpokwu Area
  {
    name: "Rukpokwu",
    latitude: 4.8000,
    longitude: 7.0300,
    baseDistance: 5.5,
    shippingFee: 600,
    aliases: ["rukpokwu"],
    area: "West"
  },
  {
    name: "Rukpokwu Market",
    latitude: 4.8050,
    longitude: 7.0350,
    baseDistance: 6.0,
    shippingFee: 600,
    aliases: ["rukpokwu market"],
    area: "West"
  },
  
  // Eleme Area
  {
    name: "Eleme",
    latitude: 4.7800,
    longitude: 7.0400,
    baseDistance: 8.2,
    shippingFee: 900,
    aliases: ["eleme"],
    area: "West"
  },
  {
    name: "Eleme Roundabout",
    latitude: 4.7850,
    longitude: 7.0450,
    baseDistance: 8.8,
    shippingFee: 900,
    aliases: ["eleme roundabout"],
    area: "West"
  },
  {
    name: "Eleme Market",
    latitude: 4.7900,
    longitude: 7.0500,
    baseDistance: 9.5,
    shippingFee: 1000,
    aliases: ["eleme market"],
    area: "West"
  },
  
  // Afam Area
  {
    name: "Afam",
    latitude: 4.7600,
    longitude: 7.0500,
    baseDistance: 10.5,
    shippingFee: 1100,
    aliases: ["afam"],
    area: "West"
  },
  {
    name: "Afam Roundabout",
    latitude: 4.7650,
    longitude: 7.0550,
    baseDistance: 11.2,
    shippingFee: 1200,
    aliases: ["afam roundabout"],
    area: "West"
  },
  
  // Onne Area
  {
    name: "Onne",
    latitude: 4.7400,
    longitude: 7.0600,
    baseDistance: 12.8,
    shippingFee: 1300,
    aliases: ["onne"],
    area: "West"
  },
  {
    name: "Onne Market",
    latitude: 4.7450,
    longitude: 7.0650,
    baseDistance: 13.5,
    shippingFee: 1400,
    aliases: ["onne market"],
    area: "West"
  },
  
  // Bonny Area
  {
    name: "Bonny",
    latitude: 4.7200,
    longitude: 7.0700,
    baseDistance: 15.1,
    shippingFee: 1500,
    aliases: ["bonny"],
    area: "West"
  },
  {
    name: "Bonny Roundabout",
    latitude: 4.7250,
    longitude: 7.0750,
    baseDistance: 15.8,
    shippingFee: 1600,
    aliases: ["bonny roundabout"],
    area: "West"
  },
  
  // Degema Area
  {
    name: "Degema",
    latitude: 4.7000,
    longitude: 7.0800,
    baseDistance: 17.4,
    shippingFee: 1700,
    aliases: ["degema"],
    area: "West"
  },
  {
    name: "Degema Market",
    latitude: 4.7050,
    longitude: 7.0850,
    baseDistance: 18.1,
    shippingFee: 1800,
    aliases: ["degema market"],
    area: "West"
  },
  
  // Ahoada Area
  {
    name: "Ahoada",
    latitude: 4.6800,
    longitude: 7.0900,
    baseDistance: 19.7,
    shippingFee: 2000,
    aliases: ["ahoada"],
    area: "West"
  },
  {
    name: "Ahoada Market",
    latitude: 4.6850,
    longitude: 7.0950,
    baseDistance: 20.4,
    shippingFee: 2000,
    aliases: ["ahoada market"],
    area: "West"
  },
  
  // Additional Locations
  {
    name: "Aba Road",
    latitude: 4.8300,
    longitude: 7.0100,
    baseDistance: 3.0,
    shippingFee: 500,
    aliases: ["aba road"],
    area: "Central"
  },
  {
    name: "Ogbunabali",
    latitude: 4.8250,
    longitude: 7.0150,
    baseDistance: 3.2,
    shippingFee: 500,
    aliases: ["ogbunabali"],
    area: "Central"
  },
  {
    name: "Choba",
    latitude: 4.8150,
    longitude: 7.0250,
    baseDistance: 3.8,
    shippingFee: 500,
    aliases: ["choba"],
    area: "West"
  },
  {
    name: "Rumueme",
    latitude: 4.8250,
    longitude: 7.0350,
    baseDistance: 2.8,
    shippingFee: 500,
    aliases: ["rumueme"],
    area: "Central"
  },
  {
    name: "Rumuebulu",
    latitude: 4.8350,
    longitude: 7.0450,
    baseDistance: 2.2,
    shippingFee: 500,
    aliases: ["rumuebulu"],
    area: "Central"
  },
  {
    name: "Rumuegbo",
    latitude: 4.8450,
    longitude: 7.0550,
    baseDistance: 2.5,
    shippingFee: 500,
    aliases: ["rumuegbo"],
    area: "Central"
  },
  {
    name: "Rumuokurike",
    latitude: 4.8550,
    longitude: 7.0650,
    baseDistance: 2.8,
    shippingFee: 500,
    aliases: ["rumuokurike"],
    area: "Central"
  },
  {
    name: "Rumuokurusi",
    latitude: 4.8650,
    longitude: 7.0750,
    baseDistance: 3.2,
    shippingFee: 500,
    aliases: ["rumuokurusi"],
    area: "East"
  }
];

// Generate additional locations dynamically for areas not explicitly defined
const generateAdditionalLocations = (): LocationData[] => {
  const additionalLocations: LocationData[] = [];
  
  // Generate locations for common area patterns
  const commonAreas = [
    "Rumueme", "Rumukalagbor", "Rumuokuruchi", "Rumunukpor", "Rumunwokpor",
    "Rumuchebe", "Rumukabok", "Rumukalaba", "Rumukwuta", "Rumukwurushi",
    "Rumuodara", "Rumuokwu", "Rumuola", "Rumuolumeni", "Rumuokoro",
    "Rumuebulu", "Rumuemegbu", "Rumuokurusi", "Rumuokurike", "Rumuokurukwo"
  ];
  
  // Assign approximate coordinates and fees based on area patterns
  commonAreas.forEach((area, index) => {
    const baseLat = 4.83 + (index % 5) * 0.01;
    const baseLng = 7.04 + (Math.floor(index / 5) % 3) * 0.01;
    const distance = calculateDistance(
      SUPERMARKET_COORDS.latitude,
      SUPERMARKET_COORDS.longitude,
      baseLat,
      baseLng
    );
    
    // Calculate shipping fee based on distance
    let fee = 500; // Base fee
    if (distance > 5) {
      fee += Math.ceil(distance - 5) * 100;
    }
    fee = Math.min(fee, 2000); // Cap at 2000
    
    additionalLocations.push({
      name: area,
      latitude: baseLat,
      longitude: baseLng,
      baseDistance: parseFloat(distance.toFixed(1)),
      shippingFee: fee,
      aliases: [area.toLowerCase()],
      area: "Generated"
    });
  });
  
  return additionalLocations;
};

// Combine predefined and generated locations
export const ALL_LOCATIONS: LocationData[] = [
  ...PORT_HARCOURT_LOCATIONS,
  ...generateAdditionalLocations()
];

// Find location by name or alias
export const findLocation = (input: string): LocationData | null => {
  if (!input) return null;
  
  const normalizedInput = input.toLowerCase().trim();
  
  // Exact match first
  for (const location of ALL_LOCATIONS) {
    if (location.name.toLowerCase() === normalizedInput) {
      return location;
    }
  }
  
  // Alias match
  for (const location of ALL_LOCATIONS) {
    for (const alias of location.aliases) {
      if (normalizedInput.includes(alias)) {
        return location;
      }
    }
  }
  
  return null;
};

// Validate if location is within delivery area
export const isDeliveryAvailable = (location: LocationData | null): boolean => {
  return location !== null;
};

// Get all unique areas for dropdown
export const getAreas = (): string[] => {
  const areas = new Set<string>();
  ALL_LOCATIONS.forEach(location => areas.add(location.area));
  return Array.from(areas).sort();
};

// Get locations by area
export const getLocationsByArea = (area: string): LocationData[] => {
  return ALL_LOCATIONS.filter(location => location.area === area);
};