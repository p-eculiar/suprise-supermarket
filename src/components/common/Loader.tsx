import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div<{ size?: number; color?: string }>`
  display: inline-block;
  width: ${({ size }) => size || 24}px;
  height: ${({ size }) => size || 24}px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: ${({ theme, color }) => color || theme.colors?.primary?.main || '#007bff'};
  animation: ${spin} 1s ease-in-out infinite;
`;

interface LoaderProps {
  size?: number;
  color?: string;
  className?: string;
  fullPage?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ size, color, className, fullPage }) => {
  if (fullPage) {
    return (
      <FullPageWrapper>
        <LoaderWrapper size={size || 48} color={color} className={className} />
      </FullPageWrapper>
    );
  }
  return <LoaderWrapper size={size} color={color} className={className} />;
};

const FullPageWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
`;

export default Loader;
