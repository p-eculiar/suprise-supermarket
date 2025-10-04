import React, { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import styled from 'styled-components';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      fullWidth = false,
      startIcon,
      endIcon,
      icon,
      iconPosition = 'start',
      containerStyle,
      containerClassName,
      className,
      id,
      ...props
    },
    ref
  ) => {
    // Handle deprecated icon prop (for backward compatibility)
    const resolvedStartIcon = startIcon || (iconPosition === 'start' ? icon : null);
    const resolvedEndIcon = endIcon || (iconPosition === 'end' ? icon : null);

    return (
      <InputContainer 
        className={containerClassName} 
        style={containerStyle}
        $fullWidth={fullWidth}
      >
        {label && <Label htmlFor={id}>{label}</Label>}
        <InputWrapper $hasError={!!error} $hasStartIcon={!!resolvedStartIcon} $hasEndIcon={!!resolvedEndIcon}>
          {resolvedStartIcon && (
            <IconWrapper $position="start">
              {resolvedStartIcon}
            </IconWrapper>
          )}
          <StyledInput
            ref={ref}
            id={id}
            className={className}
            $hasStartIcon={!!resolvedStartIcon}
            $hasEndIcon={!!resolvedEndIcon}
            $isDisabled={props.disabled}
            {...props}
          />
          {resolvedEndIcon && (
            <IconWrapper $position="end">
              {resolvedEndIcon}
            </IconWrapper>
          )}
        </InputWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </InputContainer>
    );
  }
);

Input.displayName = 'Input';

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.common.gray[700]};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  font-weight: 500;
`;

const InputWrapper = styled.div<{ $hasError: boolean; $hasStartIcon: boolean; $hasEndIcon: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error.main : theme.colors.primary.main};
    transform: scaleX(0);
    transition: transform 0.2s ease;
  }
  
  &:focus-within::after {
    transform: scaleX(1);
  }
`;

const StyledInput = styled.input<{ 
  $hasStartIcon: boolean; 
  $hasEndIcon: boolean;
  $isDisabled?: boolean;
}>`
  width: 100%;
  padding: ${({ theme, $hasStartIcon, $hasEndIcon }) => {
    const vertical = theme.spacing(1.5);
    const left = $hasStartIcon ? theme.spacing(4.5) : theme.spacing(1.5);
    const right = $hasEndIcon ? theme.spacing(4.5) : theme.spacing(1.5);
    return `${vertical} ${right} ${vertical} ${left}`;
  }};
  
  font-size: 1rem;
  color: ${({ theme, $isDisabled }) => 
    $isDisabled ? theme.colors.common.gray[500] : theme.colors.common.gray[900]};
  background-color: ${({ theme, $isDisabled }) => 
    $isDisabled ? theme.colors.common.gray[100] : theme.colors.background.paper};
  border: 1px solid ${({ theme, $isDisabled }) => 
    $isDisabled ? theme.colors.common.gray[300] : theme.colors.common.gray[300]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  transition: all 0.2s ease;
  appearance: none;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.common.gray[500]};
    opacity: 1;
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme, $isDisabled }) => 
      !$isDisabled && theme.colors.primary.main};
    box-shadow: 0 0 0 1px ${({ theme, $isDisabled }) => 
      !$isDisabled && theme.colors.primary.light};
  }
  
  &:disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.common.gray[100]};
  }
  
  &[type="number"] {
    -moz-appearance: textfield;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
`;

const IconWrapper = styled.div<{ $position: 'start' | 'end' }>`
  position: absolute;
  ${({ $position }) => ($position === 'start' ? 'left' : 'right')}: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.common.gray[500]};
  pointer-events: none;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: 0.75rem;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  min-height: 1rem;
`;
