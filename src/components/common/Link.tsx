import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import styled, { css } from 'styled-components';

export interface LinkProps extends RouterLinkProps {
  variant?: 'primary' | 'secondary' | 'text';
  color?: string;
  hoverColor?: string;
  underline?: boolean;
  bold?: boolean;
  external?: boolean;
}

const StyledLink = styled(RouterLink)<Omit<LinkProps, 'to'>>`
  color: ${({ theme, color, variant = 'primary' }) => 
    color || (variant === 'primary' ? theme.colors?.primary?.main : theme.colors?.text?.primary)};
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  font-weight: ${({ bold }) => (bold ? '600' : '400')};
  transition: color 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    color: ${({ theme, hoverColor, variant = 'primary' }) => 
      hoverColor || (variant === 'primary' ? theme.colors?.primary?.dark : theme.colors?.text?.secondary)};
    text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary?.main};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

const ExternalLink = styled.a<Omit<LinkProps, 'to' | 'href'>>`
  color: ${({ theme, color, variant = 'primary' }) => 
    color || (variant === 'primary' ? theme.colors?.primary?.main : theme.colors?.text?.primary)};
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  font-weight: ${({ bold }) => (bold ? '600' : '400')};
  transition: color 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    color: ${({ theme, hoverColor, variant = 'primary' }) => 
      hoverColor || (variant === 'primary' ? theme.colors?.primary?.dark : theme.colors?.text?.secondary)};
    text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors?.primary?.main};
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

export const Link: React.FC<LinkProps> = ({ 
  children, 
  external = false, 
  to, 
  ...props 
}) => {
  if (external) {
    return (
      <ExternalLink 
        href={to as string} 
        target="_blank" 
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </ExternalLink>
    );
  }

  return (
    <StyledLink to={to} {...props}>
      {children}
    </StyledLink>
  );
};

export default Link;
