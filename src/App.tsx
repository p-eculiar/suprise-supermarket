import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';
import { clearAllCaches } from './utils/navigationHelpers';
import { optimizeImages, lazyLoadImages, debounce, initPerformanceOptimizations } from './utils/performance';

// Loading component styled container
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #636E72;
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #E1E8ED;
    border-top: 4px solid #6C9A7F;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
`;

// Loading component
const Loading = React.memo(() => (
  <LoadingContainer>
    <div className="spinner" />
  </LoadingContainer>
));

// Preload critical components with optimized loading
const preloadComponent = (importFunc: () => Promise<any>) => {
  return React.lazy(() => {
    // Preload the component immediately with error handling
    const componentPromise = importFunc().catch(error => {
      console.error('Component loading failed:', error);
      // Return a fallback component
      return Promise.resolve({ default: () => <div>Error loading component</div> });
    });
    return componentPromise;
  });
};

// Lazy load pages with optimized imports and preloading
const Home = preloadComponent(() => import(/* webpackPreload: true */ './pages/Home'));
const Products = preloadComponent(() => import(/* webpackPreload: true */ './pages/Products'));
const ProductDetail = preloadComponent(() => import('./pages/ProductDetail'));
const Cart = preloadComponent(() => import('./pages/Cart'));
const Wishlist = preloadComponent(() => import('./pages/Wishlist'));
const Services = preloadComponent(() => import('./pages/Services'));
const About = preloadComponent(() => import('./pages/About'));
const Contact = preloadComponent(() => import('./pages/Contact'));
const Login = preloadComponent(() => import('./pages/Login'));
const Register = preloadComponent(() => import('./pages/Register'));
const Profile = preloadComponent(() => import('./pages/Profile'));
const Notifications = preloadComponent(() => import('./pages/Notifications'));
const NotificationPreferences = preloadComponent(() => import('./pages/NotificationPreferences'));
const NotFound = preloadComponent(() => import('./pages/NotFound'));
const ForgotPassword = preloadComponent(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = preloadComponent(() => import('./pages/auth/ResetPassword'));

// Admin pages
const AdminLayout = preloadComponent(() => import('./components/admin/AdminLayout'));
const Dashboard = preloadComponent(() => import(/* webpackPreload: true */ './pages/admin/Dashboard'));
const AdminProducts = preloadComponent(() => import('./pages/admin/Products'));
const ProductForm = preloadComponent(() => import('./pages/admin/ProductForm'));
const AdminCategories = preloadComponent(() => import('./pages/admin/Categories'));
const AdminUsers = preloadComponent(() => import('./pages/admin/Users'));
const AdminOrders = preloadComponent(() => import('./pages/admin/Orders'));
const OrderAnalytics = preloadComponent(() => import('./pages/admin/OrderAnalytics'));
const NigeriaAnalytics = preloadComponent(() => import('./pages/admin/NigeriaAnalytics'));
const AdminSettings = preloadComponent(() => import('./pages/admin/Settings'));
const AdminBanners = preloadComponent(() => import('./pages/admin/Banners'));
const SocialLeads = preloadComponent(() => import('./pages/admin/SocialLeads'));
const AdminDeals = preloadComponent(() => import('./pages/admin/Deals'));
const Contacts = preloadComponent(() => import('./pages/admin/Contacts'));
const EnhancedRealtimeData = preloadComponent(() => import('./EnhancedRealtimeData'));

// User dashboard pages
const DashboardLayout = preloadComponent(() => import('./components/layout/DashboardLayout'));

// Lazy loaded user dashboard components
const UserDashboard = preloadComponent(() => import(/* webpackPreload: true */ './pages/dashboard/UserDashboard'));
const Orders = preloadComponent(() => import('./pages/dashboard/Orders'));
const DeliveryTracking = preloadComponent(() => import('./pages/dashboard/DeliveryTracking'));
const Feedback = preloadComponent(() => import('./pages/dashboard/Feedback'));
const Messages = preloadComponent(() => import('./pages/dashboard/Messages'));
const History = preloadComponent(() => import('./pages/dashboard/History'));
const Payment = preloadComponent(() => import('./pages/dashboard/Payment'));
const Customization = preloadComponent(() => import('./pages/dashboard/Customization'));
const OrderConfirmation = preloadComponent(() => import('./pages/OrderConfirmation'));

// Lazy loaded revenue feature components
// Diaspora gifting routes removed as per user request
const Checkout = preloadComponent(() => import('./pages/Checkout'));

// Blog components
const Blog = preloadComponent(() => import('./pages/Blog'));
const BlogPost = preloadComponent(() => import('./pages/BlogPost'));
const ExternalBlogPost = preloadComponent(() => import('./pages/ExternalBlogPost'));

const AppContent: React.FC = () => {
  const { pathname } = useLocation();
  
  // Debounced cache clearing to prevent excessive clearing
  const debouncedClearCaches = useMemo(
    () => debounce(() => clearAllCaches(), 1000),
    []
  );

  useEffect(() => {
    debouncedClearCaches();
  }, [pathname, debouncedClearCaches]);

  // Performance optimization effects
  useEffect(() => {
    // Initialize performance optimizations
    initPerformanceOptimizations();
    
    // Optimize images after initial render
    const timer = setTimeout(() => {
      optimizeImages();
      lazyLoadImages();
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Memoized route components to prevent unnecessary re-renders
  const routeComponents = useMemo(() => ({
    home: <Home />,
    products: <Products />,
    productDetail: <ProductDetail />,
    cart: <Cart />,
    wishlist: <Wishlist />,
    services: <Services />,
    about: <About />,
    contact: <Contact />,
    login: <Login />,
    register: <Register />,
    forgotPassword: (
      <React.Suspense fallback={<Loading />}> 
        <ForgotPassword />
      </React.Suspense>
    ),
    resetPassword: (
      <React.Suspense fallback={<Loading />}> 
        <ResetPassword />
      </React.Suspense>
    ),
    blog: <Blog />,
    blogPost: <BlogPost />,
    externalBlogPost: <ExternalBlogPost />,
    profile: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    notifications: (
      <ProtectedRoute>
        <React.Suspense fallback={<Loading />}>
          <Notifications />
        </React.Suspense>
      </ProtectedRoute>
    ),
    notificationPreferences: (
      <ProtectedRoute>
        <React.Suspense fallback={<Loading />}>
          <NotificationPreferences />
        </React.Suspense>
      </ProtectedRoute>
    ),
    checkout: (
      <ProtectedRoute>
        <React.Suspense fallback={<Loading />}>
          <Checkout />
        </React.Suspense>
      </ProtectedRoute>
    ),
  }), []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={routeComponents.home} />
        <Route path="products" element={routeComponents.products} />
        <Route path="products/:id" element={routeComponents.productDetail} />
        <Route path="cart" element={routeComponents.cart} />
        <Route path="wishlist" element={routeComponents.wishlist} />
        <Route path="services" element={routeComponents.services} />
        <Route path="about" element={routeComponents.about} />
        <Route path="contact" element={routeComponents.contact} />
        <Route path="login" element={routeComponents.login} />
        <Route path="register" element={routeComponents.register} />
        <Route path="forgot-password" element={routeComponents.forgotPassword} />
        <Route path="reset-password" element={routeComponents.resetPassword} />
        <Route path="blog" element={routeComponents.blog} />
        <Route path="blog/:slug" element={routeComponents.blogPost} />
        <Route path="external-blog/:index" element={routeComponents.externalBlogPost} />
        
        {/* Protected routes */}
        <Route path="profile" element={routeComponents.profile} />
        <Route path="notifications" element={routeComponents.notifications} />
        <Route path="notification-preferences" element={routeComponents.notificationPreferences} />
        
        {/* Checkout route */}
        <Route path="checkout" element={routeComponents.checkout} />
        
        {/* Diaspora gifting routes removed as per user request */}

        {/* User Dashboard Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<Loading />}>
                <DashboardLayout />
              </React.Suspense>
            </ProtectedRoute>
          }
        >
          <Route index element={
            <React.Suspense fallback={<Loading />}>
              <UserDashboard />
            </React.Suspense>
          } />
          <Route path="orders" element={
            <React.Suspense fallback={<Loading />}>
              <Orders />
            </React.Suspense>
          } />
          <Route path="tracking" element={
            <React.Suspense fallback={<Loading />}>
              <DeliveryTracking />
            </React.Suspense>
          } />
          <Route path="feedback" element={
            <React.Suspense fallback={<Loading />}>
              <Feedback />
            </React.Suspense>
          } />
          <Route path="messages" element={
            <React.Suspense fallback={<Loading />}>
              <Messages />
            </React.Suspense>
          } />
          <Route path="history" element={
            <React.Suspense fallback={<Loading />}>
              <History />
            </React.Suspense>
          } />
          <Route path="payment" element={
            <React.Suspense fallback={<Loading />}>
              <Payment />
            </React.Suspense>
          } />
          <Route path="customization" element={
            <React.Suspense fallback={<Loading />}>
              <Customization />
            </React.Suspense>
          } />
        </Route>

        {/* 404 - Keep this as the last route */}
        <Route path="*" element={
          <React.Suspense fallback={<Loading />}>
            <NotFound />
          </React.Suspense>
        } />
      </Route>

      {/* Admin routes - Separate layout */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <React.Suspense fallback={<Loading />}>
            <AdminLayout />
          </React.Suspense>
        </ProtectedRoute>
      }>
        <Route index element={
          <React.Suspense fallback={<Loading />}>
            <Dashboard />
          </React.Suspense>
        } />
        <Route path="products" element={
          <React.Suspense fallback={<Loading />}>
            <AdminProducts />
          </React.Suspense>
        } />
        <Route path="products/new" element={
          <React.Suspense fallback={<Loading />}>
            <ProductForm />
          </React.Suspense>
        } />
        <Route path="products/edit/:id" element={
          <React.Suspense fallback={<Loading />}>
            <ProductForm />
          </React.Suspense>
        } />
        <Route path="categories" element={
          <React.Suspense fallback={<Loading />}>
            <AdminCategories />
          </React.Suspense>
        } />
        <Route path="banners" element={
          <React.Suspense fallback={<Loading />}>
            <AdminBanners />
          </React.Suspense>
        } />
        
        <Route path="users" element={
          <React.Suspense fallback={<Loading />}>
            <AdminUsers />
          </React.Suspense>
        } />
        <Route path="orders" element={
          <React.Suspense fallback={<Loading />}>
            <AdminOrders />
          </React.Suspense>
        } />
        <Route path="analytics" element={
          <React.Suspense fallback={<Loading />}>
            <OrderAnalytics />
          </React.Suspense>
        } />
        <Route path="nigeria-analytics" element={
          <React.Suspense fallback={<Loading />}>
            <NigeriaAnalytics />
          </React.Suspense>
        } />
        <Route path="settings" element={
          <React.Suspense fallback={<Loading />}>
            <AdminSettings />
          </React.Suspense>
        } />
        {/* Diaspora gifting admin routes removed as per user request */}
        <Route path="social-leads" element={
          <React.Suspense fallback={<Loading />}>
            <SocialLeads />
          </React.Suspense>
        } />
        <Route path="deals" element={
          <React.Suspense fallback={<Loading />}>
            <AdminDeals />
          </React.Suspense>
        } />
        <Route path="contacts" element={
          <React.Suspense fallback={<Loading />}>
            <Contacts />
          </React.Suspense>
        } />
        <Route path="realtime-data" element={
          <React.Suspense fallback={<Loading />}>
            <EnhancedRealtimeData />
          </React.Suspense>
        } />
      </Route>
    </Routes>
  );
};

// Wrap providers for better performance with memoization
const AppProviders: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider />
            {children}
          </WishlistProvider>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
});

const App: React.FC = () => {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
};

export default App;