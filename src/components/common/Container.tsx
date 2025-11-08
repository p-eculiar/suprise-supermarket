import React from 'react';
import styled from 'styled-components';

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  centerContent?: boolean;
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  maxWidth = 'lg',
  centerContent = false,
  className 
}) => {
  return (
    <StyledContainer $maxWidth={maxWidth} $centerContent={centerContent} className={className}>
      {children}
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ $maxWidth: string; $centerContent: boolean }>`
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  ${({ $centerContent }) => $centerContent && `
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  `}
  
  ${({ $maxWidth }) => {
    switch ($maxWidth) {
      case 'sm':
        return 'max-width: 640px;';
      case 'md':
        return 'max-width: 768px;';
      case 'lg':
        return 'max-width: 1024px;';
      case 'xl':
        return 'max-width: 1280px;';
      case 'full':
        return 'max-width: 100%;';
      default:
        return 'max-width: 1024px;';
    }
  }}
  
  @media (min-width: 640px) {
    padding: 0 2rem;
  }
`;
