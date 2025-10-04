import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button, Input, Text, Link } from '../common';
import { FiMail, FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required').optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: { email: string; password: string; name?: string }) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loading, error }) => {
  const isLogin = type === 'login';
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isLogin ? formSchema.omit({ name: true }) : formSchema),
  });

  const onSubmitHandler: SubmitHandler<FormData> = async (data) => {
    await onSubmit(data);
  };

  return (
    <FormContainer>
      <FormHeader>
        <h2>{isLogin ? 'Welcome Back' : 'Create an Account'}</h2>
        <Text color="textSecondary">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/register' : '/login'}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </Link>
        </Text>
      </FormHeader>

      {error && (
        <ErrorAlert>
          <FiAlertCircle />
          <span>{error}</span>
        </ErrorAlert>
      )}

      <Form onSubmit={handleSubmit(onSubmitHandler)}>
        {!isLogin && (
          <FormGroup>
            <Input
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              icon={<FiUser />}
              error={errors.name?.message}
              {...register('name')}
              disabled={loading}
              autoComplete="name"
            />
          </FormGroup>
        )}

        <FormGroup>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            icon={<FiMail />}
            error={errors.email?.message}
            {...register('email')}
            disabled={loading}
            autoComplete="email"
          />
        </FormGroup>

        <FormGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Enter your password"
            icon={<FiLock />}
            error={errors.password?.message}
            {...register('password')}
            disabled={loading}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            rightIcon={
              <PasswordToggle 
                onClick={() => setShowPassword(!showPassword)}
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </PasswordToggle>
            }
          />
        </FormGroup>

        {isLogin && (
          <ForgotPasswordLink>
            <Link to="/forgot-password">Forgot your password?</Link>
          </ForgotPasswordLink>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          loading={loading}
          disabled={loading}
        >
          {isLogin ? 'Sign In' : 'Create Account'}
        </Button>
      </Form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  max-width: 400px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const FormHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h2 {
    margin: 0 0 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    font-weight: 600;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ForgotPasswordLink = styled.div`
  text-align: right;
  margin-top: -0.75rem;
  margin-bottom: 0.5rem;
  
  a {
    font-size: 0.875rem;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.8;
    }
  }
`;

const PasswordToggle = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin-left: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background.light};
  }
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.error.light};
  color: ${({ theme }) => theme.colors.error.dark};
  padding: 0.75rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  
  svg {
    flex-shrink: 0;
  }
`;
