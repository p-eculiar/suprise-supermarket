import React from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  to?: string;
  as?: React.ElementType;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  to,
  children,
  ...props
}) => {
  // If 'to' prop is provided, render as a Link component
  if (to) {
    return (
      <StyledLink 
        to={to}
        $variant={variant}
        $size={size}
        $fullWidth={fullWidth}
        {...props as any}
      >
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
      {...props}
    >
      {children}
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

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  ${baseButtonStyles}
`;

const StyledLink = styled(Link)<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  ${baseButtonStyles}
  display: inline-flex;
`;
