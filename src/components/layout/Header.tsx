import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { Avatar } from '../common/Avatar';
import styled from 'styled-components';
import { FiX, FiShoppingCart } from 'react-icons/fi';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Services', href: '/services' },
  { name: 'About Us', href: '/about' },
  { name: 'Categories', href: '/products' },
  { name: 'Contact', href: '/contact' },
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
  animation: pulse 0.3s ease;

  @keyframes pulse {
    0% { transform: scale(0.8); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
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
  animation: slideDown 0.2s ease;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, getCartItemsCount, removeFromCart } = useCart();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo onClick={() => navigate('/')}>
          <img src="/main-logo.png" alt="Suprise Supermarket" />
        </Logo>

        {/* Desktop Navigation */}
        <DesktopNav>
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.href}>
              {item.name}
            </NavLink>
          ))}
        </DesktopNav>

        <RightSection>
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
                  <DropdownLink to="/dashboard">Dashboard</DropdownLink>
                  <DropdownButton onClick={logout}>Logout</DropdownButton>
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
        {navigation.map((item) => (
          <MobileNavLink
            key={item.name}
            to={item.href}
            onClick={() => setMobileMenuOpen(false)}
          >
            {item.name}
          </MobileNavLink>
        ))}
      </MobileMenu>
    </HeaderContainer>
  );
};
