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

// Lazy image loading with intersection observer
export function lazyLoadImages() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.classList.remove('lazy');
        }
        observer.unobserve(img);
      }
    });
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

// Optimize image loading by adding loading="lazy" attribute
export function optimizeImages() {
  // Add loading="lazy" to all images except the first ones that are critical
  const images = document.querySelectorAll('img');
  let criticalCount = 0;
  
  images.forEach(img => {
    // First 3 images are considered critical
    if (criticalCount < 3) {
      criticalCount++;
      return;
    }
    
    // Add lazy loading to non-critical images
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
}

// Memory cleanup utility
export function cleanupMemory() {
  // Force garbage collection if available (in development)
  if (process.env.NODE_ENV === 'development' && (window as any).gc) {
    (window as any).gc();
  }
}

// Performance monitoring
export function measurePerformance(metricName: string, callback: () => void) {
  const start = performance.now();
  callback();
  const end = performance.now();
  console.log(`[Performance] ${metricName} took ${end - start} milliseconds`);
}

// Cache optimization
export function setupCacheOptimization() {
  // Clear old caches periodically
  setInterval(() => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          // Keep only recent caches
          if (!name.includes(new Date().toISOString().slice(0, 10))) {
            caches.delete(name);
          }
        });
      });
    }
  }, 30 * 60 * 1000); // Every 30 minutes
}