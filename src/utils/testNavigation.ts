/**
 * Test utility to verify that navigation between dashboards and frontpages
 * properly loads products
 */

import { productService } from '../services/productService';

export const testNavigationFlow = async () => {
  console.log('🧪 Testing navigation flow...');
  
  // Clear all caches first
  productService.clearCache();
  console.log('🧹 Caches cleared');
  
  // Test loading products after cache clear
  try {
    console.log('📦 Loading products...');
    const products = await productService.getAllProducts();
    console.log(`✅ Loaded ${products.length} products`);
    
    // Test featured products
    console.log('⭐ Loading featured products...');
    const featured = await productService.getFeaturedProducts();
    console.log(`✅ Loaded ${featured.length} featured products`);
    
    // Test categories
    console.log('🏷️ Loading categories...');
    const categories = await productService.getCategories();
    console.log(`✅ Loaded ${categories.length} categories`);
    
    console.log('🎉 Navigation flow test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Navigation flow test failed:', error);
    return false;
  }
};

// Export a function to simulate navigation
export const simulateNavigation = (from: string, to: string) => {
  console.log(`🔄 Navigating from ${from} to ${to}`);
  
  // Clear caches on navigation
  productService.clearCache();
  console.log('🧹 Caches cleared for navigation');
  
  return true;
};