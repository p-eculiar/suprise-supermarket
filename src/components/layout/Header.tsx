import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Avatar } from '../common/Avatar';
import NotificationBell from '../common/NotificationBell';
import WishlistIcon from '../common/WishlistIcon';
import styled, { css, keyframes } from 'styled-components';
import { FiX, FiShoppingCart } from 'react-icons/fi';
import { clearCachesForFrontpage, clearCachesForDashboard } from '../../utils/navigationHelpers';
import { supabase } from '../../lib/supabase';
import TopHeader from './TopHeader';

// Define the NavigationItem interface
interface NavigationItem {
  id: string;
  name: string;
  href: string;
  order: number;
  is_active: boolean;
}

// Default navigation items as fallback
const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  { id: '1', name: 'Home', href: '/', order: 1, is_active: true },
  { id: '3', name: 'About Us', href: '/about', order: 3, is_active: true },
  { id: '4', name: 'Shop', href: '/products', order: 4, is_active: true },
  { id: '5', name: 'Blog', href: '/blog', order: 5, is_active: true },
  { id: '7', name: 'Contact', href: '/contact', order: 7, is_active: true },
];

// Styled Components
const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #2a5040 0%, #3d7a60 100%);
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  padding: 0.5rem 1rem;
  
  @media (min-width: 768px) {
    padding: 0.6rem 1.5rem;
  }
  
  @media (min-width: 1024px) {
    padding: 0.7rem 2rem;
  }
`;

const HeaderInner = styled.div`
  max-width: 1360px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  
  img {
    height: 50px;
    width: auto;
    object-fit: contain;
    
    @media (min-width: 768px) {
      height: 60px;
    }
    
    @media (min-width: 1024px) {
      height: 70px;
    }
  }
`;

const DesktopNav = styled.div`
  display: none;
  gap: ${({ theme }) => theme.spacing(4)};
  align-items: center;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    color: white;
    font-weight: 600;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const CartContainer = styled.div`
  position: relative;
`;

const CartButton = styled.button`
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-2px);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const pulse = keyframes`
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CartBadge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #E74C3C;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid #2a5040;
  animation: ${css`${pulse}`} 0.3s ease;
`;

const CartDropdown = styled.div`
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  animation: ${css`${slideDown}`} 0.2s ease;

  @media (max-width: 768px) {
    width: 320px;
  }
`;

const CartDropdownHeader = styled.div`
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
  display: flex;
  align-items: center;
  transition: color 0.2s;

  &:hover {
    color: #333;
  }
`;

const CartItemsList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const CartDropdownItem = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const CartItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

const CartItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CartItemName = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CartItemPrice = styled.p`
  margin: 0;
  font-size: 0.875rem;
  color: #6C9A7F;
  font-weight: 600;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: #E74C3C;
  }
`;

const EmptyCart = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #999;

  svg {
    margin-bottom: 1rem;
    color: #ddd;
  }

  p {
    margin: 0;
    font-size: 0.95rem;
  }
`;

const CartDropdownFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid #eee;
  background: #f8f9fa;
`;

const ViewCartButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
`;

const SignUpButton = styled.button`
  background: transparent;
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: white;
  }

  @media (min-width: 768px) {
    display: block;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    stroke: white;
  }

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ( $isOpen ? 'flex' : 'none' )};
  flex-direction: column;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #1e3a2e 0%, #2d5f4a 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: ${({ theme }) => theme.zIndex.drawer};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px solid ${({ theme }) => theme.colors.common.gray[100]};
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    padding-left: ${({ theme }) => theme.spacing(2)};
  }
`;

const ProfileSection = styled.div`
  position: relative;
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
  width: 200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: ${({ theme }) => theme.zIndex.tooltip};
`;

const DropdownLink = styled(Link)`
  padding: 0.75rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.common.gray[100]};
  }
`;

const DropdownButton = styled.button`
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  color: ${({ theme }) => theme.colors.status.error};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.common.gray[100]};
  }
`;

