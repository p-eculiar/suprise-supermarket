import React from 'react';
import styled from 'styled-components';

type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
type HeadingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type HeadingAlign = 'left' | 'center' | 'right';

interface HeadingProps {
  as?: HeadingLevel;
  size?: HeadingSize;
  weight?: HeadingWeight;
  color?: string;
  align?: HeadingAlign;
  children: React.ReactNode;
  className?: string;
  mt?: number;
  mb?: number;
  mx?: string;
  maxWidth?: string;
}

export const Heading: React.FC<HeadingProps> = ({
  as = 'h2',
  size = 'lg',
  weight = 'semibold',
  color,
  align = 'left',
  children,
  className,
  mt,
  mb,
  mx,
  maxWidth,
  ...props
}) => {
  return (
    <StyledHeading
      as={as}
      $size={size}
      $weight={weight}
      $color={color}
      $align={align}
      $mt={mt}
      $mb={mb}
      $mx={mx}
      $maxWidth={maxWidth}
      className={className}
      {...props}
    >
      {children}
    </StyledHeading>
  );
};

const StyledHeading = styled.h2<{
  $size: HeadingSize;
  $weight: HeadingWeight;
  $color?: string;
  $align: HeadingAlign;
  $mt?: number;
  $mb?: number;
  $mx?: string;
  $maxWidth?: string;
}>`
  margin: 0;
  line-height: 1.2;
  text-align: ${({ $align }) => $align};
  color: ${({ theme, $color }) => $color || theme.colors.text.primary};
  margin-top: ${({ $mt }) => $mt ? `${$mt * 0.5}rem` : '0'};
  margin-bottom: ${({ $mb }) => $mb ? `${$mb * 0.5}rem` : '0'};
  margin-left: ${({ $mx }) => $mx || 'auto'};
  margin-right: ${({ $mx }) => $mx || 'auto'};
  max-width: ${({ $maxWidth }) => $maxWidth || 'none'};
  
  ${({ $size }) => {
    switch ($size) {
      case 'xs':
        return 'font-size: 0.75rem;';
      case 'sm':
        return 'font-size: 0.875rem;';
      case 'md':
        return 'font-size: 1rem;';
      case 'lg':
        return 'font-size: 1.125rem;';
      case 'xl':
        return 'font-size: 1.25rem;';
      case '2xl':
        return 'font-size: 1.5rem;';
      case '3xl':
        return 'font-size: 1.875rem;';
      case '4xl':
        return 'font-size: 2.25rem;';
      default:
        return 'font-size: 1.125rem;';
    }
  }}
  
  ${({ $weight }) => {
    switch ($weight) {
      case 'normal':
        return 'font-weight: 400;';
      case 'medium':
        return 'font-weight: 500;';
      case 'semibold':
        return 'font-weight: 600;';
      case 'bold':
        return 'font-weight: 700;';
      default:
        return 'font-weight: 600;';
    }
  }}
`;
