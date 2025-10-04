import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Text, Box, Container, Card } from '../../components/common';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type FormData = z.infer<typeof schema>;

const ForgotPassword: React.FC = () => {
  const { requestPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError(null);
      await requestPasswordReset(data.email);
      setSuccess('Password reset instructions have been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container centerContent>
      <Card maxWidth="500px" width="100%">
        <BackButton onClick={() => navigate(-1)}>
          <FiArrowLeft /> Back
        </BackButton>
        
        <Box mb={4} textAlign="center">
          <Text as="h1" variant="h4" weight="bold" mb={2}>
            Forgot Password
          </Text>
          <Text color="textSecondary">
            Enter your email address and we'll send you a link to reset your password.
          </Text>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Box mb={3}>
            <Input
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              icon={<FiMail />}
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
              autoFocus
            />
          </Box>

          {error && (
            <Text color="error" mb={3} textAlign="center">
              {error}
            </Text>
          )}

          {success ? (
            <Alert success>
              <Text>{success}</Text>
              <Text mt={2}>
                <Link to="/login">Back to Login</Link>
              </Text>
            </Alert>
          ) : (
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              isLoading={isLoading}
              disabled={isLoading}
            >
              Send Reset Instructions
            </Button>
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

export default ForgotPassword;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1.5rem;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
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
