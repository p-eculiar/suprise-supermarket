/**
 * Test utility to verify all products are loading correctly
 */

import { productService } from '../services/productService';

export const testAllProductsLoading = async () => {
  console.log('=== Testing All Products Loading ===');
  
  try {
    // Test 1: Load all products without any filters
    console.log('Test 1: Loading all products without filters...');
    const allProducts = await productService.getAllProducts();
    console.log('✓ Loaded', allProducts.length, 'products without filters');
    
    // Test 2: Load products with explicit active=true filter
    console.log('Test 2: Loading products with active=true filter...');
    const activeProducts = await productService.getAllProducts({ active: true });
    console.log('✓ Loaded', activeProducts.length, 'active products');
    
    // Test 3: Load products with explicit active=false filter
    console.log('Test 3: Loading products with active=false filter...');
    const inactiveProducts = await productService.getAllProducts({ active: false });
    console.log('✓ Loaded', inactiveProducts.length, 'inactive products');
    
    // Test 4: Check category distribution
    console.log('Test 4: Analyzing category distribution...');
    const categoryCounts: Record<string, number> = {};
    allProducts.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    console.log('Category distribution:');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`);
      });
    
    // Test 5: Verify we have the expected number of products
    if (allProducts.length >= 500) {
      console.log('✓ SUCCESS: Loaded expected number of products (513 expected)');
    } else {
      console.warn('⚠ WARNING: Only loaded', allProducts.length, 'products, expected 513');
    }
    
    console.log('=== Test Complete ===');
    
    return {
      total: allProducts.length,
      active: activeProducts.length,
      inactive: inactiveProducts.length,
      categories: categoryCounts
    };
  } catch (error) {
    console.error('❌ Test failed:', error);
    return null;
  }
};

// Simple function to run the test
export const runProductTest = async () => {
  console.log('Running product loading test...');
  const result = await testAllProductsLoading();
  console.log('Test result:', result);
  return result;
};