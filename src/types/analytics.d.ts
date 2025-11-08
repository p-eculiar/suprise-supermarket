// Type definitions for analytics utilities
declare global {
  interface Window {
    // Google Analytics
    gtag: Gtag.GlobalGtag;
    dataLayer: any[];
  }

  // Google Analytics types
  namespace Gtag {
    interface GlobalGtag {
      (command: 'config', targetId: string, config?: ControlParams | EventParams | ConfigParams | any): void;
      (command: 'set', targetId: string, config: CustomParams | boolean | string): void;
      (command: 'set', config: CustomParams): void;
      (command: 'js', config: Date): void;
      (command: 'event', eventName: string | EventNames, eventParams?: ControlParams | EventParams | CustomParams): void;
    }

    interface ControlParams {
      groups?: string | string[];
      send_to?: string | string[];
      event_callback?: () => void;
      event_timeout?: number;
    }

    interface CustomParams {
      [key: string]: any;
    }

    interface ConfigParams {
      page_title?: string;
      page_path?: string;
      page_location?: string;
      send_page_view?: boolean;
      transport_url?: string;
      first_party_collection?: boolean;
    }

    interface EventParams {
      event_category?: string;
      event_label?: string;
      value?: number;
      non_interaction?: boolean;
      [key: string]: any;
    }

    type EventNames =
      | 'add_payment_info'
      | 'add_to_cart'
      | 'add_to_wishlist'
      | 'begin_checkout'
      | 'checkout_progress'
      | 'exception'
      | 'generate_lead'
      | 'login'
      | 'page_view'
      | 'purchase'
      | 'refund'
      | 'remove_from_cart'
      | 'screen_view'
      | 'search'
      | 'select_content'
      | 'set_checkout_option'
      | 'share'
      | 'sign_up'
      | 'timing_complete'
      | 'view_item'
      | 'view_item_list'
      | 'view_promotion'
      | 'view_search_results'
      | string;
  }
}
