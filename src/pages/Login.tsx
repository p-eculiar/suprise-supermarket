import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/auth/AuthForm';
import { Container, Section } from '../components/common';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async ({ email, password }: { email: string; password: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Section>
        <Container>
          <AuthForm 
            type="login" 
            onSubmit={handleSubmit} 
            loading={isLoading}
            error={error}
          />
        </Container>
      </Section>
    </LoginContainer>
  );
};

export default LoginPage;

const LoginContainer = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: 2rem 0;
`;
