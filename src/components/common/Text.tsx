import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
type TextColor = 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'textPrimary' | 'textSecondary' | 'textTertiary' | string;
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface TextProps {
  children: ReactNode;
  as?: TextVariant;
  color?: TextColor;
  size?: TextSize;
  weight?: TextWeight;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  mb?: number | string;
  mt?: number | string;
  ml?: number | string;
  mr?: number | string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const StyledText = styled.span<Omit<TextProps, 'children' | 'as'>>`
  margin: 0;
  padding: 0;
  line-height: 1.5;
  color: ${({ color = 'textPrimary', theme }) => {
    if (color.startsWith('#')) return color;
    if (color.startsWith('--')) return `var(${color})`;
    return `var(--text-${color}, var(--color-${color}, ${color}))`;
  }};
  
  font-size: ${({ size = 'base', theme }) => {
    const sizes = {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem'  // 36px
    };
    return sizes[size as keyof typeof sizes] || size;
  }};
  
  font-weight: ${({ weight = 'normal' }) => {
    const weights = {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    };
    return weights[weight as keyof typeof weights] || weight;
  }};
  
  text-align: ${({ align }) => align || 'left'};
  ${({ mb }) => mb && `margin-bottom: ${typeof mb === 'number' ? `${mb}px` : mb};`}
  ${({ mt }) => mt && `margin-top: ${typeof mt === 'number' ? `${mt}px` : mt};`}
  ${({ ml }) => ml && `margin-left: ${typeof ml === 'number' ? `${ml}px` : ml};`}
  ${({ mr }) => mr && `margin-right: ${typeof mr === 'number' ? `${mr}px` : mr};`}
  
  ${({ onClick }) =>
    onClick &&
    css`
      cursor: pointer;
      &:hover {
        opacity: 0.9;
      }
    `}
`;

export const Text: React.FC<TextProps> = ({
  children,
  as = 'span',
  ...props
}) => {
  return (
    <StyledText as={as} {...props}>
      {children}
    </StyledText>
  );
};

// Add display name for better debugging
Text.displayName = 'Text';
