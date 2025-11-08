import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/common/Toast';
import { FiMail, FiLock, FiAlertCircle, FiShoppingBag, FiUser } from 'react-icons/fi';

const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true); // Default to opted-in
  const navigate = useNavigate();

  // Validation states
  const [passwordValid, setPasswordValid] = useState(true);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  // Password validation function
  const validatePassword = (password: string) => {
    const isLengthValid = password.length >= 8;
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
    return isLengthValid && hasSpecialChar;
  };

  // Handle password change with validation
  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password });
    setPasswordValid(validatePassword(password));
    
    // Also validate confirm password if it exists
    if (formData.confirmPassword) {
      setConfirmPasswordValid(password === formData.confirmPassword);
    }
  };

  // Handle confirm password change with validation
  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setFormData({ ...formData, confirmPassword });
    setConfirmPasswordValid(formData.password === confirmPassword);
  };

  // Handle terms acceptance
  const handleTermsChange = (accepted: boolean) => {
    setAcceptTerms(accepted);
    setTermsAccepted(accepted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    const isPasswordValid = validatePassword(formData.password);
    const isConfirmPasswordValid = formData.password === formData.confirmPassword;
    const areTermsAccepted = acceptTerms;
    
    setPasswordValid(isPasswordValid);
    setConfirmPasswordValid(isConfirmPasswordValid);
    setTermsAccepted(areTermsAccepted);
    
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters long and contain special characters');
      return;
    }
    
    if (!isConfirmPasswordValid) {
      setError('Passwords do not match');
      return;
    }
    
    if (!areTermsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      // Just register the user, don't automatically log them in
      await registerUser(formData.name, formData.email, formData.password, emailNotifications);
      
      // Show success message and redirect to verification page
      toast.success('Account created successfully! Please check your email to verify your account.');
      navigate('/verify-email');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all fields are valid for enabling submit button
  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.password.trim() !== '' &&
      formData.confirmPassword.trim() !== '' &&
      passwordValid &&
      confirmPasswordValid &&
      acceptTerms
    );
  };

  return (
    <PageContainer>
      <LeftSide>
        <LeftContent>
          <Logo>
            <FiShoppingBag />
            <LogoText>Suprise Supermarket</LogoText>
          </Logo>
          <HeroTitle>Join Our Community!</HeroTitle>
          <HeroSubtitle>Create an account and start enjoying fresh groceries delivered to your doorstep.</HeroSubtitle>
          <FeatureList>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Get access to exclusive deals</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Track your orders in real-time</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Earn loyalty rewards on every purchase</FeatureText>
            </FeatureItem>
            <FeatureItem>
              <FeatureIcon>✓</FeatureIcon>
              <FeatureText>Save your favorite items</FeatureText>
            </FeatureItem>
          </FeatureList>
          <HeroImage src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=80" alt="Fresh Groceries" />
        </LeftContent>
      </LeftSide>

      <RightSide>
        <FormContainer>
          <FormHeader>
            <FormTitle>Create Account</FormTitle>
            <FormSubtitle>Fill in the information below to get started</FormSubtitle>
          </FormHeader>

          {error && (
            <ErrorAlert>
              <FiAlertCircle />
              <span>{error}</span>
            </ErrorAlert>
          )}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Full Name</Label>
              <InputWrapper>
                <InputIcon>
                  <FiUser />
                </InputIcon>
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </InputWrapper>
            </FormGroup>

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
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    borderColor: !passwordValid && formData.password ? '#E74C3C' : undefined
                  }}
                />
                <ShowPasswordBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Hide' : 'Show'}
                </ShowPasswordBtn>
              </InputWrapper>
              <PasswordHint style={{ color: !passwordValid && formData.password ? '#E74C3C' : undefined }}>
                Must be at least 8 characters with special characters
              </PasswordHint>
            </FormGroup>

            <FormGroup>
              <Label>Confirm Password</Label>
              <InputWrapper>
                <InputIcon>
                  <FiLock />
                </InputIcon>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    borderColor: !confirmPasswordValid && formData.confirmPassword ? '#E74C3C' : undefined
                  }}
                />
              </InputWrapper>
              {formData.confirmPassword && !confirmPasswordValid && (
                <PasswordHint style={{ color: '#E74C3C' }}>
                  Passwords do not match
                </PasswordHint>
              )}
            </FormGroup>

            <TermsCheckbox>
              <CheckboxLabel style={{ color: !termsAccepted && !acceptTerms ? '#E74C3C' : undefined }}>
                <input 
                  type="checkbox" 
                  checked={acceptTerms}
                  onChange={(e) => handleTermsChange(e.target.checked)}
                />
                <span>
                  I agree to the <TermsLink to="/terms">Terms of Service</TermsLink> and{' '}
                  <TermsLink to="/privacy">Privacy Policy</TermsLink>
                </span>
              </CheckboxLabel>
            </TermsCheckbox>

            <NotificationCheckbox>
              <CheckboxLabel>
                <input 
                  type="checkbox" 
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                <span>
                  📧 Send me email notifications about new products, special discounts, and exclusive events
                </span>
              </CheckboxLabel>
            </NotificationCheckbox>

            <SubmitButton 
              type="submit" 
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </SubmitButton>

            {/* Social sign-up removed per request */}

            <SignInPrompt>
              Already have an account? <SignInLink to="/login">Sign In</SignInLink>
            </SignInPrompt>
          </Form>
        </FormContainer>
      </RightSide>
    </PageContainer>
  );
};

export default RegisterPage;

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
    left: -50%;
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
  gap: 1.25rem;
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

const PasswordHint = styled.span`
  font-size: 0.75rem;
  color: #999;
  margin-top: -0.25rem;
`;

const TermsCheckbox = styled.div`
  margin-top: -0.25rem;
`;

const NotificationCheckbox = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f0f9f4;
  border-radius: 8px;
  border: 1px solid #d4edda;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;
  cursor: pointer;
  line-height: 1.5;
  
  input[type="checkbox"] {
    margin-top: 0.25rem;
    cursor: pointer;
  }
`;

const TermsLink = styled(Link)`
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
  margin: 0.25rem 0;
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

const SignInPrompt = styled.p`
  text-align: center;
  font-size: 0.95rem;
  color: #636E72;
  margin: 0;
`;

const SignInLink = styled(Link)`
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
