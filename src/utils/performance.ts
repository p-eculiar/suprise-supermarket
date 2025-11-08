// Performance optimization utilities

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Throttle function to limit execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Enhanced lazy image loading with intersection observer
export function lazyLoadImages() {
  // Check if IntersectionObserver is supported
  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src]').forEach(img => {
      const image = img as HTMLImageElement;
      const src = image.dataset.src;
      if (src) {
        image.src = src;
        image.classList.remove('lazy');
      }
    });
    return;
  }

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          // Preload image before setting src
          const preloadImg = new Image();
          preloadImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
          };
          preloadImg.src = src;
        }
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '100px 0px', // Start loading 100px before entering viewport for better performance
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// Preload critical images
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Enhanced image optimization
export function optimizeImages() {
  // Add loading="lazy" to all images except the first ones that are critical
  const images = document.querySelectorAll('img');
  let criticalCount = 0;
  
  images.forEach(img => {
    // First 8 images are considered critical (increased from 5 for better UX)
    if (criticalCount < 8) {
      criticalCount++;
      return;
    }
    
    // Add lazy loading to non-critical images
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    
    // Add decoding hint for better performance
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
  
  // Add performance hints to all images
  images.forEach(img => {
    // Add fetch priority for critical images
    if (!img.hasAttribute('fetchpriority') && criticalCount > 0) {
      img.setAttribute('fetchpriority', 'high');
      criticalCount--;
    }
    
    // Add decoding hint
    if (!img.hasAttribute('decoding')) {
      img.setAttribute('decoding', 'async');
    }
  });
}

// Memory cleanup utility
export function cleanupMemory() {
  // Force garbage collection if available (in development)
  if (process.env.NODE_ENV === 'development' && (window as any).gc) {
    (window as any).gc();
  }
  
  // Clear any timeouts or intervals
  if ((window as any)._performanceTimers) {
    (window as any)._performanceTimers.forEach((timer: number) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    (window as any)._performanceTimers = [];
  }
}

// Performance monitoring
export function measurePerformance(metricName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`[Performance] ${metricName} took ${end - start} milliseconds`);
}

// Enhanced cache optimization
export function setupCacheOptimization() {
  // Clear old caches periodically
  const cacheCleanup = setInterval(() => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          // Keep only recent caches (within 12 hours for better performance)
          const cacheTime = name.split('-').pop();
          if (cacheTime) {
            const cacheDate = new Date(cacheTime).getTime();
            const now = Date.now();
            if (now - cacheDate > 12 * 60 * 60 * 1000) { // 12 hours
              caches.delete(name);
            }
          }
        });
      });
    }
  }, 10 * 60 * 1000); // Every 10 minutes (increased from 15)
  
  // Store timer reference for cleanup
  if (!(window as any)._performanceTimers) {
    (window as any)._performanceTimers = [];
  }
  (window as any)._performanceTimers.push(cacheCleanup);
  
  // Also run cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(cacheCleanup);
  });
}

// Resource preloading
export function preloadCriticalResources() {
  // Preload critical CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/static/css/main.chunk.css';
  document.head.appendChild(criticalCSS);
  
  // Preload critical fonts
  const fontLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontLinks.forEach(link => {
    const newLink = document.createElement('link');
    newLink.rel = 'preload';
    newLink.as = 'font';
    newLink.type = link.getAttribute('type') || 'font/woff2';
    newLink.href = link.getAttribute('href') || '';
    newLink.crossOrigin = 'anonymous';
    document.head.appendChild(newLink);
  });
}

// Connection speed detection
export function getConnectionSpeed(): 'slow' | 'fast' | 'unknown' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType) {
        if (effectiveType.includes('slow') || effectiveType.includes('2g')) {
          return 'slow';
        }
        return 'fast';
      }
      
      const downlink = connection.downlink;
      if (downlink !== undefined) {
        return downlink < 1 ? 'slow' : 'fast';
      }
    }
  }
  
  return 'unknown';
}

// Adaptive loading based on connection speed
export function adaptiveLoading() {
  const speed = getConnectionSpeed();
  
  if (speed === 'slow') {
    // Reduce image quality for slow connections
    document.documentElement.classList.add('slow-connection');
    
    // Disable non-critical animations
    document.documentElement.classList.add('reduce-motion');
    
    // Load lower quality images
    const images = document.querySelectorAll('img[data-src-low]');
    images.forEach(img => {
      const lowSrc = img.getAttribute('data-src-low');
      if (lowSrc) {
        img.setAttribute('data-src', lowSrc);
      }
    });
  } else {
    document.documentElement.classList.remove('slow-connection');
    document.documentElement.classList.remove('reduce-motion');
  }
}

// Prefetch important routes for faster navigation
export function prefetchRoutes() {
  // Prefetch commonly visited pages
  const importantRoutes = ['/', '/products', '/about', '/contact', '/blog'];
  
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    // Only prefetch on fast connections
    if (connection && connection.effectiveType && !connection.effectiveType.includes('slow')) {
      importantRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }
  }
}

// Initialize performance optimizations
export function initPerformanceOptimizations() {
  // Setup cache optimization
  setupCacheOptimization();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Detect and adapt to connection speed
  adaptiveLoading();
  
  // Prefetch important routes
  prefetchRoutes();
  
  // Setup memory cleanup on page hide
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      cleanupMemory();
    }
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanupMemory);
  
  // Add performance monitoring for key metrics
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          console.log('[Performance Metrics]', {
            'Page Load Time': perfData.loadEventEnd - perfData.loadEventStart,
            'DNS Lookup Time': perfData.domainLookupEnd - perfData.domainLookupStart,
            'TCP Connection Time': perfData.connectEnd - perfData.connectStart,
            'Request Time': perfData.responseEnd - perfData.requestStart,
            'Response Time': perfData.responseStart - perfData.requestStart,
          });
        }
      }, 0);
    });
  }
}