// Home page specific performance optimizations

import { productService } from '../services/productService';
import { performanceMonitor } from './performanceMonitor';

// Optimized data loading for home page
export async function loadHomePageData() {
  const stopTiming = performanceMonitor.startTiming('loadHomePageData');
  
  try {
    console.log('🔄 Loading home page data in parallel...');
    
    // Load all product types in parallel for better performance
    const [
      featuredData,
      bestsellersData,
      popularData,
      dealsData
    ] = await Promise.all([
      productService.getFeaturedProducts(6),
      productService.getBestsellers(6),
      productService.getPopularProducts(6),
      productService.getDealsOfTheWeek(3)
    ]);
    
    console.log('✅ Home page data loaded:', {
      featured: featuredData.length,
      bestsellers: bestsellersData.length,
      popular: popularData.length,
      deals: dealsData.length
    });
    
    stopTiming();
    
    return {
      featuredProducts: featuredData,
      bestSellerProducts: bestsellersData,
      popularProducts: popularData,
      dealsProducts: dealsData
    };
  } catch (error) {
    console.error('❌ Error loading home page data:', error);
    stopTiming();
    
    // Return empty arrays on error to prevent app crash
    return {
      featuredProducts: [],
      bestSellerProducts: [],
      popularProducts: [],
      dealsProducts: []
    };
  }
}

// Optimized category loading
export async function loadHomeCategories() {
  const stopTiming = performanceMonitor.startTiming('loadHomeCategories');
  
  try {
    console.log('🔄 Loading home categories...');
    
    // Get categories with counts in a single optimized query
    const categoriesWithCounts = await productService.getProductCategories();
    
    console.log('✅ Home categories loaded:', categoriesWithCounts.length);
    stopTiming();
    
    return categoriesWithCounts;
  } catch (error) {
    console.error('❌ Error loading home categories:', error);
    stopTiming();
    
    return [];
  }
}

// Prefetch critical routes for faster navigation
export function prefetchCriticalRoutes() {
  // Only prefetch on fast connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.effectiveType && !connection.effectiveType.includes('slow')) {
      // Prefetch commonly visited pages
      const importantRoutes = ['/', '/products', '/about', '/contact', '/blog'];
      
      importantRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }
}

// Optimize images specifically for home page
export function optimizeHomeImages() {
  // Add loading="lazy" to non-critical images
  const images = document.querySelectorAll('.home-page img');
  let criticalCount = 0;
  
  images.forEach(img => {
    // First 10 images are considered critical for home page
    if (criticalCount < 10) {
      criticalCount++;
      return;
    }
    
    // Add lazy loading to non-critical images
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
}

// Initialize home page performance optimizations
export function initHomePageOptimizations() {
  // Prefetch critical routes
  prefetchCriticalRoutes();
  
  // Optimize images
  setTimeout(() => {
    optimizeHomeImages();
  }, 100);
}