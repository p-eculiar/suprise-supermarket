import React from 'react';
import styled from 'styled-components';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md', alt, onClick }) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <AvatarContainer $size={size} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {src ? (
        <AvatarImage src={src} alt={alt || name || 'Avatar'} />
      ) : (
        <AvatarInitials $size={size}>{getInitials(name)}</AvatarInitials>
      )}
    </AvatarContainer>
  );
};

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
