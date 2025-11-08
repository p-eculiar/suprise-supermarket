import { productService } from '../services/productService';

/**
 * Clear all caches when navigating between different sections of the application
 * This ensures fresh data is loaded when users move between dashboards and frontpages
 */
export const clearAllCaches = () => {
  // Clear product service cache
  productService.clearCache();
  
  // Add other cache clearing logic here if needed
  console.log('All caches cleared for navigation');
};

/**
 * Clear caches specifically when navigating from admin/dashboard to frontpages
 */
export const clearCachesForFrontpage = () => {
  // Clear product service cache to ensure fresh product data
  productService.clearCache();
  
  console.log('Caches cleared for frontpage navigation');
};

/**
 * Clear caches specifically when navigating to admin/dashboard areas
 */
export const clearCachesForDashboard = () => {
  // Clear product service cache to ensure fresh data for admin
  productService.clearCache();
  
  console.log('Caches cleared for dashboard navigation');
};