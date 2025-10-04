// Global type declarations for analytics
interface Window {
  gtag: (...args: any[]) => void;
  dataLayer: any[];
}

declare const gtag: Window['gtag'];
declare const dataLayer: Window['dataLayer'];
