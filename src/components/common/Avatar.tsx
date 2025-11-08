import React, { useState } from 'react';
import styled from 'styled-components';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: '32px',
  md: '40px',
  lg: '56px',
  xl: '80px',
};

const fontSizeMap = {
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
  xl: '1.75rem',
};

const AvatarWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const AvatarContainer = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' }>`
  width: ${({ $size }) => sizeMap[$size]};
  height: ${({ $size }) => sizeMap[$size]};
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary.light};
  flex-shrink: 0;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const AvatarInitials = styled.div<{ $size: 'sm' | 'md' | 'lg' | 'xl' }>`
  color: ${({ theme }) => theme.colors.primary.contrastText};
  font-size: ${({ $size }) => fontSizeMap[$size]};
  font-weight: 600;
  user-select: none;
`;

const AvatarName = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 100;
  margin-top: 4px;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px;
    border-style: solid;
    border-color: transparent transparent rgba(0, 0, 0, 0.8) transparent;
  }
`;

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', alt, onClick }) => {
  const [showName, setShowName] = useState(false);
  
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AvatarWrapper>
      <AvatarContainer 
        $size={size} 
        onClick={onClick} 
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        onMouseEnter={() => setShowName(true)}
        onMouseLeave={() => setShowName(false)}
        onTouchStart={() => setShowName(true)}
        onTouchEnd={() => setShowName(false)}
      >
        {src ? (
          <AvatarImage src={src} alt={alt || name || 'Avatar'} />
        ) : (
          <AvatarInitials $size={size}>{getInitials(name)}</AvatarInitials>
        )}
      </AvatarContainer>
      {name && showName && (
        <AvatarName>{name}</AvatarName>
      )}
    </AvatarWrapper>
  );
};