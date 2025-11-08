# External API Integration for Nigeria Analytics Dashboard

This document explains how to integrate the Nigeria Analytics dashboard with real external APIs to provide accurate, up-to-date data.

## Current Implementation

The current implementation uses a three-tier approach:

1. **Database First**: Tries to fetch data from Supabase database tables
2. **External APIs**: Falls back to external API integration if database is unavailable
3. **Mock Data**: Uses realistic mock data if both above methods fail

## Recommended External APIs

### 1. World Bank API
Provides economic indicators for Nigeria and its states.

**Endpoint**: `https://api.worldbank.org/v2/country/NGA/indicator/[INDICATOR]`

**Useful Indicators**:
- NY.GDP.MKTP.CD - GDP (current US$)
- FP.CPI.TOTL.ZG - Inflation, consumer prices (annual %)
- SL.UEM.TOTL.ZS - Unemployment, total (% of total labor force)

**Example Request**:
```
GET https://api.worldbank.org/v2/country/NGA/indicator/NY.GDP.MKTP.CD?format=json&date=2020:2023
```

### 2. Commodity Price APIs
Several APIs provide commodity prices that are relevant to a supermarket:

**Open Food Prices API**:
- Endpoint: https://openfoodprices.org/api/
- Provides food prices from various countries

**Agrimarket API**:
- Endpoint: https://agrimarket-ng.com/api/
- Provides Nigerian agricultural commodity prices

### 3. Nigerian Government APIs
**Nigeria Bureau of Statistics**:
- Endpoint: https://nigerianstat.gov.ng/
- Provides official economic statistics

**Nigeria Open Data**:
- Endpoint: https://data.gov.ng/
- Various datasets including economic indicators

## Implementation Guide

### 1. Setting up World Bank API Integration

```typescript
// In externalApiService.ts
async fetchNigeriaGDPData() {
  const indicator = 'NY.GDP.MKTP.CD';
  const url = `https://api.worldbank.org/v2/country/NGA/indicator/${indicator}?format=json&date=2020:2023`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data[1]; // World Bank API returns metadata in [0] and data in [1]
  } catch (error) {
    console.error('Error fetching GDP data:', error);
    throw error;
  }
}
```

### 2. Setting up Commodity Price API Integration

```typescript
// In externalApiService.ts
async fetchCommodityPrices() {
  // Example with a hypothetical commodity API
  const url = 'https://api.commodity-prices.com/nigeria';
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${process.env.COMMODITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.prices;
  } catch (error) {
    console.error('Error fetching commodity prices:', error);
    throw error;
  }
}
```

### 3. Setting up Nigerian Government API Integration

```typescript
// In externalApiService.ts
async fetchNBSData() {
  const url = 'https://nigerianstat.gov.ng/api/economic-indicators';
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching NBS data:', error);
    throw error;
  }
}
```

## Data Transformation

The external API service transforms data from various sources into the format required by the analytics dashboard:

```typescript
// Transform external data to analytics format
transformExternalDataToAnalyticsFormat(externalData: any) {
  return {
    states: externalData.economicData.map((state: any) => ({
      id: `state-${state.id}`,
      state: state.name,
      top_product: this.getTopProductForState(state.commodities),
      total_purchases: this.calculatePurchases(state.gdp, state.population),
      average_price: this.calculateAveragePrice(state.commodities),
      trend: this.calculateTrend(state.inflation),
      market_share: this.calculateMarketShare(state.gdp),
      supermarkets_count: this.estimateSupermarkets(state.population),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })),
    
    recommendations: externalData.commodities.map((commodity: any, index: number) => ({
      id: `product-${index}`,
      product_name: commodity.name,
      average_price: commodity.averagePrice,
      total_sales: commodity.totalSales,
      top_states: commodity.popularStates,
      growth_rate: commodity.growthRate,
      profit_margin: commodity.profitMargin,
      created_at: new Date().toISOString()
    }))
  };
}
```

## Environment Variables

Add these to your `.env` file:

```env
# World Bank API (no key required)
WORLD_BANK_API_URL=https://api.worldbank.org/v2

# Commodity Price API (example - replace with actual)
COMMODITY_API_KEY=your_commodity_api_key_here
COMMODITY_API_URL=https://api.commodity-prices.com

