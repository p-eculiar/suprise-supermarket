import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiHome,
  FiShoppingBag,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiGrid,
  FiInfo,
  FiPhone,
  FiGift,
  FiCreditCard,
  FiLogOut,
  FiLogIn,
  FiUserPlus,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
    navigate('/');
  };

  const mainMenuItems = [
    { icon: <FiHome />, label: 'Home', path: '/' },
    { icon: <FiShoppingBag />, label: 'Products', path: '/products' },
    { icon: <FiGrid />, label: 'Categories', path: '/products', hasSubmenu: true },
    { icon: <FiInfo />, label: 'About', path: '/about' },
    { icon: <FiPhone />, label: 'Contact', path: '/contact' },
  ];

  const categoryItems = [
    { label: 'Vegetables', path: '/products?category=vegetables' },
    { label: 'Fruits', path: '/products?category=fruits' },
    { label: 'Dairy & Eggs', path: '/products?category=dairy' },
    { label: 'Meat & Fish', path: '/products?category=meat' },
    { label: 'Bakery', path: '/products?category=bakery' },
    { label: 'Beverages', path: '/products?category=beverages' },
  ];

  const serviceItems = [
    { icon: <FiCreditCard />, label: 'Subscriptions', path: '/subscriptions' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Overlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <MenuContainer
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            {/* Header */}
            <MenuHeader>
              <Logo onClick={() => handleNavigation('/')}>
                <FiShoppingBag />
                <LogoText>
                  <span>Surprise</span>
                  <small>Supermarket</small>
                </LogoText>
              </Logo>
              <CloseButton onClick={onClose}>
                <FiX />
              </CloseButton>
            </MenuHeader>

            {/* User Section */}
            {user ? (
              <UserSection>
                <UserAvatar>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name || 'User'} />
                  ) : (
                    <FiUser />
                  )}
                </UserAvatar>
                <UserInfo>
                  <UserName>{user.full_name || 'User'}</UserName>
                  <UserEmail>{user.email}</UserEmail>
                </UserInfo>
              </UserSection>
            ) : (
              <GuestSection>
                <GuestButton onClick={() => handleNavigation('/login')}>
                  <FiLogIn /> Sign In
                </GuestButton>
                <GuestButton onClick={() => handleNavigation('/register')} $primary>
                  <FiUserPlus /> Sign Up
                </GuestButton>
              </GuestSection>
            )}

            {/* Quick Actions */}
            <QuickActions>
              <QuickAction onClick={() => handleNavigation('/cart')}>
                <ActionIcon>
                  <FiShoppingCart />
                  {cartItems.length > 0 && <Badge>{cartItems.length}</Badge>}
                </ActionIcon>
                <ActionLabel>Cart</ActionLabel>
              </QuickAction>
              <QuickAction onClick={() => handleNavigation('/wishlist')}>
                <ActionIcon>
                  <FiHeart />
                  {wishlistItems.length > 0 && <Badge>{wishlistItems.length}</Badge>}
                </ActionIcon>
                <ActionLabel>Wishlist</ActionLabel>
              </QuickAction>
              {user && (
                <QuickAction onClick={() => handleNavigation('/dashboard')}>
                  <ActionIcon>
                    <FiUser />
                  </ActionIcon>
                  <ActionLabel>Dashboard</ActionLabel>
                </QuickAction>
              )}
            </QuickActions>

            {/* Main Menu */}
            <MenuContent>
              <MenuSection>
                <SectionTitle>Menu</SectionTitle>
                <MenuList>
                  {mainMenuItems.map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={() => {
                        if (item.hasSubmenu) {
                          setActiveSection(activeSection === 'categories' ? null : 'categories');
                        } else {
                          handleNavigation(item.path);
                        }
                      }}
                    >
                      <MenuItemIcon>{item.icon}</MenuItemIcon>
                      <MenuItemLabel>{item.label}</MenuItemLabel>
                      {item.hasSubmenu && (
                        <MenuItemArrow $open={activeSection === 'categories'}>
                          ›
                        </MenuItemArrow>
                      )}
                    </MenuItem>
                  ))}

                  {/* Submenu for Categories */}
                  <AnimatePresence>
                    {activeSection === 'categories' && (
                      <Submenu
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {categoryItems.map((cat) => (
                          <SubmenuItem
                            key={cat.label}
                            onClick={() => handleNavigation(cat.path)}
                          >
                            {cat.label}
                          </SubmenuItem>
                        ))}
                      </Submenu>
                    )}
                  </AnimatePresence>
                </MenuList>
              </MenuSection>

              <MenuSection>
                <SectionTitle>Services</SectionTitle>
                <MenuList>
                  {serviceItems.map((item) => (
                    <MenuItem key={item.label} onClick={() => handleNavigation(item.path)}>
                      <MenuItemIcon>{item.icon}</MenuItemIcon>
                      <MenuItemLabel>{item.label}</MenuItemLabel>
                    </MenuItem>
                  ))}
                </MenuList>
              </MenuSection>

              {user && (
                <MenuSection>
                  <MenuItem onClick={handleLogout}>
                    <MenuItemIcon>
                      <FiLogOut />
                    </MenuItemIcon>
                    <MenuItemLabel>Sign Out</MenuItemLabel>
                  </MenuItem>
                </MenuSection>
              )}
            </MenuContent>

            {/* Footer */}
            <MenuFooter>
              <FooterText>© 2024 Surprise Supermarket</FooterText>
              <FooterText>Fresh products, delivered fast</FooterText>
            </MenuFooter>
          </MenuContainer>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;

