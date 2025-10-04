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
  [key: string]: string | number | boolean | null | undefined;
  event_category?: EventCategory;
  event_label?: string;
  value?: number;
  non_interaction?: boolean;
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

  // Send to Google Analytics (Universal Analytics)
  if (googleAnalyticsId && typeof window !== 'undefined') {
    sendToGoogleAnalytics(data);
  }

  // Send to Google Tag Manager
  if (googleTagManagerId && typeof window !== 'undefined' && (window as any).dataLayer) {
    sendToGoogleTagManager(data);
  }

  // Send to custom analytics endpoint
  if (customEndpoint && typeof window !== 'undefined') {
    sendToCustomEndpoint(data, customEndpoint);
  }
}

// Google Analytics implementation
function initGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;

  // Load Google Analytics script if not already loaded
  if (!document.querySelector('#google-analytics-script')) {
    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      (window.dataLayer as any).push(arguments);
    };
    
    gtag('js', new Date());
    gtag('config', measurementId, {
      send_page_view: false, // We'll handle page views manually
      transport_url: 'https://www.google-analytics.com',
      first_party_collection: true
    });
  }
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

  if (!document.querySelector('#google-tag-manager-script')) {
    // Main GTM script
    const gtmScript = document.createElement('script');
    gtmScript.id = 'google-tag-manager-script';
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${containerId}');
    `;
    document.head.appendChild(gtmScript);
  }
}

function sendToGoogleTagManager(data: Record<string, any>) {
  if (typeof window === 'undefined' || !(window as any).dataLayer) return;
  
  (window as any).dataLayer.push({
    event: data.action,
    ...data
  });
}

// Custom endpoint implementation
async function sendToCustomEndpoint(data: Record<string, any>, endpoint: string) {
  if (typeof window === 'undefined') return;

  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    
    // Use Beacon API if available for better performance
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback to fetch API
      await fetch(endpoint, {
        method: 'POST',
        body: blob,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true, // Ensures the request is sent even if the page is unloaded
      });
    }
  } catch (error) {
    if (analyticsConfig.debug) {
      console.error('[Analytics] Error sending to custom endpoint:', error);
    }
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
