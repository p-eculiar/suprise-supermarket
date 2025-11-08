import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ToastProvider } from './components/common/Toast';

// Lazy load pages with static imports
const Home = React.lazy(() => import('./pages/Home'));
const Products = React.lazy(() => import('./pages/Products'));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail'));
const Cart = React.lazy(() => import('./pages/Cart'));
const Wishlist = React.lazy(() => import('./pages/Wishlist'));
const Services = React.lazy(() => import('./pages/Services'));
const About = React.lazy(() => import('./pages/About'));
const Contact = React.lazy(() => import('./pages/Contact'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

// Admin pages
const AdminLayout = React.lazy(() => import('./components/admin/AdminLayout'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = React.lazy(() => import('./pages/admin/Products'));
const ProductForm = React.lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = React.lazy(() => import('./pages/admin/Categories'));
const AdminUsers = React.lazy(() => import('./pages/admin/Users'));
const AdminOrders = React.lazy(() => import('./pages/admin/Orders'));
const NigeriaAnalytics = React.lazy(() => import('./pages/admin/NigeriaAnalytics'));
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const AdminSubscriptions = React.lazy(() => import('./pages/admin/Subscriptions'));
const SubscriptionForm = React.lazy(() => import('./pages/admin/SubscriptionForm'));
const CorporateClients = React.lazy(() => import('./pages/admin/CorporateClients'));
const DiasporaGifting = React.lazy(() => import('./pages/admin/DiasporaGifting'));
const SocialLeads = React.lazy(() => import('./pages/admin/SocialLeads'));

// User dashboard pages
const DashboardLayout = React.lazy(() => import('./components/layout/DashboardLayout'));
const UserDashboard = React.lazy(() => import('./pages/dashboard/UserDashboard'));
const Orders = React.lazy(() => import('./pages/dashboard/Orders'));
const Feedback = React.lazy(() => import('./pages/dashboard/Feedback'));
const Messages = React.lazy(() => import('./pages/dashboard/Messages'));
const History = React.lazy(() => import('./pages/dashboard/History'));
const Payment = React.lazy(() => import('./pages/dashboard/Payment'));
const Customization = React.lazy(() => import('./pages/dashboard/Customization'));

// Checkout and Order pages
const Checkout = React.lazy(() => import('./pages/Checkout'));
const OrderConfirmation = React.lazy(() => import('./pages/OrderConfirmation'));

// New Revenue Features
const Subscriptions = React.lazy(() => import('./pages/Subscriptions'));
const CorporateRegister = React.lazy(() => import('./pages/CorporateRegister'));
const DiasporaGiftingStore = React.lazy(() => import('./pages/DiasporaGifting'));
const DiasporaCheckout = React.lazy(() => import('./pages/DiasporaCheckout'));

// Loading component
const Loading = () => (
  <LoadingContainer>
    <div className="spinner"></div>
  </LoadingContainer>
);

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={
          <React.Suspense fallback={<Loading />}>
            <Home />
          </React.Suspense>
        } />
        <Route path="products" element={
          <React.Suspense fallback={<Loading />}>
            <Products />
          </React.Suspense>
        } />
        <Route path="products/:id" element={
          <React.Suspense fallback={<Loading />}>
            <ProductDetail />
          </React.Suspense>
        } />
        <Route path="cart" element={
          <React.Suspense fallback={<Loading />}>
            <Cart />
          </React.Suspense>
        } />
        <Route path="wishlist" element={
          <React.Suspense fallback={<Loading />}>
            <Wishlist />
          </React.Suspense>
        } />
        <Route path="checkout" element={
          <ProtectedRoute>
            <React.Suspense fallback={<Loading />}>
              <Checkout />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="order-confirmation/:orderId" element={
          <ProtectedRoute>
            <React.Suspense fallback={<Loading />}>
              <OrderConfirmation />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="services" element={
          <React.Suspense fallback={<Loading />}>
            <Services />
          </React.Suspense>
        } />
        <Route path="about" element={
          <React.Suspense fallback={<Loading />}>
            <About />
          </React.Suspense>
        } />
        <Route path="contact" element={
          <React.Suspense fallback={<Loading />}>
            <Contact />
          </React.Suspense>
        } />
        
        {/* Auth routes */}
        <Route 
          path="login" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <React.Suspense fallback={<Loading />}>
              <Login />
            </React.Suspense>
          } 
        />
        <Route 
          path="register" 
          element={
            isAuthenticated ? 
            <Navigate to="/" replace /> : 
            <React.Suspense fallback={<Loading />}>
              <Register />
            </React.Suspense>
          } 
        />
        
        {/* Temporarily remove ForgotPassword and ResetPassword routes until components are available */}
        
        {/* Protected routes */}
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        {/* New Revenue Features */}
        <Route path="subscriptions" element={
          <React.Suspense fallback={<Loading />}>
            <Subscriptions />
          </React.Suspense>
        } />
        <Route path="corporate-register" element={
          <React.Suspense fallback={<Loading />}>
            <CorporateRegister />
          </React.Suspense>
        } />
        <Route path="diaspora-gifting" element={
          <React.Suspense fallback={<Loading />}>
            <DiasporaGiftingStore />
          </React.Suspense>
        } />
        <Route path="diaspora-checkout" element={
          <React.Suspense fallback={<Loading />}>
            <DiasporaCheckout />
          </React.Suspense>
        } />
        
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
        <Route path="analytics/nigeria" element={
          <React.Suspense fallback={<Loading />}>
            <NigeriaAnalytics />
          </React.Suspense>
        } />
        <Route path="settings" element={
          <React.Suspense fallback={<Loading />}>
            <AdminSettings />
          </React.Suspense>
        } />
        <Route path="subscriptions" element={
          <React.Suspense fallback={<Loading />}>
            <AdminSubscriptions />
          </React.Suspense>
        } />
        <Route path="subscriptions/new" element={
          <React.Suspense fallback={<Loading />}>
            <SubscriptionForm />
          </React.Suspense>
        } />
        <Route path="subscriptions/edit/:id" element={
          <React.Suspense fallback={<Loading />}>
            <SubscriptionForm />
          </React.Suspense>
        } />
        <Route path="corporate-clients" element={
          <React.Suspense fallback={<Loading />}>
            <CorporateClients />
          </React.Suspense>
        } />
        <Route path="diaspora-gifting" element={
          <React.Suspense fallback={<Loading />}>
            <DiasporaGifting />
          </React.Suspense>
        } />
        <Route path="social-leads" element={
          <React.Suspense fallback={<Loading />}>
            <SocialLeads />
          </React.Suspense>
        } />
      </Route>

      {/* User Dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <React.Suspense fallback={<Loading />}>
            <DashboardLayout />
          </React.Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<React.Suspense fallback={<Loading />}><UserDashboard /></React.Suspense>} />
        <Route path="orders" element={<React.Suspense fallback={<Loading />}><Orders /></React.Suspense>} />
        <Route path="feedback" element={<React.Suspense fallback={<Loading />}><Feedback /></React.Suspense>} />
        <Route path="messages" element={<React.Suspense fallback={<Loading />}><Messages /></React.Suspense>} />
        <Route path="history" element={<React.Suspense fallback={<Loading />}><History /></React.Suspense>} />
        <Route path="payment" element={<React.Suspense fallback={<Loading />}><Payment /></React.Suspense>} />
        <Route path="customization" element={<React.Suspense fallback={<Loading />}><Customization /></React.Suspense>} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <ToastProvider />
          <React.Suspense fallback={<Loading />}>
            <AppContent />
          </React.Suspense>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background.default};

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid ${({ theme }) => theme.colors.primary}20;
    border-radius: 50%;
    border-top-color: ${({ theme }) => theme.colors.primary};
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default App;
