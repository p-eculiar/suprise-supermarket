import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');
    
    // If we have a token and type, this is a verification link from email
    if (token && type === 'email') {
      handleEmailVerification(token);
    } else if (user && user.email_confirmed_at) {
      // User is already verified, redirect to appropriate dashboard
      handleSuccessfulVerification();
    } else {
      // No token, show instructions
      setStatus('success');
      setMessage('Please check your email for the verification link. If you don\'t see it, check your spam folder.');
    }
  }, [user, searchParams]);

  const handleEmailVerification = async (token: string) => {
    try {
      setStatus('verifying');
      setMessage('Verifying your email address...');
      
      // Refresh user data to check if email is confirmed
      await refreshUser();
      
      if (user?.email_confirmed_at) {
        handleSuccessfulVerification();
      } else {
        // Wait a bit and try again (sometimes there's a delay)
        setTimeout(async () => {
          await refreshUser();
          if (user?.email_confirmed_at) {
            handleSuccessfulVerification();
          } else {
            setStatus('error');
            setMessage('Email verification failed. Please try clicking the link again or request a new verification email.');
          }
        }, 3000);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to verify email. Please try again.');
    }
  };

  const handleSuccessfulVerification = () => {
    setStatus('success');
    setMessage('Email verified successfully! Redirecting to your dashboard...');
    
    // Redirect to appropriate dashboard after 2 seconds
    setTimeout(() => {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }, 2000);
  };

  return (
    <PageContainer>
      <Card>
        <IconContainer status={status}>
          {status === 'verifying' && <FiRefreshCw size={48} />}
          {status === 'success' && <FiCheckCircle size={48} />}
          {status === 'error' && <FiAlertCircle size={48} />}
        </IconContainer>
        
        <Title>
          {status === 'verifying' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </Title>
        
        <Message status={status}>
          {message}
        </Message>
        
        {status === 'error' && (
          <Actions>
            <RetryButton onClick={() => window.location.reload()}>
              Try Again
            </RetryButton>
            <BackButton onClick={() => navigate('/login')}>
              Back to Login
            </BackButton>
          </Actions>
        )}
      </Card>
    </PageContainer>
  );
};

export default VerifyEmailPage;

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  padding: 1rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const IconContainer = styled.div<{ status: string }>`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  
  ${props => props.status === 'verifying' && `
    background: #6C9A7F;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `}
  
  ${props => props.status === 'success' && `
    background: #27ae60;
  `}
  
  ${props => props.status === 'error' && `
    background: #e74c3c;
  `}
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1rem 0;
`;

const Message = styled.p<{ status: string }>`
  font-size: 1rem;
  color: ${props => {
    switch (props.status) {
      case 'success': return '#27ae60';
      case 'error': return '#e74c3c';
      default: return '#636E72';
    }
  }};
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RetryButton = styled.button`
  padding: 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
`;

const BackButton = styled.button`
  padding: 1rem;
  background: transparent;
  color: #6C9A7F;
  border: 1px solid #6C9A7F;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
  }
`;