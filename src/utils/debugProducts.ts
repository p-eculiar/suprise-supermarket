/**
 * Debug utility to check product loading issues
 */

import { productService } from '../services/productService';
import { supabase } from '../lib/supabase';

export const debugProductLoading = async () => {
  console.log('=== Product Loading Debug ===');
  
  try {
    // 1. Get total count of all products in database
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting total products:', countError);
    } else {
      console.log('Total products in database:', totalCount);
    }
    
    // 2. Get count of active products
    const { count: activeCount, error: activeCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);
    
    if (activeCountError) {
      console.error('Error counting active products:', activeCountError);
    } else {
      console.log('Active products in database:', activeCount);
    }
    
    // 3. Get count of inactive products
    const { count: inactiveCount, error: inactiveCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', false);
    
    if (inactiveCountError) {
      console.error('Error counting inactive products:', inactiveCountError);
    } else {
      console.log('Inactive products in database:', inactiveCount);
    }
    
    // 4. Get products with null active status
    const { count: nullActiveCount, error: nullActiveCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('active', null);
    
    if (nullActiveCountError) {
      console.error('Error counting null active products:', nullActiveCountError);
    } else {
      console.log('Null active products in database:', nullActiveCount);
    }
    
    // 5. Load all products through service
    console.log('Loading all products through service...');
    const allProducts = await productService.getAllProducts();
    console.log('Service returned', allProducts.length, 'products');
    
    // 6. Load active products through service
    console.log('Loading active products through service...');
    const activeProducts = await productService.getAllProducts({ active: true });
    console.log('Service returned', activeProducts.length, 'active products');
    
    // 7. Load all products without active filter
    console.log('Loading all products (including inactive) through service...');
    const allProductsIncludingInactive = await productService.getAllProducts({ active: false });
    console.log('Service returned', allProductsIncludingInactive.length, 'products (including inactive)');
    
    // 8. Show category distribution
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
      
    console.log('=== Debug Complete ===');
    
    return {
      total: totalCount || 0,
      active: activeCount || 0,
      inactive: inactiveCount || 0,
      nullActive: nullActiveCount || 0,
      serviceAll: allProducts.length,
      serviceActive: activeProducts.length,
      serviceAllIncludingInactive: allProductsIncludingInactive.length,
      categories: categoryCounts
    };
  } catch (error) {
    console.error('Debug error:', error);
    return null;
  }
};