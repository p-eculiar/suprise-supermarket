import { trackEvent, trackPageView, trackFormSubmission, trackError, initAnalytics } from '../analytics';

describe('Analytics', () => {
  // Extend the Window interface to include gtag and dataLayer
  interface CustomWindow extends Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
  
  // Mock window.gtag and window.dataLayer
  const mockGtag = jest.fn();
  const mockDataLayer: any[] = [];
  
  // Mock the global window object
  const globalAny: any = global;
  
  beforeAll(() => {
    // Setup mock globals with proper typing
    globalAny.window = {
      ...globalAny.window,
      gtag: mockGtag,
      dataLayer: mockDataLayer,
    } as CustomWindow;
    
    // Mock document methods
    document.head.innerHTML = '';
    
    // Mock document.createElement with proper typing
    const originalCreateElement = document.createElement;
    document.createElement = ((tagName: string, options?: ElementCreationOptions) => {
      if (tagName === 'script') {
        const script = originalCreateElement.call(document, 'script');
        // @ts-ignore - Mocking script properties
        script.async = true;
        return script;
      }
      return originalCreateElement.call(document, tagName, options);
    }) as typeof document.createElement;
    
    // Mock navigator.sendBeacon
    Object.defineProperty(global.navigator, 'sendBeacon', {
      value: jest.fn().mockReturnValue(true),
      writable: true,
    });
    
    // Mock fetch
    globalAny.fetch = jest.fn().mockResolvedValue({ ok: true });
  });
  
  afterAll(() => {
    // Clean up global mocks
    delete globalAny.window.gtag;
    delete globalAny.window.dataLayer;
    delete globalAny.fetch;
    jest.restoreAllMocks();
  });
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    mockDataLayer.length = 0;
    document.head.innerHTML = '';
  });
  
  describe('initAnalytics', () => {
    it('initializes with default config', () => {
      initAnalytics();
      expect(mockGtag).not.toHaveBeenCalled();
      expect(document.head.innerHTML).toBe('');
    });
    
    it('initializes Google Analytics when ID is provided', () => {
      initAnalytics({
        googleAnalyticsId: 'GA-123',
        debug: true
      });
      
      // Should add GA script to head
      expect(document.head.innerHTML).toContain('googletagmanager');
      
      // Should initialize gtag
      expect(mockGtag).toHaveBeenCalledWith('js', expect.any(Date));
      expect(mockGtag).toHaveBeenCalledWith('config', 'GA-123', {
        debug_mode: true,
        send_page_view: true
      });
    });
    
    it('initializes Google Tag Manager when ID is provided', () => {
      initAnalytics({
        googleTagManagerId: 'GTM-123'
      });
      
      // Should add GTM script to head
      expect(document.head.innerHTML).toContain('googletagmanager.com/gtm.js');
    });
  });
  
  describe('trackEvent', () => {
    it('sends events to Google Analytics when configured', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      trackEvent('button_click', { category: 'engagement', label: 'cta' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
        category: 'engagement',
        label: 'cta',
        event_category: 'engagement',
        timestamp: expect.any(String)
      });
    });
    
    it('handles missing analytics configuration', () => {
      // Reset any previous init
      initAnalytics();
      
      // Should not throw when no analytics is configured
      expect(() => {
        trackEvent('test_event', { test: 'data' });
      }).not.toThrow();
    });
  });
  
  describe('trackPageView', () => {
    it('tracks page views with path and title', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      trackPageView('/test', 'Test Page');
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_path: '/test',
        page_title: 'Test Page',
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('trackFormSubmission', () => {
    it('tracks successful form submissions', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      trackFormSubmission('contact', 'success', { field_count: 4 });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'form_success', {
        category: 'form',
        form_name: 'contact',
        form_status: 'success',
        field_count: 4,
        event_category: 'form',
        timestamp: expect.any(String)
      });
    });
    
    it('tracks failed form submissions', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      trackFormSubmission('contact', 'error', { error: 'validation_error' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'form_error', {
        category: 'form',
        form_name: 'contact',
        form_status: 'error',
        error: 'validation_error',
        event_category: 'form',
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('trackError', () => {
    it('tracks error objects', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      const error = new Error('Test error');
      trackError(error, { component: 'TestComponent' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'error_occurred', {
        category: 'error',
        component: 'TestComponent',
        error_message: 'Test error',
        error_stack: expect.any(String),
        event_category: 'error',
        timestamp: expect.any(String)
      });
    });
    
    it('tracks error strings', () => {
      initAnalytics({ googleAnalyticsId: 'GA-123' });
      
      trackError('Test error message', { page: 'Home' });
      
      expect(mockGtag).toHaveBeenCalledWith('event', 'error_occurred', {
        category: 'error',
        page: 'Home',
        error_message: 'Test error message',
        error_stack: undefined,
        event_category: 'error',
        timestamp: expect.any(String)
      });
    });
  });
  
  describe('custom endpoint', () => {
    it('sends data to custom endpoint when configured', async () => {
      const mockFetch = jest.fn().mockResolvedValue({ ok: true });
      globalAny.fetch = mockFetch;
      
      initAnalytics({
        customEndpoint: '/api/analytics'
      });
      
      trackEvent('page_view', { test: 'data' });
      
      await new Promise(process.nextTick);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          keepalive: true
        })
      );
    });
    
    it('uses sendBeacon when available', () => {
      const mockSendBeacon = jest.fn().mockReturnValue(true);
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true,
      });
      
      initAnalytics({
        customEndpoint: '/api/analytics'
      });
      
      trackEvent('page_view', { test: 'data' });
      
      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/analytics',
        expect.any(Blob)
      );
    });
  });
  
  describe('Google Tag Manager', () => {
    it('pushes events to dataLayer when GTM is configured', () => {
      initAnalytics({
        googleTagManagerId: 'GTM-123'
      });
      
      trackEvent('page_view', { test: 'data' });
      
      expect(mockDataLayer).toContainEqual({
        event: 'page_view',
        test: 'data',
        timestamp: expect.any(String)
      });
    });
  });
});
