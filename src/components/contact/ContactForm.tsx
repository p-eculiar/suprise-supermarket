import React, { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import styled, { keyframes } from 'styled-components';
import { Button, Input, Text, Box } from '../common';
import { FiSend, FiUser, FiMail, FiMessageSquare, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

// Form validation schema using Zod
const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => Promise<void>;
  isSubmitting?: boolean;
  submitStatus?: {
    success?: boolean;
    message: string;
  } | null;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  onSubmit, 
  isSubmitting = false, 
  submitStatus 
}) => {
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onTouched',
  });

  // Reset form after successful submission
  useEffect(() => {
    if (isSubmitSuccessful && submitStatus?.success) {
      reset();
      setSubmitMessage(submitStatus.message);
      setSubmitSuccess(submitStatus.success);
    }
  }, [isSubmitSuccessful, submitStatus, reset]);

  const handleFormSubmit: SubmitHandler<ContactFormData> = async (data) => {
    try {
      await onSubmit(data);
      setSubmitMessage('Message sent successfully!');
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitMessage('Error sending message. Please try again.');
      setSubmitSuccess(false);
    }
  };

  return (
    <FormContainer>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormRow>
          <FormGroup>
            <Input
              type="text"
              label="Your Name"
              placeholder="John Doe"
              icon={<FiUser />}
              error={errors.name?.message}
              disabled={isSubmitting}
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <ErrorMessage id="name-error">
                {errors.name.message}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<FiMail />}
              error={errors.email?.message}
              disabled={isSubmitting}
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <ErrorMessage id="email-error">
                {errors.email.message}
              </ErrorMessage>
            )}
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Input
            type="text"
            label="Subject"
            placeholder="How can we help?"
            icon={<FiMessageSquare />}
            error={errors.subject?.message}
            disabled={isSubmitting}
            {...register('subject')}
            aria-invalid={errors.subject ? 'true' : 'false'}
            aria-describedby={errors.subject ? 'subject-error' : undefined}
          />
          {errors.subject && (
            <ErrorMessage id="subject-error">
              {errors.subject.message}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <TextArea
            label="Your Message"
            placeholder="Type your message here..."
            rows={6}
            error={errors.message?.message}
            disabled={isSubmitting}
            {...register('message')}
            aria-invalid={errors.message ? 'true' : 'false'}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <ErrorMessage id="message-error">
              {errors.message.message}
            </ErrorMessage>
          )}
        </FormGroup>

        <Button 
          type="submit" 
          variant="primary" 
          size="large"
          fullWidth
          disabled={isSubmitting}
          isLoading={isSubmitting}
          icon={<FiSend />}
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>

        {submitMessage && (
          <StatusMessage success={submitSuccess} role="alert">
            {submitSuccess ? (
              <FiCheckCircle className="icon" />
            ) : (
              <FiAlertCircle className="icon" />
            )}
            <span>{submitMessage}</span>
          </StatusMessage>
        )}
      </form>
    </FormContainer>
  );
};

export default ContactForm;

// Styled Components
const FormContainer = styled(Box)`
  padding: 2rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: box-shadow 0.3s ease;
  position: relative;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  position: relative;
`;

const TextArea = styled.textarea<{ error?: string }>`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme, error }) => 
    error ? theme.colors.error.main : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.default};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: ${({ theme, error }) => 
      error ? theme.colors.error.dark : theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme, error }) => 
      error ? `${theme.colors.error.light}80` : `${theme.colors.primary}20`};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.grey[100]};
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.placeholder};
  }
`;

const ErrorMessage = styled.span`
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.error.main};
  line-height: 1.4;
`;

const StatusMessage = styled.div<{ success?: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 1.5rem;
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme, success }) => 
    success ? theme.colors.success.light : theme.colors.error.light};
  color: ${({ theme, success }) => 
    success ? theme.colors.success.dark : theme.colors.error.dark};
  font-size: 0.9375rem;
  line-height: 1.5;
  animation: ${keyframes`
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  `} 0.3s ease-out;
  
  .icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
    flex-shrink: 0;
  }
`;
