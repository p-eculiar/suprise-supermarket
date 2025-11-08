// Enhanced Service Worker for caching and performance improvements
const CACHE_NAME = 'suprise-supermarket-v1.5';
const CACHE_VERSION = 'v1.5';

// Cache strategies
const CACHE_STRATEGIES = {
  STATIC: 'static',
  DYNAMIC: 'dynamic',
  API: 'api'
};

// URLs to cache during installation (critical assets)
const urlsToCache = [
  '/',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  '/static/js/1.chunk.js',
  '/static/js/2.chunk.js',
  '/static/js/3.chunk.js',
  '/static/js/4.chunk.js',
  '/static/js/5.chunk.js',
  '/static/css/main.chunk.css',
  '/static/media/main-logo.png',
  '/favicon.ico',
  '/manifest.json',
  // Preload critical images
  '/static/media/hero-bg.jpg',
  '/static/media/category-1.jpg',
  '/static/media/category-2.jpg',
  '/static/media/category-3.jpg'
];

// API endpoints to cache with longer expiration
const apiEndpoints = [
  '/rest/v1/products',
  '/rest/v1/blog_posts',
  '/rest/v1/platform_settings',
  '/rest/v1/categories',
  '/rest/v1/deals_of_week_view',
  '/rest/v1/featured_products_view',
  '/rest/v1/bestsellers_view',
  '/rest/v1/popular_products_view'
];

// Assets that should never be cached
const excludedPaths = [
  '/auth',
  '/rest/v1/rpc',
  'supabase.co/storage'
];

// Install event - cache static assets
self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing version:', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Pre-cache additional assets for faster loading
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating version:', CACHE_VERSION);
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to determine if a request should be cached
function shouldCache(request) {
  const url = new URL(request.url);
  
  // Skip requests to external domains
  if (!request.url.startsWith(self.location.origin)) {
    return false;
  }
  
  // Skip excluded paths
  for (const path of excludedPaths) {
    if (url.pathname.includes(path)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to determine cache strategy
function getCacheStrategy(url) {
  // API requests
  for (const endpoint of apiEndpoints) {
    if (url.pathname.includes(endpoint)) {
      return CACHE_STRATEGIES.API;
    }
  }
  
  // Static assets (js, css, images)
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return CACHE_STRATEGIES.STATIC;
  }
  
  // Dynamic content
  return CACHE_STRATEGIES.DYNAMIC;
}

// Helper function to create cache key with timestamp for API requests
function createCacheKey(request) {
  const url = new URL(request.url);
  const strategy = getCacheStrategy(url);
  
  if (strategy === CACHE_STRATEGIES.API) {
    // For API requests, include timestamp for expiration checking
    const now = Date.now();
    const cacheTime = Math.floor(now / (2 * 60 * 1000)) * (2 * 60 * 1000); // 2-minute buckets for better freshness
    return `${request.url}?cache_time=${cacheTime}`;
  }
  
  return request.url;
}

// Helper function to check if cached response is still valid
function isCacheValid(cachedResponse, strategy) {
  if (!cachedResponse) return false;
  
  switch (strategy) {
    case CACHE_STRATEGIES.STATIC:
      // Static assets never expire
      return true;
      
    case CACHE_STRATEGIES.API:
      // API responses expire after 2 minutes (reduced from 5)
      const cacheTime = cachedResponse.headers.get('x-cache-time');
      if (cacheTime) {
        const now = Date.now();
        return (now - parseInt(cacheTime)) < (2 * 60 * 1000);
      }
      return false;
      
    case CACHE_STRATEGIES.DYNAMIC:
      // Dynamic content expires after 30 seconds (reduced from 1 minute)
      const dateHeader = cachedResponse.headers.get('date');
      if (dateHeader) {
        const cachedDate = new Date(dateHeader).getTime();
        const now = Date.now();
        return (now - cachedDate) < (30 * 1000);
      }
      return false;
      
    default:
      return false;
  }
}

// Enhanced fetch event with performance optimizations
self.addEventListener('fetch', function(event) {
  if (!shouldCache(event.request)) {
    return;
  }
  
  const url = new URL(event.request.url);
  const strategy = getCacheStrategy(url);
  const cacheKey = createCacheKey(event.request);
  
  // For static assets, use cache-first strategy for maximum speed
  if (strategy === CACHE_STRATEGIES.STATIC) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(cacheKey).then(function(cachedResponse) {
          // Return cached version immediately if available
          if (cachedResponse) {
            console.log('[Service Worker] Serving static asset from cache:', event.request.url);
            return cachedResponse;
          }
          
          // Fetch from network and cache for future requests
          return fetch(event.request).then(function(networkResponse) {
            if (networkResponse.ok) {
              cache.put(cacheKey, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }
  
  // For API requests, use network-first with fast cache fallback
  if (strategy === CACHE_STRATEGIES.API) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(cacheKey).then(function(cachedResponse) {
          // Race network request with cache timeout for ultra-fast loading
          const networkPromise = fetch(event.request.clone()).then(function(networkResponse) {
            // Cache successful responses
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              const headers = new Headers(responseToCache.headers);
              headers.append('x-cache-time', Date.now().toString());
              
              const responseWithHeaders = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              });
              
              cache.put(cacheKey, responseWithHeaders);
            }
            return networkResponse;
          });
          
          // Add timeout for network requests to prevent hanging
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network timeout')), 3000); // 3 second timeout
          });
          
          // Return cached version immediately if network is slow or fails
          if (cachedResponse && isCacheValid(cachedResponse, strategy)) {
            // Start network request in background but return cache immediately
            networkPromise.catch(() => {}); // Ignore network errors when we have cache
            console.log('[Service Worker] Serving API from cache (network in background):', event.request.url);
            return cachedResponse;
          }
          
          // Race network with timeout, fallback to cache if available
          return Promise.race([networkPromise, timeoutPromise]).catch(function() {
            if (cachedResponse) {
              console.log('[Service Worker] Network failed, serving stale cache:', event.request.url);
              return cachedResponse;
            }
            throw new Error('Network and cache unavailable');
          });
        });
      }).catch(function(error) {
        console.error('[Service Worker] Fetch failed:', error);
        throw error;
      })
    );
    return;
  }
  
  // For dynamic content, use network-first with fast cache fallback
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(cacheKey).then(function(cachedResponse) {
        const networkPromise = fetch(event.request.clone()).then(function(networkResponse) {
          if (networkResponse.ok) {
            cache.put(cacheKey, networkResponse.clone());
          }
          return networkResponse;
        });
        
        // Return cached version immediately if network is slow
        if (cachedResponse && isCacheValid(cachedResponse, strategy)) {
          // Start network request in background but return cache immediately
          networkPromise.catch(() => {});
          console.log('[Service Worker] Serving dynamic content from cache (network in background):', event.request.url);
          return cachedResponse;
        }
        
        return networkPromise.catch(function() {
          if (cachedResponse) {
            return cachedResponse;
          }
          throw new Error('Network and cache unavailable');
        });
      });
    })
  );
});

// Background sync for failed requests
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(syncFailedRequests());
  }
});

// Make this a module
export {};