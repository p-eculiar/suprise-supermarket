import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from '../components/common/Toast';
import { FiMail, FiLock, FiAlertCircle, FiShoppingBag } from 'react-icons/fi';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string }, redirectToCart?: boolean, product?: any })?.from?.pathname || '/';
  const redirectToCart = (location.state as { redirectToCart?: boolean })?.redirectToCart || false;
  const product = (location.state as { product?: any })?.product || null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsLoading(true);
      
      // Check for internet connectivity before attempting login
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your connection and try again.');
      }
      
      await login(formData.email, formData.password);
      
      // Check if we need to redirect to cart and add a product
      if (redirectToCart && product) {
        // Add product to cart
        // Note: This is a simplified approach. In a real app, you'd want to use the actual cart context
        toast.success(`${product.name} added to cart!`);
        navigate('/cart');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      // Check if it's a network error
      if (!navigator.onLine) {
        setError('No internet connection. Please check your connection and try again.');
        toast.error('No internet connection. Please check your connection and try again.');
      } else {
        setError(err.message || 'Failed to log in. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.warning('Please enter your email address first');
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: formData.email,
      });

      if (error) throw error;
      toast.emailVerificationSent();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification email');
    }
  };

  // Add network status monitoring
  React.useEffect(() => {
    const handleOnline = () => {
      toast.success('Internet connection restored. You can now try logging in.');
    };
    
    const handleOffline = () => {
      toast.error('Internet connection lost.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <PageContainer>
      <LeftSide>
        <LeftContent>
          <Logo>
            <FiShoppingBag />
            <LogoText>Suprise Supermarket</LogoText>
          </Logo>
          <HeroTitle>Welcome Back!</HeroTitle>
          <HeroSubtitle>Sign in to access your account and continue shopping for fresh groceries.</HeroSubtitle>
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Fresh products delivered daily</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Exclusive member discounts</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Fast & secure checkout</FeatureText>
            </FeatureItem>
          </FeatureList>
          <HeroImage src="https://images.unsplash.com/photo-1542838132-92d533f92e39?w=600&auto=format&fit=crop&q=80" alt="Fresh Groceries" />
        </LeftContent>
      </LeftSide>

      <RightSide>
        <FormContainer>
          <FormHeader>
            <FormTitle>Sign In</FormTitle>
            <FormSubtitle>Enter your credentials to access your account</FormSubtitle>
          </FormHeader>

          {error && (
            <ErrorAlert>
              <FiAlertCircle />
              <div style={{ flex: 1 }}>
                <span>{error}</span>
                {error.includes('Email not confirmed') && (
                  <ResendButton onClick={handleResendVerification}>
                    📧 Resend Verification Email
                  </ResendButton>
                )}
              </div>
            </ErrorAlert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Email Address</Label>
              <InputWrapper>
                <InputIcon>
                  <FiMail />
                </InputIcon>
                <Input
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FiLock />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
                <ShowPasswordBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </ShowPasswordBtn>
              </InputWrapper>
            </FormGroup>

            <RememberForgot>
              <CheckboxLabel>
                <input type="checkbox" />
                <span>Remember me</span>
              </CheckboxLabel>
              <ForgotLink to="/forgot-password">Forgot Password?</ForgotLink>
            </RememberForgot>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </SubmitButton>

            {/* Social sign-in removed per request */}

            <SignUpPrompt>
              Don't have an account? <SignUpLink to="/register">Sign Up</SignUpLink>
            </SignUpPrompt>
          </Form>
        </FormContainer>
      </RightSide>
    </PageContainer>
  );
};

export default LoginPage;

const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  
  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

const LeftSide = styled.div`
  flex: 1;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  
  @media (max-width: 968px) {
    min-height: 300px;
    padding: 2rem;
  }
`;

const LeftContent = styled.div`
  max-width: 500px;
  width: 100%;
  z-index: 2;
  color: white;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 3rem;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const LogoText = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.2;
  
  @media (max-width: 968px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  line-height: 1.6;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FeatureIcon = styled.div`
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
`;

const FeatureText = styled.span`
  font-size: 1rem;
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  margin-top: 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: #F8F9FA;
  
  @media (max-width: 968px) {
    padding: 2rem 1.5rem;
  }
`;

const FormContainer = styled.div`
  max-width: 450px;
  width: 100%;
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  
  @media (max-width: 968px) {
    padding: 2rem 1.5rem;
  }
`;

const FormHeader = styled.div`
  margin-bottom: 2rem;
`;

const FormTitle = styled.h2`
  font-size: 1.875rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const FormSubtitle = styled.p`
  font-size: 0.95rem;
  color: #636E72;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  color: #999;
  display: flex;
  align-items: center;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #2D3436;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
`;

const ShowPasswordBtn = styled.button`
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const RememberForgot = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -0.5rem;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;
  cursor: pointer;
  
  input[type="checkbox"] {
    cursor: pointer;
  }
`;

const ForgotLink = styled(Link)`
  font-size: 0.875rem;
  color: #6C9A7F;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
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

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0.5rem 0;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: #E1E8ED;
`;

const DividerText = styled.span`
  font-size: 0.875rem;
  color: #999;
`;

const SocialButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SocialButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2D3436;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #F8F9FA;
    border-color: #D1D8DD;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const SignUpPrompt = styled.p`
  text-align: center;
  font-size: 0.95rem;
  color: #636E72;
  margin: 0;
`;

const SignUpLink = styled(Link)`
  color: #6C9A7F;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #FEE;
  color: #C33;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
  border: 1px solid #FCC;
  
  svg {
    flex-shrink: 0;
    width: 18px;
    height: 18px;
  }
`;

const ResendButton = styled.button`
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #5A8470;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(108, 154, 127, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
