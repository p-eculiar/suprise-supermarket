import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiGrid, FiPackage, FiMessageSquare, FiClock, FiCreditCard, FiSettings, FiHelpCircle, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const sidebarNavItems = [
  { name: 'Dashboard', to: '/dashboard', icon: <FiGrid /> },
  { name: 'Food Order', to: '/dashboard/orders', icon: <FiPackage /> },
  { name: 'Feedback', to: '/dashboard/feedback', icon: <FiHelpCircle /> },
  { name: 'Message', to: '/dashboard/messages', icon: <FiMessageSquare /> },
  { name: 'Order History', to: '/dashboard/history', icon: <FiClock /> },
  { name: 'Payment Details', to: '/dashboard/payment', icon: <FiCreditCard /> },
  { name: 'Customization', to: '/dashboard/customization', icon: <FiSettings /> },
];

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <SidebarContainer>
      <LogoSection>
        <LogoImage>
          <FiShoppingBag />
        </LogoImage>
        <LogoText>
          <BrandName>Surprise</BrandName>
          <BrandSubtext>Supermarket</BrandSubtext>
        </LogoText>
      </LogoSection>
      
      <UserInfo>
        <UserAvatar>
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt={user.full_name || 'User'} />
          ) : (
            <AvatarPlaceholder>
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarPlaceholder>
          )}
        </UserAvatar>
        <UserDetails>
          <UserName>{user?.full_name || 'User'}</UserName>
          <UserEmail>{user?.email}</UserEmail>
        </UserDetails>
      </UserInfo>
      
      <Nav>
        {sidebarNavItems.map((item) => (
          <NavItem key={item.name}>
            <StyledNavLink to={item.to}>
              {item.icon}
              <span>{item.name}</span>
            </StyledNavLink>
          </NavItem>
        ))}
      </Nav>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside`
  width: 280px;
  background: linear-gradient(180deg, #6C9A7F 0%, #5A8470 100%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.5rem 2rem 1.5rem;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
`;

const LogoImage = styled.div`
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  svg {
    font-size: 1.8rem;
    color: white;
  }
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const BrandName = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.5px;
`;

const BrandSubtext = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.5px;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  margin: 0 1rem 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  z-index: 1;
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

const NavItem = styled.div``;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  svg {
    font-size: 1.25rem;
    transition: transform 0.3s ease;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: white;
    transform: scaleY(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    transform: translateX(4px);
    
    svg {
      transform: scale(1.1);
    }
  }

  &.active {
    background: rgba(255, 255, 255, 0.25);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    
    &::before {
      transform: scaleY(1);
    }
    
    svg {
      transform: scale(1.15);
    }
  }
`;

export default Sidebar;