# Nigerian Bureau of Statistics API (if available)
NBS_API_KEY=your_nbs_api_key_here
NBS_API_URL=https://nigerianstat.gov.ng/api
```

## Error Handling

The service includes robust error handling:

```typescript
async fetchAndTransformExternalData() {
  try {
    // Fetch data from multiple external sources
    const [gdpData, commodityPrices, populationData] = await Promise.allSettled([
      this.fetchNigeriaGDPData(),
      this.fetchCommodityPrices(),
      this.fetchPopulationData()
    ]);
    
    // Handle partial failures
    if (gdpData.status === 'rejected') {
      console.warn('Failed to fetch GDP data:', gdpData.reason);
    }
    
    if (commodityPrices.status === 'rejected') {
      console.warn('Failed to fetch commodity prices:', commodityPrices.reason);
    }
    
    // Continue with available data
    const combinedData = this.combineAvailableData(
      gdpData.status === 'fulfilled' ? gdpData.value : null,
      commodityPrices.status === 'fulfilled' ? commodityPrices.value : null,
      populationData.status === 'fulfilled' ? populationData.value : null
    );
    
    return this.transformExternalDataToAnalyticsFormat(combinedData);
  } catch (error) {
    console.error('Error in fetchAndTransformExternalData:', error);
    throw error;
  }
}
```

## Testing

To test the external API integration:

1. **Unit Tests**:
```typescript
// __tests__/externalApiService.test.ts
describe('ExternalApiService', () => {
  it('should fetch and transform GDP data', async () => {
    const data = await externalApiService.fetchNigeriaGDPData();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });
  
  it('should transform data correctly', () => {
    const mockData = { /* mock external data */ };
    const transformed = externalApiService.transformExternalDataToAnalyticsFormat(mockData);
    expect(transformed.states).toBeDefined();
    expect(transformed.recommendations).toBeDefined();
  });
});
```

2. **Integration Tests**:
```typescript
// __tests__/analyticsService.test.ts
describe('AnalyticsService', () => {
  it('should fall back to external APIs when database is unavailable', async () => {
    // Mock database failure
    jest.spyOn(analyticsService, 'fetchFromDatabase').mockRejectedValue(new Error('Database unavailable'));
    
    // Mock external API success
    jest.spyOn(externalApiService, 'fetchAndTransformExternalData').mockResolvedValue({
      states: [], 
      recommendations: []
    });
    
    const result = await analyticsService.fetchAnalyticsData();
    expect(result.source).toBe('api');
  });
});
```

## Monitoring and Logging

The service includes logging for monitoring:

```typescript
// Log API calls
console.log(`Fetching data from ${apiName} at ${new Date().toISOString()}`);
console.log(`Successfully fetched ${dataLength} records from ${apiName}`);

// Log errors
console.error(`Failed to fetch from ${apiName}:`, error.message);
```

## Performance Considerations

1. **Caching**: Cache API responses to reduce calls
2. **Rate Limiting**: Respect API rate limits
3. **Batching**: Combine multiple API calls when possible
4. **Fallbacks**: Always have fallback data sources

## Future Enhancements

1. **Real-time Data**: Implement WebSocket connections for real-time updates
2. **Machine Learning**: Use ML to predict trends and make better recommendations
3. **Multiple Data Sources**: Integrate with more diverse data sources
4. **Data Visualization**: Enhance the dashboard with more advanced charts

## Troubleshooting

### Common Issues

1. **API Rate Limiting**: 
   - Solution: Implement exponential backoff
   - Solution: Add caching layer

2. **API Downtime**:
   - Solution: Always have fallback to mock data
   - Solution: Cache recent successful responses

3. **Data Format Changes**:
   - Solution: Implement versioning
   - Solution: Add data validation

### Debugging Steps

1. Check API response formats
2. Verify environment variables
3. Test API endpoints independently
4. Check network connectivity
5. Review error logs

## Conclusion

This external API integration provides a robust, scalable solution for the Nigeria Analytics dashboard. By following the implementation guide and using the recommended APIs, you can provide accurate, real-time data to your users while maintaining reliability through fallback mechanisms.