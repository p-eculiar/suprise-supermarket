import React, { InputHTMLAttributes, forwardRef } from 'react';
import styled from 'styled-components';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, style, fullWidth = false, ...props }, ref) => {
    return (
      <CheckboxContainer 
        className={className} 
        style={style}
        $fullWidth={fullWidth}
      >
        <CheckboxWrapper $hasError={!!error}>
          <HiddenCheckbox 
            type="checkbox" 
            ref={ref} 
            {...props} 
          />
          <StyledCheckbox $checked={props.checked} $disabled={props.disabled}>
            <CheckIcon viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </CheckIcon>
          </StyledCheckbox>
          {label && (
            <Label 
              htmlFor={props.id} 
              $disabled={props.disabled}
            >
              {label}
            </Label>
          )}
        </CheckboxWrapper>
        {error && <ErrorText>{error}</ErrorText>}
      </CheckboxContainer>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const CheckboxContainer = styled.label<{ $fullWidth: boolean }>`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  cursor: pointer;
`;

const CheckboxWrapper = styled.div<{ $hasError: boolean }>`
  display: flex;
  align-items: center;
  position: relative;
  padding: ${({ theme }) => theme.spacing(0.5, 0)};
  ${({ $hasError, theme }) =>
    $hasError &&
    `
    & ${/* sc-selector */ Label} {
      color: ${theme.colors.error.main};
    }
  `}
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
`;

const StyledCheckbox = styled.div<{ $checked: boolean | undefined; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: ${({ theme, $checked, $disabled }) => {
    if ($disabled) return theme.colors.common.gray[100];
    return $checked ? theme.colors.primary.main : theme.colors.background.paper;
  }};
  border: 2px solid
    ${({ theme, $checked, $disabled }) => {
      if ($disabled) return theme.colors.common.gray[300];
      return $checked ? theme.colors.primary.main : theme.colors.common.gray[400];
    }};
  border-radius: 4px;
  margin-right: ${({ theme }) => theme.spacing(1.5)};
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  ${HiddenCheckbox}:focus + & {
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.light};
  }
  
  ${HiddenCheckbox}:hover + & {
    border-color: ${({ theme, $disabled }) => 
      !$disabled && theme.colors.primary.main};
  }
`;

const CheckIcon = styled.svg`
  width: 14px;
  height: 14px;
  stroke: white;
  stroke-width: 3;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s ease;
  
  ${StyledCheckbox}.${/* sc-selector */ props => props.className} & {
    opacity: 1;
    transform: scale(1);
  }
`;

const Label = styled.span<{ $disabled?: boolean }>`
  font-size: 0.9375rem;
  color: ${({ theme, $disabled }) => 
    $disabled ? theme.colors.common.gray[500] : theme.colors.common.gray[800]};
  user-select: none;
  transition: color 0.2s ease;
  
  ${({ $disabled }) => $disabled && 'cursor: not-allowed;'}
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors.error.main};
  font-size: 0.75rem;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;
