import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiShoppingBag, 
  FiPackage, 
  FiBarChart2, 
  FiUsers, 
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    { name: 'My Orders', icon: <FiShoppingBag />, path: '/dashboard/orders' },
    { name: 'Order History', icon: <FiPackage />, path: '/dashboard/history' },
    { name: 'Payment History', icon: <FiBarChart2 />, path: '/dashboard/payment' },
    { name: 'Messages', icon: <FiUsers />, path: '/dashboard/messages' },
    { name: 'Feedback', icon: <FiSettings />, path: '/dashboard/feedback' },
    { name: 'Profile Settings', icon: <FiSettings />, path: '/dashboard/customization' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={toggleSidebar} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <Logo>
            <LogoImage src="/main-logo.png" alt="Surprise Supermarket Logo" />
          </Logo>
          {/* Removed CloseButton as it's redundant with the mobile menu button */}
        </SidebarHeader>

        <Nav>
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              isActive={location.pathname === item.path}
            >
              <StyledLink to={item.path} onClick={() => window.innerWidth < 1024 && toggleSidebar()}>
                {item.icon}
                <span>{item.name}</span>
              </StyledLink>
            </NavItem>
          ))}
        </Nav>

        <LogoutButton onClick={handleLogout}>
          <FiLogOut />
          <span>Logout</span>
        </LogoutButton>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;

// Styled Components
const SidebarContainer = styled.div<{ isOpen: boolean }>`
  width: 280px;
  background: linear-gradient(180deg, #6C9A7F 0%, #5A8470 100%);
  color: white;
  height: 100vh;
  position: fixed;
  top: 0;
  left: ${props => props.isOpen ? '0' : '-280px'};
  z-index: 1000;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1023px) {
    left: ${props => props.isOpen ? '0' : '-280px'};
  }
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  max-width: 100%;
  height: auto;
  max-height: 100px;
  width: auto;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

const NavItem = styled.div<{ isActive: boolean }>`
  background: ${props => props.isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  border-left: 4px solid ${props => props.isActive ? '#fff' : 'transparent'};
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    min-width: 24px;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: white;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  svg {
    min-width: 24px;
  }
`;