// Styled Components
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const MenuContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 320px;
  max-width: 85vw;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
`;

const MenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #F8F9FA;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;

  svg {
    font-size: 2rem;
    color: #6C9A7F;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;

  span {
    font-size: 1.25rem;
    font-weight: 700;
    color: #2D3436;
    line-height: 1;
  }

  small {
    font-size: 0.75rem;
    color: #636E72;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  svg {
    font-size: 1.5rem;
    color: #2D3436;
  }

  &:hover {
    background: #DFE6E9;
  }
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  color: white;
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    font-size: 1.5rem;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  opacity: 0.9;
`;

const GuestSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  padding: 1.5rem;
  background: #F8F9FA;
`;

const GuestButton = styled.button<{ $primary?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border: 2px solid ${({ $primary }) => ($primary ? '#6C9A7F' : '#DFE6E9')};
  background: ${({ $primary }) => ($primary ? '#6C9A7F' : 'white')};
  color: ${({ $primary }) => ($primary ? 'white' : '#2D3436')};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 1rem;
  border-bottom: 1px solid #F8F9FA;
`;

const QuickAction = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #F8F9FA;
    border-radius: 8px;
  }
`;

const ActionIcon = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  background: #F0F7F5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;

  svg {
    font-size: 1.25rem;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background: #E74C3C;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const ActionLabel = styled.div`
  font-size: 0.8125rem;
  color: #636E72;
  font-weight: 500;
`;

const MenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
`;

const MenuSection = styled.div`
  padding: 1rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid #F8F9FA;
  }
`;

const SectionTitle = styled.div`
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #636E72;
`;

const MenuList = styled.div`
  display: flex;
  flex-direction: column;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: #F8F9FA;
  }
`;

const MenuItemIcon = styled.div`
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;

  svg {
    font-size: 1.25rem;
  }
`;

const MenuItemLabel = styled.div`
  flex: 1;
  color: #2D3436;
  font-weight: 500;
`;

const MenuItemArrow = styled.div<{ $open: boolean }>`
  color: #636E72;
  font-size: 1.5rem;
  transform: ${({ $open }) => ($open ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
`;

const Submenu = styled(motion.div)`
  overflow: hidden;
  background: #F8F9FA;
`;

const SubmenuItem = styled.button`
  display: block;
  width: 100%;
  padding: 0.75rem 1.5rem 0.75rem 4rem;
  background: none;
  border: none;
  color: #636E72;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #6C9A7F;
    background: #F0F7F5;
  }
`;

const MenuFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #F8F9FA;
  text-align: center;
`;

const FooterText = styled.div`
  font-size: 0.8125rem;
  color: #636E72;
  margin-bottom: 0.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;
