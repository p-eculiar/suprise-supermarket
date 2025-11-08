import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { FiLoader } from 'react-icons/fi';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message = 'Loading products...' }) => {
  if (!isLoading) return null;

  return (
    <Overlay>
      <SpinnerContainer>
        <SpinnerIcon>
          <FiLoader />
        </SpinnerIcon>
        <LoadingText>{message}</LoadingText>
      </SpinnerContainer>
    </Overlay>
  );
};

export default LoadingOverlay;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const SpinnerIcon = styled.div`
  font-size: 3rem;
  color: #6C9A7F;
  animation: ${css`${spin} 1s linear infinite`};
`;

const LoadingText = styled.div`
  font-size: 1.25rem;
  color: #2D3436;
  font-weight: 500;
`;