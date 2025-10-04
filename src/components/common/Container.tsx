import React from 'react';
import styled from 'styled-components';

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({ 
  children, 
  maxWidth = 'lg',
  className 
}) => {
  return (
    <StyledContainer $maxWidth={maxWidth} className={className}>
      {children}
    </StyledContainer>
  );
};

const StyledContainer = styled.div<{ $maxWidth: string }>`
  width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
  
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
