import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

// Styled Components
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
  
  ${props => props.status === 'waiting' && `
    background: #6C9A7F;
  `}
  
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

const Message = styled.div`
  font-size: 1rem;
  color: #636E72;
  margin: 0 0 2rem 0;
  line-height: 1.6;
`;

const EmailDisplay = styled.div`
  font-weight: 600;
  color: #6C9A7F;
  margin: 0.5rem 0 1rem 0;
  font-size: 1.1rem;
`;

const Instructions = styled.div`
  text-align: left;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 24px;
  height: 24px;
  background: #6C9A7F;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
  margin-right: 1rem;
`;

const StepText = styled.div`
  font-size: 0.95rem;
  color: #2D3436;
`;

const Actions = styled.div`
  margin: 1rem 0 2rem 0;
`;

const DashboardButton = styled.button`
  padding: 1rem 2rem;
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

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [status, setStatus] = useState<'waiting' | 'verifying' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('EmailVerification useEffect triggered');
    console.log('User:', user);
    console.log('IsAuthenticated:', isAuthenticated);
    
    // Check if this is a verification callback from Supabase
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const type = params.get('type');
    
    console.log('Token:', token);
    console.log('Type:', type);
    
    // If this is a verification callback, show verifying status
    if (token && type === 'email') {
      setStatus('verifying');
      setMessage('Verifying your email address and logging you in...');
      
      // Supabase handles the verification automatically
      // The onAuthStateChange listener in AuthContext will handle the login
      // Just wait a moment and then redirect
      setTimeout(async () => {
        // Refresh user data to get the latest role information
        await refreshUser();
        // Redirect to homepage
        window.location.href = '/';
      }, 3000);
    }
    // If user is already authenticated and email is confirmed, they're already on the homepage
    else if (isAuthenticated && user?.email_confirmed_at) {
      console.log('User already authenticated and email confirmed, redirecting to homepage');
      navigate('/');
    }
  }, [isAuthenticated, user, location, navigate, refreshUser]);

  return (
    <PageContainer>
      <Card>
        <IconContainer status={status}>
          {status === 'waiting' && <FiMail size={48} />}
          {status === 'verifying' && <FiRefreshCw size={48} />}
          {status === 'success' && <FiCheckCircle size={48} />}
          {status === 'error' && <FiAlertCircle size={48} />}
        </IconContainer>
        
        <Title>
          {status === 'waiting' && 'Check Your Email'}
          {status === 'verifying' && 'Verifying...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </Title>
        
        <Message>
          {status === 'waiting' && (
            <>
              <p>We've sent a verification email to:</p>
              <EmailDisplay>{user?.email || 'your email address'}</EmailDisplay>
              <p>Please check your inbox (and spam folder) and click the verification link to complete your registration.</p>
            </>
          )}
          {status === 'verifying' && 'Please wait while we verify your email address and log you in...'}
          {status === 'success' && 'Your email has been verified successfully! Redirecting to homepage...'}
          {status === 'error' && 'There was an error verifying your email. Please try again or contact support.'}
        </Message>
        
        {status === 'waiting' && (
          <Instructions>
            <Step>
              <StepNumber>1</StepNumber>
              <StepText>Open your email client</StepText>
            </Step>
            <Step>
              <StepNumber>2</StepNumber>
              <StepText>Find the email from Surprise Supermarket</StepText>
            </Step>
            <Step>
              <StepNumber>3</StepNumber>
              <StepText>Click the "Verify Email" button</StepText>
            </Step>
            <Step>
              <StepNumber>4</StepNumber>
              <StepText>You'll be automatically logged in and redirected to the homepage</StepText>
            </Step>
          </Instructions>
        )}
      </Card>
    </PageContainer>
  );
};

export default EmailVerificationPage;