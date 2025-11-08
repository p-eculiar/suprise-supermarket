import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  FiHome, FiPackage, FiUsers, FiShoppingCart, FiSettings, 
  FiTrendingUp, FiMenu, FiX, FiLogOut, FiShoppingBag 
} from 'react-icons/fi';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout with Supabase
    navigate('/login');
  };

  return (
    <LayoutContainer>
      {/* Sidebar */}
      <Sidebar $open={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            <FiShoppingBag />
            <LogoText>Admin Panel</LogoText>
          </Logo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <FiX />
          </CloseButton>
        </SidebarHeader>

        <NavMenu>
          <NavItem to="/admin" end>
            <FiHome />
            <span>Dashboard</span>
          </NavItem>
          <NavItem to="/admin/products">
            <FiPackage />
            <span>Products</span>
          </NavItem>
          <NavItem to="/admin/orders">
            <FiShoppingCart />
            <span>Orders</span>
          </NavItem>
          <NavItem to="/admin/users">
            <FiUsers />
            <span>Users</span>
          </NavItem>
          <NavItem to="/admin/analytics/nigeria">
            <FiTrendingUp />
            <span>Nigeria Analytics</span>
          </NavItem>
          <NavItem to="/admin/settings">
            <FiSettings />
            <span>Settings</span>
          </NavItem>
        </NavMenu>

        <SidebarFooter>
          <LogoutButton onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </LogoutButton>
        </SidebarFooter>
      </Sidebar>

      {/* Main Content */}
      <MainContent $sidebarOpen={sidebarOpen}>
        <TopBar>
          <MenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu />
          </MenuButton>
          
          <TopBarRight>
            <AdminProfile>
              <AdminAvatar>A</AdminAvatar>
              <AdminInfo>
                <AdminName>Admin User</AdminName>
                <AdminRole>Super Admin</AdminRole>
              </AdminInfo>
            </AdminProfile>
          </TopBarRight>
        </TopBar>

        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>

      {/* Mobile Overlay */}
      {sidebarOpen && <Overlay onClick={() => setSidebarOpen(false)} />}
    </LayoutContainer>
  );
};

export default AdminLayout;

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #F8F9FA;
`;

const Sidebar = styled.aside<{ $open: boolean }>`
  width: 280px;
  background: white;
  border-right: 1px solid #E1E8ED;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease;
  
  @media (max-width: 1024px) {
    transform: ${props => props.$open ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  svg {
    width: 28px;
    height: 28px;
    color: #6C9A7F;
  }
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
`;

const CloseButton = styled.button`
  display: none;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #636E72;
  cursor: pointer;
  
  &:hover {
    color: #2D3436;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const NavMenu = styled.nav`
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.5rem;
  color: #636E72;
  text-decoration: none;
  transition: all 0.3s ease;
  position: relative;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  span {
    font-weight: 500;
    font-size: 0.95rem;
  }
  
  &:hover {
    background: #F8F9FA;
    color: #6C9A7F;
  }
  
  &.active {
    background: #E8F5EC;
    color: #6C9A7F;
    font-weight: 600;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #6C9A7F;
    }
  }
`;

const SidebarFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #E1E8ED;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: #E74C3C15;
  color: #E74C3C;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E74C3C;
    color: white;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  
  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const TopBar = styled.div`
  height: 70px;
  background: white;
  border-bottom: 1px solid #E1E8ED;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 50;
`;

const MenuButton = styled.button`
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  background: #F8F9FA;
  border: none;
  border-radius: 8px;
  color: #2D3436;
  cursor: pointer;
  
  &:hover {
    background: #E1E8ED;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 1024px) {
    display: flex;
  }
`;

const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const AdminProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const AdminAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #6C9A7F;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const AdminInfo = styled.div`
  @media (max-width: 640px) {
    display: none;
  }
`;

const AdminName = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: #2D3436;
`;

const AdminRole = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const ContentArea = styled.div`
  min-height: calc(100vh - 70px);
`;

const Overlay = styled.div`
  display: none;
  
  @media (max-width: 1024px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
`;
