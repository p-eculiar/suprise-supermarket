import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { AuthForm } from '../components/auth/AuthForm';
import { Container, Section } from '../components/common';

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ({ name, email, password }: { name: string; email: string; password: string }) => {
    try {
      setError(null);
      setIsLoading(true);
      await registerUser(name, email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <Section>
        <Container>
          <AuthForm 
            type="register" 
            onSubmit={handleSubmit} 
            loading={isLoading}
            error={error}
          />
        </Container>
      </Section>
    </RegisterContainer>
  );
};

export default RegisterPage;

const RegisterContainer = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: 2rem 0;
`;
