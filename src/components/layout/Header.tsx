import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { MenuIcon, XIcon, ShoppingCartIcon } from '@heroicons/react/outline';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <HeaderContainer>
      <div className="container">
        <Navbar>
          <Logo onClick={() => navigate('/')}>
            <span>Suprise</span>Supermarket
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
            <CartButton onClick={() => navigate('/cart')}>
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="cart-count">0</span>
            </CartButton>
            <MobileMenuButton onClick={toggleMobileMenu}>
              {mobileMenuOpen ? (
                <XIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </MobileMenuButton>
          </RightSection>
        </Navbar>

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
      </div>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background-color: ${({ theme }) => theme.colors.background.paper};
  box-shadow: ${({ theme }) => theme.shadows[2]};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  padding: ${({ theme }) => theme.spacing(2)} 0;
`;

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing(3)};
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  span {
    color: ${({ theme }) => theme.colors.secondary.main};
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
  color: ${({ theme }) => theme.colors.common.gray[700]};
  font-weight: 500;
  text-decoration: none;
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    background-color: ${({ theme }) => theme.colors.primary.light}20;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary.main};
    font-weight: 600;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const CartButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.common.gray[700]};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.common.gray[100]};
    color: ${({ theme }) => theme.colors.primary.main};
  }

  .cart-count {
    position: absolute;
    top: -5px;
    right: -5px;
    background-color: ${({ theme }) => theme.colors.primary.main};
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

const MobileMenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.common.gray[700]};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;

  &:hover {
    background-color: ${({ theme }) => theme.colors.common.gray[100]};
  }

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => ( $isOpen ? 'flex' : 'none' )};
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-top: 1px solid ${({ theme }) => theme.colors.common.gray[200]};
  position: absolute;
  left: 0;
  right: 0;
  z-index: ${({ theme }) => theme.zIndex.drawer};
  box-shadow: ${({ theme }) => theme.shadows[2]};

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavLink = styled(Link)`
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(1)}`};
  color: ${({ theme }) => theme.colors.common.gray[700]};
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
