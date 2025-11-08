// Performance monitoring utility to track loading times and optimizations

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoadedTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  resourceLoadTimes: Record<string, number>;
  apiResponseTimes: Record<string, number>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    pageLoadTime: 0,
    domContentLoadedTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    firstInputDelay: 0,
    cumulativeLayoutShift: 0,
    resourceLoadTimes: {},
    apiResponseTimes: {}
  };

  private observer: PerformanceObserver | null = null;
  private timings: Map<string, number> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    // Measure core web vitals
    this.measureCoreWebVitals();
    
    // Observe resource loading
    this.observeResourceLoading();
    
    // Log performance when page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.logPerformanceReport();
      }, 1000); // Wait a bit for all metrics to be collected
    });
  }

  private measureCoreWebVitals() {
    // Page load time
    if (performance.getEntriesByType) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0] as PerformanceNavigationTiming;
        this.metrics.pageLoadTime = nav.loadEventEnd - nav.loadEventStart;
        this.metrics.domContentLoadedTime = nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart;
      }
    }

    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      // FCP
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // CLS
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            this.metrics.cumulativeLayoutShift += (entry as any).value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeResourceLoading() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.metrics.resourceLoadTimes[resourceEntry.name] = resourceEntry.responseEnd - resourceEntry.requestStart;
          }
        });
      });
      
      this.observer.observe({ entryTypes: ['resource'] });
    }
  }

  public recordApiResponse(url: string, duration: number) {
    this.metrics.apiResponseTimes[url] = duration;
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public logPerformanceReport() {
    console.log('[Performance Monitor] Performance Report:', {
      'Page Load Time (ms)': this.metrics.pageLoadTime,
      'DOM Content Loaded (ms)': this.metrics.domContentLoadedTime,
      'First Contentful Paint (ms)': this.metrics.firstContentfulPaint,
      'Largest Contentful Paint (ms)': this.metrics.largestContentfulPaint,
      'Cumulative Layout Shift': this.metrics.cumulativeLayoutShift,
      'Resource Load Times': this.metrics.resourceLoadTimes,
      'API Response Times': this.metrics.apiResponseTimes
    });
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // Add timing functionality
  public startTiming(label: string): () => void {
    const startTime = performance.now();
    this.timings.set(label, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`[Performance] ${label} took ${duration.toFixed(2)}ms`);
      this.timings.delete(label);
    };
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility function to measure API call performance
export function measureApiCall<T>(url: string, apiCall: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  return apiCall().then((result) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    performanceMonitor.recordApiResponse(url, duration);
    return result;
  });
}

// Utility function to get performance improvement percentage
export function calculatePerformanceImprovement(before: number, after: number): number {
  if (before <= 0) return 0;
  return ((before - after) / before) * 100;
}