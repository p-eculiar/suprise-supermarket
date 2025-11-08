import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiUser, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { contactApi } from '../services/api';
import toast from '../components/common/Toast';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { success, message } = await contactApi.submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message
      });

      if (success) {
        toast.success('Thank you for contacting us! We\'ll get back to you soon.');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        toast.error(message || 'Failed to submit form. Please try again.');
      }
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      {/* Breadcrumb & Page Header */}
      <BreadcrumbSection>
        <ContentContainer>
          <PageTitle>Contact Us</PageTitle>
          <Breadcrumb>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbCurrent>Contact</BreadcrumbCurrent>
          </Breadcrumb>
        </ContentContainer>
      </BreadcrumbSection>

      <ContentContainer>
        {/* Contact Info Cards */}
        <InfoGrid>
          <InfoCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <InfoIcon $color="#6C9A7F">
              <FiMapPin />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>Visit Our Store</InfoTitle>
              <strong>Suprise Supermarket</strong><br />
              6 Farm Road<br />
              Off Ada George, Port Harcourt<br />
              Rivers State, Nigeria
            </InfoContent>
          </InfoCard>

          <InfoCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <InfoIcon $color="#FFC107">
              <FiPhone />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>Call Us</InfoTitle>
              <InfoText>(+234) 8084888899</InfoText>
              <InfoText>(+234) 7017653903</InfoText>
            </InfoContent>
          </InfoCard>

          <InfoCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <InfoIcon $color="#FF6B6B">
              <FiMail />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>Email Us</InfoTitle>
              <InfoText>chikwendupeculiar66@gmail.com</InfoText>
              <InfoText>surpry1980@yahoo.com</InfoText>
            </InfoContent>
          </InfoCard>

          <InfoCard
            as={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <InfoIcon $color="#4ECDC4">
              <FiClock />
            </InfoIcon>
            <InfoContent>
              <InfoTitle>Working Hours</InfoTitle>
              <InfoText>Mon - Fri: 12:00 AM - 10:00 PM</InfoText>
              <InfoText>Sat - Sun: 11:00 AM - 10:00 PM</InfoText>
            </InfoContent>
          </InfoCard>
        </InfoGrid>

        {/* Contact Form and Map Section */}
        <MainSection>
          <FormSection>
            <SectionHeader
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionTitle>Send Us a Message</SectionTitle>
              <SectionSubtitle>We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.</SectionSubtitle>
            </SectionHeader>

            <ContactForm onSubmit={handleSubmit}>
              <FormRow>
                <FormGroup>
                  <Label htmlFor="name">Full Name *</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiUser />
                    </InputIcon>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Name"
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="email">Email Address *</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiMail />
                    </InputIcon>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="surpry1980@yahoo.com"
                    />
                  </InputWrapper>
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="phone">Phone Number</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiPhone />
                    </InputIcon>
                    <Input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="(+234) 8084888899"
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="subject">Subject *</Label>
                  <InputWrapper>
                    <InputIcon>
                      <FiMessageSquare />
                    </InputIcon>
                    <Select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Customer Support</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="other">Other</option>
                    </Select>
                  </InputWrapper>
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Tell us more about how we can help you..."
                />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting}>
                <FiSend />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </SubmitButton>
            </ContactForm>
          </FormSection>

          <MapSection>
            <SectionHeader
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <SectionTitle>Find Us on Map</SectionTitle>
              <SectionSubtitle>Visit our store and experience our quality products firsthand.</SectionSubtitle>
            </SectionHeader>

            <MapWrapper>
              <iframe
                title="Store Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.741070398915!2d7.032193314763199!3d4.832200996449195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1069d1c0f22e2d65%3A0x3d0b5c0b5c0b5c0b!2s6%20Farm%20Rd%2C%20Port%20Harcourt!5e0!3m2!1sen!2sng!4v1650000000000!5m2!1sen!2sng"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
              />
            </MapWrapper>
          </MapSection>
        </MainSection>

        {/* FAQ Section */}
        <FaqSection>
          <SectionHeader>
            <SectionTitle>Frequently Asked Questions</SectionTitle>
            <SectionSubtitle>Find quick answers to common questions</SectionSubtitle>
          </SectionHeader>

          <FaqGrid>
            <FaqCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <FaqQuestion>What are your delivery options?</FaqQuestion>
              <FaqAnswer>We offer same-day delivery for orders placed before 2 PM. Standard delivery takes 1-2 business days.</FaqAnswer>
            </FaqCard>

            <FaqCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <FaqQuestion>Do you accept returns?</FaqQuestion>
              <FaqAnswer>Yes, we accept returns within 14 days of purchase for most items. Perishable goods may have different policies.</FaqAnswer>
            </FaqCard>

            <FaqCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <FaqQuestion>How can I track my order?</FaqQuestion>
              <FaqAnswer>Once your order ships, you'll receive a tracking number via email. You can also track orders in your account dashboard.</FaqAnswer>
            </FaqCard>

            <FaqCard
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <FaqQuestion>Do you offer bulk discounts?</FaqQuestion>
              <FaqAnswer>Yes! Contact us for special pricing on bulk orders. We're happy to work with businesses and organizations.</FaqAnswer>
            </FaqCard>
          </FaqGrid>
        </FaqSection>
      </ContentContainer>
    </PageWrapper>
  );
};

export default Contact;

// Styled Components
const PageWrapper = styled.div`
  background: #F8F9FA;
  min-height: 100vh;
  padding-bottom: 3rem;
`;

const BreadcrumbSection = styled.div`
  background: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #6C9A7F;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #636E72;
`;

const BreadcrumbCurrent = styled.span`
  color: #636E72;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const InfoCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const InfoIcon = styled.div<{ $color: string }>`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: ${props => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${props => props.$color};
  
  svg {
    width: 30px;
    height: 30px;
  }
`;

const InfoContent = styled.div``;

const InfoTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0.25rem 0;
`;

const MainSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 4rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const FormSection = styled.div``;

const MapSection = styled.div``;

const SectionHeader = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  color: #636E72;
  line-height: 1.6;
`;

const ContactForm = styled.form`
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  
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
  font-size: 0.875rem;
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
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #2D3436;
  outline: none;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #2D3436;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
  
  &::placeholder {
    color: #999;
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
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

const MapWrapper = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  height: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FaqSection = styled.div`
  margin-top: 4rem;
`;

const FaqGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FaqCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #6C9A7F;
`;

const FaqQuestion = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.75rem;
`;

const FaqAnswer = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  line-height: 1.6;
  margin: 0;
`;
