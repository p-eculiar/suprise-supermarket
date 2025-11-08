/**
 * Analytics Utility
 * 
 * This module provides functions to track user interactions and form submissions.
 * It's designed to be easily extendable for different analytics providers.
 */

// Types
type EventCategory = 'user' | 'form' | 'navigation' | 'error' | 'authentication';

type EventAction = 
  | 'form_submit' 
  | 'form_success' 
  | 'form_error' 
  | 'page_view' 
  | 'button_click' 
  | 'link_click' 
  | 'error_occurred'
  | 'login'
  | 'logout'
  | 'signup'
  | 'test_event';  // Added for testing purposes

interface EventParams {
  event_category?: EventCategory;
  event_label?: string;
  value?: number;
  non_interaction?: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Track an analytics event
 * @param action - The action being tracked (e.g., 'submit_form', 'click_button')
 * @param params - Additional parameters for the event
 */
export const trackEvent = (action: EventAction, params: EventParams = {}) => {
  // Default event category based on action
  const defaultCategory: EventCategory = 
    action.startsWith('form_') ? 'form' :
    ['login', 'logout', 'signup'].includes(action) ? 'authentication' :
    action === 'page_view' ? 'navigation' :
    'user';

  const eventData = {
    action,
    category: params.event_category || defaultCategory,
    label: params.event_label,
    value: params.value,
    ...params,
    // Remove the type-specific fields to avoid duplicates
    event_category: undefined,
    event_label: undefined,
    // Add timestamp
    timestamp: new Date().toISOString(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics Event] ${action}:`, eventData);
  }

  // Send to analytics service (e.g., Google Analytics, Mixpanel, etc.)
  sendToAnalyticsService(eventData);
};

/**
 * Track a page view
 * @param pageTitle - The title of the page being viewed
 * @param pagePath - The path of the page being viewed
 * @param additionalParams - Additional parameters for the page view
 */
export const trackPageView = (
  pageTitle: string, 
  pagePath: string, 
  additionalParams: Omit<EventParams, 'page_title' | 'page_path'> = {}
) => {
  trackEvent('page_view', {
    ...additionalParams,
    page_title: pageTitle,
    page_path: pagePath,
  });
};

/**
 * Track a form submission
 * @param formName - The name/identifier of the form
 * @param status - The status of the form submission ('success' or 'error')
 * @param additionalParams - Additional parameters for the form submission
 */
export const trackFormSubmission = (
  formName: string,
  status: 'success' | 'error',
  additionalParams: Omit<EventParams, 'form_name' | 'form_status'> = {}
) => {
  const action = status === 'success' ? 'form_success' : 'form_error';
  
  trackEvent(action, {
    ...additionalParams,
    form_name: formName,
    form_status: status,
  });
};

/**
 * Track an error
 * @param error - The error object or message
 * @param context - Additional context about where the error occurred
 */
export const trackError = (
  error: Error | string,
  context: Record<string, any> = {}
) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'object' && 'stack' in error ? error.stack : undefined;
  
  trackEvent('error_occurred', {
    ...context,
    error_message: errorMessage,
    error_stack: errorStack,
    event_category: 'error',
  });
};

// Analytics configuration
interface AnalyticsConfig {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  customEndpoint?: string;
  debug?: boolean;
}

// Initialize analytics with configuration
let analyticsConfig: AnalyticsConfig = {
  debug: process.env.NODE_ENV !== 'production',
};

export const initAnalytics = (config: AnalyticsConfig = {}) => {
  analyticsConfig = { ...analyticsConfig, ...config };
  
  if (analyticsConfig.debug) {
    console.log('[Analytics] initialized with config:', analyticsConfig);
  }
  
  // Initialize Google Analytics if ID is provided
  if (analyticsConfig.googleAnalyticsId && typeof window !== 'undefined') {
    initGoogleAnalytics(analyticsConfig.googleAnalyticsId);
  }
  
  // Initialize Google Tag Manager if ID is provided
  if (analyticsConfig.googleTagManagerId && typeof window !== 'undefined') {
    initGoogleTagManager(analyticsConfig.googleTagManagerId);
  }
};

// Internal function to send data to analytics services
function sendToAnalyticsService(data: Record<string, any>) {
  const { debug, googleAnalyticsId, googleTagManagerId, customEndpoint } = analyticsConfig;
  
  if (debug) {
    console.log('[Analytics] Event:', data);
  }

    try {
    // Send to Google Analytics (Universal Analytics)
    if (googleAnalyticsId && typeof window !== 'undefined' && typeof window.gtag === 'function') {
      sendToGoogleAnalytics(data);
    }

    // Send to Google Tag Manager
    if (googleTagManagerId && typeof window !== 'undefined' && window.dataLayer) {
      sendToGoogleTagManager(data);
    }

    // Send to custom analytics endpoint
    if (customEndpoint && typeof window !== 'undefined') {
      sendToCustomEndpoint(data, customEndpoint);
    }
  } catch (error) {
    if (debug) {
      console.error('[Analytics] Error sending analytics:', error);
    }
  }
}

// Google Analytics implementation
function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Define gtag function if it doesn't exist
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };

  // Only load the script in non-test environment
  if (process.env.NODE_ENV !== 'test') {
    // Load Google Analytics script if not already loaded
    if (!document.querySelector('#google-analytics-script')) {
      const script = document.createElement('script');
      script.id = 'google-analytics-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    }
  }
  
  // Initialize gtag
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false, // We'll handle page views manually
    transport_url: 'https://www.google-analytics.com',
    first_party_collection: true
  });
}

function sendToGoogleAnalytics(data: Record<string, any>) {
  if (typeof window === 'undefined' || !(window as any).gtag) return;

  const { action, category, label, value, ...rest } = data;
  
  (window as any).gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...rest
  });
}

// Google Tag Manager implementation
function initGoogleTagManager(containerId: string) {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];
  
  // Push the initial gtm.js event
  window.dataLayer.push({
    'gtm.start': new Date().getTime(),
    'event': 'gtm.js'
  });

  // Only load the script in non-test environment
  if (process.env.NODE_ENV !== 'test') {
    // Check if script already exists
    if (!document.querySelector('#google-tag-manager-script')) {
      const script = document.createElement('script');
      script.id = 'google-tag-manager-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
      script.onerror = () => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Failed to load GTM script');
        }
      };
      document.head.appendChild(script);
    }
  }
}

function sendToGoogleTagManager(data: Record<string, any>) {
  if (typeof window === 'undefined' || !(window as any).dataLayer) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('dataLayer not available');
    }
    return;
  }
  
  try {
    const { action, ...rest } = data;
    (window as any).dataLayer.push({
      event: action || 'interaction',
      ...rest
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error pushing to dataLayer:', error);
    }
  }
}

// Custom endpoint implementation
async function sendToCustomEndpoint(data: Record<string, any>, endpoint: string) {
  if (typeof window === 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Custom endpoint not available in SSR');
    }
    return;
  }

  const { debug } = analyticsConfig;
  const payload = JSON.stringify(data);
  
  try {
    const blob = new Blob([payload], { type: 'application/json' });
    
    // Use Beacon API if available for better performance
    if (navigator.sendBeacon) {
      if (debug) {
        console.log('[Analytics] Sending via sendBeacon:', { endpoint, data });
      }
      const success = navigator.sendBeacon(endpoint, blob);
      if (!success && debug) {
        console.warn('[Analytics] sendBeacon failed, falling back to fetch');
        throw new Error('sendBeacon failed');
      }
      return success;
    }
    
    // Fallback to fetch API
    if (debug) {
      console.log('[Analytics] Sending via fetch:', { endpoint, data });
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: blob,
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // Ensures the request is sent even if the page is unloaded
      credentials: 'same-origin' // Include cookies for authenticated requests
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    if (debug || process.env.NODE_ENV !== 'production') {
      console.error('[Analytics] Error sending to custom endpoint:', {
        endpoint,
        error,
        payload: data
      });
    }
    throw error; // Re-throw to allow callers to handle the error
  }
}

// Initialize analytics when the module loads
if (typeof window !== 'undefined') {
  initAnalytics({
    googleAnalyticsId: process.env.REACT_APP_GA_MEASUREMENT_ID,
    googleTagManagerId: process.env.REACT_APP_GTM_CONTAINER_ID,
    customEndpoint: process.env.REACT_APP_ANALYTICS_ENDPOINT,
    debug: process.env.NODE_ENV !== 'production'
  });
}

export { sendToCustomEndpoint };
