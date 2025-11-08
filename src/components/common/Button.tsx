import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Loader } from './Loader';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

// Base button props without the 'as' prop
type BaseButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
  loading?: boolean;
  isLoading?: boolean; // Alias for loading for backward compatibility
  disabled?: boolean;
  startIcon?: React.ReactNode;
  icon?: React.ReactNode;
  mt?: number | string;
  mb?: number | string;
  ml?: number | string;
  mr?: number | string;
  m?: number | string;
  mx?: number | string;
  my?: number | string;
  // Framer Motion props
  whileHover?: any;
  whileTap?: any;
  animate?: any;
  initial?: any;
  exit?: any;
  // HTML button props
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

// Props when 'as' is 'a'
type AnchorButtonProps = BaseButtonProps & {
  as: 'a';
  href: string;
  to?: never; // Make 'to' invalid when 'as' is 'a'
};

// Props when 'to' is provided (for React Router Link)
type LinkButtonProps = BaseButtonProps & {
  to: string;
  as?: React.ElementType;
  href?: never; // Make 'href' invalid when 'to' is provided
};

// Props for regular button
type RegularButtonProps = BaseButtonProps & {
  to?: never;
  as?: never;
  href?: never;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonProps = AnchorButtonProps | LinkButtonProps | RegularButtonProps;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading: loadingProp,
  isLoading,
  disabled = false,
  startIcon,
  icon,
  to,
  children,
  mt,
  mb,
  ml,
  mr,
  m,
  mx,
  my,
  ...props
}) => {
  // Use loading prop if provided, otherwise fall back to isLoading for backward compatibility
  const loading = loadingProp !== undefined ? loadingProp : isLoading || false;
  const displayIcon = startIcon || icon;
  
  // If 'to' prop is provided, render as a Link component
  if (to) {
    return (
      <StyledLink 
        to={to}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        $m={m}
        $mt={mt}
        $mb={mb}
        $ml={ml}
        $mr={mr}
        $mx={mx}
        $my={my}
        {...props as any}
      >
        {displayIcon && <IconWrapper>{displayIcon}</IconWrapper>}
        {children}
      </StyledLink>
    );
  }

  // Otherwise render as a button
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $m={m}
      $mt={mt}
      $mb={mb}
      $ml={ml}
      $mr={mr}
      $mx={mx}
      $my={my}
      disabled={disabled || loading}
      $isLoading={loading}
      {...props}
    >
      {loading && <ButtonLoader size={16} color="currentColor" />}
      <ButtonContent $isLoading={loading}>
        {displayIcon && <IconWrapper>{displayIcon}</IconWrapper>}
        {children}
      </ButtonContent>
    </StyledButton>
  );
};

const baseButtonStyles = css<{ 
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.duration.standard}ms;
  border: 2px solid transparent;
  line-height: 1.5;
  white-space: nowrap;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  /* Size variants */
  ${({ $size }) => {
    switch ($size) {
      case 'small':
        return 'padding: 0.5rem 1rem; font-size: 0.875rem;';
      case 'large':
        return 'padding: 1rem 2rem; font-size: 1.125rem;';
      case 'medium':
      default:
        return 'padding: 0.75rem 1.5rem; font-size: 1rem;';
    }
  }}

  /* Variant styles */
  ${({ theme, $variant }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary.main};
          color: white;
          border-color: ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary.dark};
            border-color: ${theme.colors.primary.dark};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows[2]};
          }
        `;
      
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary.main};
          color: white;
          border-color: ${theme.colors.secondary.main};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.secondary.dark};
            border-color: ${theme.colors.secondary.dark};
            transform: translateY(-2px);
            box-shadow: ${theme.shadows[2]};
          }
        `;

      case 'outline':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary.main};
          border-color: ${theme.colors.primary.main};

          &:hover:not(:disabled) {
            background-color: ${theme.colors.primary.light}10;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows[1]};
          }
        `;

      case 'text':
        return css`
          background-color: transparent;
          color: ${theme.colors.primary.main};
          border-color: transparent;
          padding: 0.5rem 0.75rem;

          &:hover:not(:disabled) {
            background-color: ${theme.colors.common.gray[100]};
            transform: translateY(-2px);
          }
        `;

      default:
        return '';
    }
  }}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonLoader = styled(Loader)<{ size: number }>`
  margin-right: 0.5rem;
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 0.5rem;
  
  svg {
    width: 1.25em;
    height: 1.25em;
  }
`;

const ButtonContent = styled.span<{ $isLoading?: boolean }>`
  opacity: ${({ $isLoading }) => ($isLoading ? 0.7 : 1)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

interface StyledButtonProps {
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $isLoading?: boolean;
  $mt?: number | string;
  $mb?: number | string;
  $ml?: number | string;
  $mr?: number | string;
  $m?: number | string;
  $mx?: number | string;
  $my?: number | string;
}

const StyledButton = styled.button<StyledButtonProps>`
  ${baseButtonStyles}
  position: relative;
  ${({ $m }) => $m && `margin: ${typeof $m === 'number' ? `${$m}px` : $m};`}
  ${({ $mt }) => $mt && `margin-top: ${typeof $mt === 'number' ? `${$mt}px` : $mt};`}
  ${({ $mb }) => $mb && `margin-bottom: ${typeof $mb === 'number' ? `${$mb}px` : $mb};`}
  ${({ $ml }) => $ml && `margin-left: ${typeof $ml === 'number' ? `${$ml}px` : $ml};`}
  ${({ $mr }) => $mr && `margin-right: ${typeof $mr === 'number' ? `${$mr}px` : $mr};`}
  ${({ $mx }) => $mx && `margin-left: ${typeof $mx === 'number' ? `${$mx}px` : $mx}; margin-right: ${typeof $mx === 'number' ? `${$mx}px` : $mx};`}
  ${({ $my }) => $my && `margin-top: ${typeof $my === 'number' ? `${$my}px` : $my}; margin-bottom: ${typeof $my === 'number' ? `${$my}px` : $my};`}
  
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      cursor: wait;
      opacity: 0.9;
    `}
`;

const StyledLink = styled(Link)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $mt?: number | string;
  $mb?: number | string;
  $ml?: number | string;
  $mr?: number | string;
  $m?: number | string;
  $mx?: number | string;
  $my?: number | string;
}>`
  ${baseButtonStyles}
  display: inline-flex;
  ${({ $m }) => $m && `margin: ${typeof $m === 'number' ? `${$m}px` : $m};`}
  ${({ $mt }) => $mt && `margin-top: ${typeof $mt === 'number' ? `${$mt}px` : $mt};`}
  ${({ $mb }) => $mb && `margin-bottom: ${typeof $mb === 'number' ? `${$mb}px` : $mb};`}
  ${({ $ml }) => $ml && `margin-left: ${typeof $ml === 'number' ? `${$ml}px` : $ml};`}
  ${({ $mr }) => $mr && `margin-right: ${typeof $mr === 'number' ? `${$mr}px` : $mr};`}
  ${({ $mx }) => $mx && `margin-left: ${typeof $mx === 'number' ? `${$mx}px` : $mx}; margin-right: ${typeof $mx === 'number' ? `${$mx}px` : $mx};`}
  ${({ $my }) => $my && `margin-top: ${typeof $my === 'number' ? `${$my}px` : $my}; margin-bottom: ${typeof $my === 'number' ? `${$my}px` : $my};`}
`;
