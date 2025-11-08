import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, DefaultTheme } from 'styled-components';
import { theme } from './theme';
import { GlobalStyles } from './styles/global';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { supabase } from './lib/supabase';

// Register service worker for performance improvements
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => {
        console.log('[Service Worker] Registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.log('[Service Worker] Registration failed:', error);
      });
  });
}

// Create a client for React Query with optimized settings for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10 * 60 * 1000, // 10 minutes - cache data longer
      gcTime: 15 * 60 * 1000, // 15 minutes - keep unused data in cache
      refetchOnMount: false, // Don't refetch when component mounts if data is fresh
      refetchOnReconnect: false, // Don't refetch on reconnect if data is fresh
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme as unknown as DefaultTheme}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <GlobalStyles />
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

// Expose supabase for debugging at runtime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).__SUPABASE__ = supabase;
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-console
  console.log('[App] Supabase Base URL:', (supabase as any)?.storageUrl?.replace('/storage/v1', '') || 'NA');
} catch {}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();