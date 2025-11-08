import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import { clearCachesForDashboard } from '../../utils/navigationHelpers';
import { FiMenu, FiX } from 'react-icons/fi';

const DashboardLayout: React.FC = () => {
  // Clear caches when entering user dashboard
  useEffect(() => {
    clearCachesForDashboard();
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile by default, keep it open on larger screens
  useEffect(() => {
    const handleResize = () => {
      // Always show sidebar on larger screens (>= 1024px)
      // Only hide it on mobile (< 1024px) if it was manually closed
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        // On mobile, keep the current state or default to closed
        setIsSidebarOpen(window.innerWidth >= 1024 || isSidebarOpen);
      }
    };

    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <DashboardWrapper>
      <MobileMenuButton onClick={toggleSidebar}>
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </MobileMenuButton>
      
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <MainContent $isSidebarOpen={isSidebarOpen}>
        <ContentWrapper>
          <Outlet />
        </ContentWrapper>
      </MainContent>
    </DashboardWrapper>
  );
};

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #F8F9FA;
  position: relative;
  
  @media (max-width: 1023px) {
    flex-direction: column;
  }
`;

const MainContent = styled.main<{ $isSidebarOpen: boolean }>`
  flex: 1;
  padding: 0;
  background-color: #F8F9FA;
  margin-left: ${props => props.$isSidebarOpen ? '280px' : '0'};
  transition: margin-left 0.3s ease;
  height: 100vh;
  overflow-y: auto;
  
  @media (max-width: 1023px) {
    margin-left: 0;
    height: calc(100vh - 60px);
    margin-top: 60px;
  }
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const MobileMenuButton = styled.button`
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

export default DashboardLayout;