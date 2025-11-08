import React, { SelectHTMLAttributes } from 'react';
import styled from 'styled-components';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  fullWidth = false,
  options,
  id,
  className,
  ...props
}) => {
  return (
    <SelectContainer $fullWidth={fullWidth} className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <StyledSelect id={id} $hasError={!!error} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </StyledSelect>
      {error && <ErrorText>{error}</ErrorText>}
    </SelectContainer>
  );
};

const SelectContainer = styled.div<{ $fullWidth: boolean }>`
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

const StyledSelect = styled.select<{ $hasError: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1.5)};
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.common.gray[900]};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme, $hasError }) =>
    $hasError ? (theme.colors as any).error.main : theme.colors.common.gray[300]};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? (theme.colors as any).error.dark : theme.colors.primary.main};
    box-shadow: 0 0 0 1px ${({ theme, $hasError }) =>
      $hasError ? (theme.colors as any).error.light : theme.colors.primary.light};
  }

  &:disabled {
    cursor: not-allowed;
    background-color: ${({ theme }) => theme.colors.common.gray[100]};
    opacity: 0.6;
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => (theme.colors as any).error.main};
  font-size: 0.75rem;
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  min-height: 1rem;
`;
