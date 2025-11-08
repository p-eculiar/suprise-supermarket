import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Text, Box, Container, Card } from '../../components/common';
import { FiLock, FiCheck, FiX } from 'react-icons/fi';

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof passwordSchema>;

const PasswordRequirement: React.FC<{ text: string; meets: boolean }> = ({ text, meets }) => (
  <PasswordRequirementItem>
    {meets ? <FiCheck color="var(--success)" /> : <FiX color="var(--error)" />}
    <Text size="sm" color={meets ? 'textSecondary' : 'textTertiary'}>{text}</Text>
  </PasswordRequirementItem>
);

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState<string>('');
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(passwordSchema),
  });

  const newPassword = watch('password');

  useEffect(() => {
    // Get token from URL - Supabase can send it in different ways
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check multiple possible parameter names for the token
    const tokenParam = 
      urlParams.get('token') || 
      hashParams.get('token') || 
      urlParams.get('access_token') ||
      hashParams.get('access_token') ||
      urlParams.get('reset_token') ||
      hashParams.get('reset_token');
    
    console.log('URL search params:', Object.fromEntries(urlParams.entries()));
    console.log('URL hash params:', Object.fromEntries(hashParams.entries()));
    console.log('Token param found:', tokenParam);
    
    if (!tokenParam) {
      setIsTokenValid(false);
      setError('Invalid or missing reset token');
      return;
    }
    setToken(tokenParam);
    // In a real app, you would validate the token with your backend
    setIsTokenValid(true);
  }, [searchParams]);

  const onSubmit = async (data: FormData) => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await resetPassword(token, data.password);
      setSuccess('Your password has been reset successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <Container centerContent>
        <Text>Validating token...</Text>
      </Container>
    );
  }

  if (!isTokenValid) {
    return (
      <Container centerContent>
        <Card maxWidth="500px" width="100%">
          <Text color="error" mb={3} textAlign="center">
            {error || 'Invalid or expired reset token'}
          </Text>
          <Text textAlign="center">
            <Link to="/forgot-password">Request a new reset link</Link>
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container centerContent>
      <Card maxWidth="500px" width="100%">
        <Box mb={4} textAlign="center">
          <Text as="h1" variant="h4" weight="bold" mb={2}>
            Reset Your Password
          </Text>
          <Text color="textSecondary">
            Please enter your new password below.
          </Text>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={3}>
            <Input
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              icon={<FiLock />}
              error={errors.password?.message}
              {...register('password')}
              disabled={isLoading || success !== null}
              autoFocus
            />
          </Box>

          <Box mb={3}>
            <Input
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              icon={<FiLock />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              disabled={isLoading || success !== null}
            />
          </Box>

          <PasswordRequirements>
            <Text as="h4" weight="semibold" mb={2}>Password Requirements</Text>
            <PasswordRequirement 
              text="At least 8 characters" 
              meets={newPassword ? newPassword.length >= 8 : false} 
            />
            <PasswordRequirement 
              text="At least one uppercase letter" 
              meets={/[A-Z]/.test(newPassword || '')} 
            />
            <PasswordRequirement 
              text="At least one lowercase letter" 
              meets={/[a-z]/.test(newPassword || '')} 
            />
            <PasswordRequirement 
              text="At least one number" 
              meets={/\d/.test(newPassword || '')} 
            />
            <PasswordRequirement 
              text="At least one special character" 
              meets={/[@$!%*?&]/.test(newPassword || '')} 
            />
          </PasswordRequirements>

          {error && (
            <Text color="error" mb={3} textAlign="center">
              {error}
            </Text>
          )}

          {success ? (
            <Alert success>
              <Text>{success}</Text>
              <Text mt={2}>Redirecting to login page...</Text>
            </Alert>
          ) : (
            <SubmitButton 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </SubmitButton>
          )}

          <Text mt={3} textAlign="center">
            Remember your password?{' '}
            <Link to="/login">Sign In</Link>
          </Text>
        </form>
      </Card>
    </Container>
  );
};

export default ResetPassword;

const PasswordRequirements = styled.div`
  background: var(--background-light);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const PasswordRequirementItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Alert = styled.div<{ success?: boolean }>`
  background: ${({ success }) => 
    success ? 'var(--success-light)' : 'var(--error-light)'};
  color: ${({ success }) => 
    success ? 'var(--success-dark)' : 'var(--error-dark)'};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  border: 1px solid ${({ success }) => 
    success ? 'var(--success)' : 'var(--error)'};
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;
