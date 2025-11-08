import React, { memo } from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Header } from './Header';
import TopHeader from './TopHeader';
import { Footer } from './Footer';
import { clearCachesForFrontpage } from '../../utils/navigationHelpers';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = memo(({ children }) => {
  // Clear caches when entering frontpage layout
  React.useEffect(() => {
    clearCachesForFrontpage();
  }, []);

  return (
    <LayoutContainer>
      <TopHeader />
      <Header />
      <MainContent>
        {children || <Outlet />}
      </MainContent>
      <Footer />
    </LayoutContainer>
  );
});

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  
  // Performance optimization: hardware acceleration
  transform: translateZ(0);
  will-change: transform;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  overflow-x: hidden;
  
  // Performance optimization: hardware acceleration
  transform: translateZ(0);
  will-change: transform;
`;