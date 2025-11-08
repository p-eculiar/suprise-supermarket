import { trackEvent, trackPageView, trackFormSubmission, trackError, initAnalytics, sendToCustomEndpoint } from '../analytics';

// Extend the Window interface to include gtag and dataLayer
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

describe('Analytics', () => {
  // Define mock functions and data
  const mockGtag = jest.fn();
  const mockDataLayer: any[] = [];
  const mockFetch = jest.fn().mockResolvedValue({ ok: true });
  
  // Create a mock document implementation
  const mockDocument = {
    createElement: jest.fn().mockImplementation((tagName: string) => {
      const element = document.createElement(tagName);
      if (tagName === 'script') {
        // @ts-ignore - Mocking script properties
        element.async = true;
      }
      return element;
    }),
    head: {
      appendChild: jest.fn(),
      querySelector: jest.fn().mockReturnValue(null),
      innerHTML: ''
    },
    querySelector: jest.fn().mockReturnValue(null)
  } as unknown as Document;
  
  // Store original globals
  const originalWindow = { ...global.window };
  const originalDocument = global.document;
  const originalNavigator = global.navigator;
  const originalProcess = global.process;
  const originalFetch = global.fetch;
  
  beforeAll(() => {
    // Mock window object
    global.window = {
      ...global.window,
      gtag: mockGtag,
      dataLayer: mockDataLayer,
      document: mockDocument
    } as unknown as Window & typeof globalThis;
    
    // Mock document
    global.document = mockDocument;
    
    // Mock navigator
    Object.defineProperty(global, 'navigator', {
      value: {
        ...originalNavigator,
        sendBeacon: jest.fn().mockReturnValue(true)
      },
      writable: true,
      configurable: true
    });
    
    // Mock fetch
    global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;
    
    // Mock process.env
    global.process = {
      ...originalProcess,
      env: {
        ...(originalProcess?.env || {}),
        NODE_ENV: 'test'
      }
    };
  });
  
  afterAll(() => {
    // Restore original globals
    global.window = originalWindow;
    global.document = originalDocument;
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
    global.process = originalProcess;
    global.fetch = originalFetch;
    
    // Clear all mocks
    jest.clearAllMocks();
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
  
  describe('Custom Endpoint', () => {
    it('sends data to custom endpoint when configured', async () => {
      const mockSendBeacon = jest.fn().mockReturnValue(true);
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true,
      });
      
      initAnalytics({
        customEndpoint: '/api/analytics',
        debug: true
      });
      
      const eventData = { action: 'test_event', category: 'test' };
      trackEvent('test_event', eventData);
      
      // Wait for any async operations
      await new Promise(process.nextTick);
      
      // Should use sendBeacon by default
      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/analytics',
        expect.any(Blob)
      );
      
      // Verify the blob content
      const blob = mockSendBeacon.mock.calls[0][1];
      const text = await new Response(blob).text();
      const parsedData = JSON.parse(text);
      
      expect(parsedData).toMatchObject({
        action: 'test_event',
        category: 'test',
        timestamp: expect.any(String)
      });
    });
    
    it('falls back to fetch when sendBeacon is not available', async () => {
      // Mock no sendBeacon
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: undefined,
        writable: true,
      });
      
      initAnalytics({
        customEndpoint: '/api/analytics'
      });
      
      const eventData = { action: 'test_event', category: 'test' };
      trackEvent('test_event', eventData);
      
      // Wait for fetch to be called
      await new Promise(process.nextTick);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(Blob),
          headers: {
            'Content-Type': 'application/json'
          },
          keepalive: true,
          credentials: 'same-origin'
        })
      );
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
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    const originalFetch = global.fetch;
    const originalSendBeacon = global.navigator.sendBeacon;

    beforeEach(() => {
      global.fetch = mockFetch;
      mockFetch.mockClear();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: originalSendBeacon,
        writable: true,
      });
    });

    it('sends data to custom endpoint when configured', async () => {
      // Initialize with custom endpoint
      initAnalytics({
        customEndpoint: '/api/analytics',
        debug: true
      });
      
      // Track an event
      const eventData = { test: 'data', category: 'test' };
      trackEvent('page_view', eventData);
      
      // Wait for any async operations
      await new Promise(process.nextTick);
      
      // Verify fetch was called with correct arguments
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/analytics',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          keepalive: true,
          body: expect.any(Blob)
        })
      );
      
      // Verify the request body contains our event data
      const requestBody = mockFetch.mock.calls[0][1].body as Blob;
      const text = await requestBody.text();
      const parsedBody = JSON.parse(text);
      
      expect(parsedBody).toMatchObject({
        action: 'page_view',
        ...eventData
      });
    });
    
    it('uses sendBeacon when available', () => {
      const mockSendBeacon = jest.fn().mockReturnValue(true);
      Object.defineProperty(global.navigator, 'sendBeacon', {
        value: mockSendBeacon,
        writable: true,
      });
      
      initAnalytics({
        customEndpoint: '/api/analytics',
        debug: true
      });
      
      const eventData = { test: 'beacon', category: 'test' };
      trackEvent('page_view', eventData);
      
      // Verify sendBeacon was called with correct arguments
      expect(mockSendBeacon).toHaveBeenCalledWith(
        '/api/analytics',
        expect.any(Blob)
      );
      
      // Verify fetch was not used when sendBeacon is available
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
  
  describe('Google Tag Manager', () => {
    it('pushes events to dataLayer when GTM is configured', () => {
      // Initialize with GTM
      initAnalytics({
        googleTagManagerId: 'GTM-123',
        debug: true
      });

      // Track an event
      trackEvent('page_view', { test: 'data', category: 'test' });
      
      // Verify dataLayer was updated
      expect(mockDataLayer).toEqual(expect.arrayContaining([
        expect.objectContaining({
          event: 'gtm.js',
          'gtm.start': expect.any(Number)
        }),
        expect.objectContaining({
          event: 'page_view',
          test: 'data',
          category: 'test',
          timestamp: expect.any(String)
        })
      ]));
      
      // Verify gtm.js was initialized
      expect(global.document.head.appendChild).toHaveBeenCalled();
    });
    
    it('handles missing dataLayer gracefully', () => {
      // @ts-ignore - Test missing dataLayer
      delete global.window.dataLayer;
      
      // Should not throw when dataLayer is missing
      expect(() => {
        initAnalytics({ googleTagManagerId: 'GTM-123' });
        trackEvent('test_event', { test: 'data' });
      }).not.toThrow();
    });
  });
});

