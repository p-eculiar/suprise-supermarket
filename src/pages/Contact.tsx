import React, { useState, useCallback, useEffect } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiMessageSquare } from 'react-icons/fi';
import styled, { keyframes } from 'styled-components';
import { Container, Section, Heading, Text, Box } from '../components/common';
import ContactForm, { ContactFormData } from '../components/contact/ContactForm';
import { contactApi } from '../services/api';
import ReCAPTCHA from 'react-google-recaptcha';
import { trackEvent } from '../utils/analytics';

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || '';

const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{ success?: boolean; message: string } | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackEvent('page_view', { page_title: 'Contact' });
  }, []);

  const handleRecaptchaChange = useCallback((token: string | null) => {
    setRecaptchaToken(token);
  }, []);

  const handleSubmit = async (data: ContactFormData) => {
    if (!recaptchaToken) {
      setShowRecaptcha(true);
      setSubmitStatus({
        success: false,
        message: 'Please complete the reCAPTCHA verification.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus(null);
      
      // Track form submission
      trackEvent('form_submit', { form_name: 'contact' });
      
      // Add reCAPTCHA token to form data
      const formData = { ...data, 'g-recaptcha-response': recaptchaToken };
      
      // Make API call
      const response = await contactApi.submitContactForm(formData);
      
      setSubmitStatus({
        success: response.success,
        message: response.message || 'Your message has been sent successfully! We\'ll get back to you soon.'
      });
      
      // Track successful submission
      if (response.success) {
        trackEvent('form_success', { form_name: 'contact' });
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send your message. Please try again later.';
      
      setSubmitStatus({
        success: false,
        message: errorMessage
      });
      
      // Track form error
      trackEvent('form_error', { 
        form_name: 'contact',
        error: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      setShowRecaptcha(false);
      setRecaptchaToken(null);
      
      // Reset reCAPTCHA
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    }
  };

  return (
    <ContactContainer>
      <Section>
        <Container>
          <Header>
            <Heading as="h1" variant="h2" align="center">
              Get in Touch
            </Heading>
            <Text size="lg" color="textSecondary" align="center" maxWidth="700px" mx="auto">
              Have questions or feedback? We'd love to hear from you. Fill out the form below or reach out to us directly.
            </Text>
          </Header>

          <ContactGrid>
            <ContactFormWrapper>
              {isSubmitting && <LoadingOverlay />}
              <ContactForm 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
                submitStatus={submitStatus}
              />
              
              {showRecaptcha && (
                <RecaptchaContainer>
                  <ReCAPTCHA
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    theme="light"
                    size="normal"
                  />
                </RecaptchaContainer>
              )}
            </ContactFormWrapper>
            
            <ContactInfo>
              <InfoItem>
                <InfoIcon>
                  <FiMapPin />
                </InfoIcon>
                <div>
                  <InfoTitle>Our Location</InfoTitle>
                  <Text>123 Supermarket St, City, Country</Text>
                </div>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>
                  <FiPhone />
                </InfoIcon>
                <div>
                  <InfoTitle>Phone</InfoTitle>
                  <Text>+1 234 567 8900</Text>
                  <Text>+1 234 567 8901</Text>
                </div>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>
                  <FiMail />
                </InfoIcon>
                <div>
                  <InfoTitle>Email</InfoTitle>
                  <Text>info@suprisesupermarket.com</Text>
                  <Text>support@suprisesupermarket.com</Text>
                </div>
              </InfoItem>
              
              <InfoItem>
                <InfoIcon>
                  <FiClock />
                </InfoIcon>
                <div>
                  <InfoTitle>Working Hours</InfoTitle>
                  <Text>Monday - Friday: 8:00 - 20:00</Text>
                  <Text>Saturday - Sunday: 9:00 - 18:00</Text>
                </div>
              </InfoItem>
            </ContactInfo>
          </ContactGrid>
          
          <MapContainer>
            <iframe
              title="Our Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215209132234!2d-73.98784472425252!3d40.74844097138986!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1623456789012!5m2!1sen!2sus"
              width="100%"
              height="450"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </MapContainer>
        </Container>
      </Section>
    </ContactContainer>
  );
};

export default ContactPage;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  z-index: 10;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease-in-out;
  
  &::after {
    content: '';
    width: 40px;
    height: 40px;
    border: 3px solid ${({ theme }) => theme.colors.primary};
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const RecaptchaContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
`;

const ContactFormWrapper = styled(Box)`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;
