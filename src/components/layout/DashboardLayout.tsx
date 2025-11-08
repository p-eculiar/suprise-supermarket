import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';

const DashboardLayout: React.FC = () => {
  return (
    <DashboardWrapper>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </DashboardWrapper>
  );
};

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  background-color: #F8F9FA; // A light background for the content area
`;

export default DashboardLayout;
