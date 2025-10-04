import React from 'react';
import styled, { css } from 'styled-components';

type CardVariant = 'elevated' | 'outlined' | 'filled' | 'glass';

export interface CardProps {
  variant?: CardVariant;
  hoverEffect?: 'elevate' | 'scale' | 'none';
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  hoverEffect = 'elevate',
  children,
  className,
  onClick,
}) => {
  return (
    <CardContainer
      $variant={variant}
      $hoverEffect={hoverEffect}
      className={className}
      onClick={onClick}
      $clickable={!!onClick}
    >
      {children}
    </CardContainer>
  );
};

const CardContainer = styled.div<{
  $variant: CardVariant;
  $hoverEffect: 'elevate' | 'scale' | 'none';
  $clickable: boolean;
}>`
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  /* Variant styles */
  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'elevated':
        return css`
          background-color: ${theme.colors.background.paper};
          box-shadow: ${theme.shadows[1]};
        `;
      
      case 'outlined':
        return css`
          background-color: ${theme.colors.background.paper};
          border: 1px solid ${theme.colors.common.gray[200]};
        `;
      
      case 'filled':
        return css`
          background-color: ${theme.colors.common.gray[50]};
        `;
      
      case 'glass':
        return css`
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        `;
      
      default:
        return '';
    }
  }}

  /* Hover effects */
  ${({ theme, $hoverEffect, $clickable }) => {
    if (!$clickable) return '';
    
    switch ($hoverEffect) {
      case 'elevate':
        return css`
          &:hover {
            transform: translateY(-4px);
            box-shadow: ${theme.shadows[4]};
          }
        `;
      
      case 'scale':
        return css`
          &:hover {
            transform: scale(1.02);
            box-shadow: ${theme.shadows[3]};
          }
        `;
      
      case 'none':
      default:
        return '';
    }
  }}

  /* Cursor pointer for clickable cards */
  ${({ $clickable }) =>
    $clickable &&
    css`
      cursor: pointer;
    `}
`;

// Card Header Component
export const CardHeader = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.colors.common.gray[100]};
`;

// Card Content Component
export const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  flex: 1;
`;

// Card Footer Component
export const CardFooter = styled.div`
  padding: ${({ theme }) => theme.spacing(2, 3)};
  border-top: 1px solid ${({ theme }) => theme.colors.common.gray[100]};
  background-color: ${({ theme }) => theme.colors.common.gray[50]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Card Media Component
export const CardMedia = styled.div<{ $height?: string; $width?: string }>`
  position: relative;
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '200px'};
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${CardContainer}:hover & img {
    transform: scale(1.05);
  }
`;

// Card Title Component
export const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.secondary.main};
  margin: 0 0 ${({ theme }) => theme.spacing(1)} 0;
`;

// Card Subtitle Component
export const CardSubtitle = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.common.gray[600]};
  margin: 0;
`;

// Card Actions Component
export const CardActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  justify-content: flex-end;
`;