export const Header: React.FC = () => {
  const { settings } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(DEFAULT_NAVIGATION_ITEMS);
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { cartItems, getCartItemsCount, removeFromCart } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();

  // Fetch navigation items from database
  useEffect(() => {
    const fetchNavigationItems = async () => {
      try {
        const { data, error } = await supabase
          .from('navigation_items')
          .select('*')
          .eq('is_active', true)
          .order('order', { ascending: true });

        if (error) {
          console.error('Error fetching navigation items:', error);
          // Use default navigation items as fallback
          setNavigationItems(DEFAULT_NAVIGATION_ITEMS);
        } else if (data && data.length > 0) {
          // Use navigation items from database
          setNavigationItems(data);
        } else {
          // No items found, use default navigation items
          setNavigationItems(DEFAULT_NAVIGATION_ITEMS);
        }
      } catch (error) {
        console.error('Error fetching navigation items:', error);
        // Use default navigation items as fallback
        setNavigationItems(DEFAULT_NAVIGATION_ITEMS);
      }
    };

    fetchNavigationItems();
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Determine which dashboard to navigate to based on user role
  const getDashboardPath = () => {
    // Wait for user data to be fully loaded including role
    if (!user) {
      console.log('⚠️ No user data available for dashboard path');
      return '/dashboard';
    }
    
    console.log('🔍 Determining dashboard path for user:', user.email);
    console.log('🔍 User role:', user.role);
    
    // Check if user has admin role
    if (user.role === 'admin') {
      console.log('✅ Redirecting to admin dashboard');
      return '/admin';
    }
    
    // Fallback to user dashboard
    console.log('ℹ️ Redirecting to user dashboard');
    return '/dashboard';
  };

  // Handle dashboard navigation with proper role check
  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setProfileMenuOpen(false);
    
    // If still loading, wait a bit
    if (isLoading) {
      console.log('⏳ Auth still loading, waiting...');
      setTimeout(() => {
        navigate(getDashboardPath());
        clearCachesForDashboard();
      }, 500);
    } else {
      navigate(getDashboardPath());
      clearCachesForDashboard();
    }
  };

  // Remove the useEffect that was attempting to redirect on email verification
  // This is now properly handled by the EmailVerification component

  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo onClick={() => { clearCachesForFrontpage(); navigate('/'); }}>
          <img src="/main-logo.png" alt={settings.siteName} />
        </Logo>

        {/* Desktop Navigation */}
        <DesktopNav>
          {navigationItems.map((item) => (
            <NavLink key={item.id} to={item.href} onClick={clearCachesForFrontpage}>
              {item.name}
            </NavLink>
          ))}
          <NavLink to="/services">Services</NavLink>
        </DesktopNav>

        <RightSection>
          {isAuthenticated && user && <NotificationBell />}
          {isAuthenticated && user && <WishlistIcon />}
          <CartContainer>
            <CartButton onClick={() => setCartDropdownOpen(!cartDropdownOpen)}>
              <FiShoppingCart size={20} />
              {getCartItemsCount() > 0 && (
                <CartBadge>{getCartItemsCount()}</CartBadge>
              )}
            </CartButton>
            {cartDropdownOpen && (
              <CartDropdown>
                <CartDropdownHeader>
                  <h3>Shopping Cart ({getCartItemsCount()} items)</h3>
                  <CloseButton onClick={() => setCartDropdownOpen(false)}>
                    <FiX />
                  </CloseButton>
                </CartDropdownHeader>
                {cartItems.length === 0 ? (
                  <EmptyCart>
                    <FiShoppingCart size={48} />
                    <p>Your cart is empty</p>
                  </EmptyCart>
                ) : (
                  <>
                    <CartItemsList>
                      {cartItems.map((item) => (
                        <CartDropdownItem key={item.id}>
                          <CartItemImage src={item.imageUrl} alt={item.name} />
                          <CartItemInfo>
                            <CartItemName>{item.name}</CartItemName>
                            <CartItemPrice>₦{item.price.toLocaleString()} × {item.quantity}</CartItemPrice>
                          </CartItemInfo>
                          <RemoveButton onClick={() => removeFromCart(item.id)}>
                            <FiX size={16} />
                          </RemoveButton>
                        </CartDropdownItem>
                      ))}
                    </CartItemsList>
                    <CartDropdownFooter>
                      <ViewCartButton onClick={() => { setCartDropdownOpen(false); navigate('/cart'); }}>
                        View Cart
                      </ViewCartButton>
                    </CartDropdownFooter>
                  </>
                )}
              </CartDropdown>
            )}
          </CartContainer>
          {isAuthenticated && user ? (
            <ProfileSection>
              <Avatar 
                src={user.avatar_url} 
                name={user.full_name || user.email} 
                size="md" 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
              />
              {profileMenuOpen && (
                <ProfileDropdown>
                  <DropdownLink 
                    to="#" 
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </DropdownLink>
                  <DropdownButton onClick={logout}>
                    Logout
                  </DropdownButton>
                </ProfileDropdown>
              )}
            </ProfileSection>
          ) : (
            <SignUpButton onClick={() => navigate('/register')}>
              Sign Up
            </SignUpButton>
          )}
          <MobileMenuButton onClick={toggleMobileMenu}>
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </MobileMenuButton>
        </RightSection>
      </HeaderInner>

      {/* Mobile Navigation */}
      <MobileMenu $isOpen={mobileMenuOpen}>
        {navigationItems.map((item) => (
          <MobileNavLink
            key={item.id}
            to={item.href}
            onClick={() => { clearCachesForFrontpage(); setMobileMenuOpen(false); }}
          >
            {item.name}
          </MobileNavLink>
        ))}
        <MobileNavLink
          to="/services"
          onClick={() => { clearCachesForFrontpage(); setMobileMenuOpen(false); }}
        >
          Services
        </MobileNavLink>
      </MobileMenu>
    </HeaderContainer>
  );
};
