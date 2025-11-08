import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiX, FiSend, FiUsers, FiUser } from 'react-icons/fi';
import { EmailNotificationService } from '../../services/emailService';
import { SMTPEmailService } from '../../services/smtpEmailService';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
  profile_status: 'active' | 'inactive' | 'banned';
  totalOrders: number;
  totalSpent: number;
  created_at: string;
  updated_at: string;
}

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
  allUsers: User[];
  onEmailSent: () => void;
}

const BulkEmailModal: React.FC<BulkEmailModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedUsers, 
  allUsers,
  onEmailSent
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendToAll, setSendToAll] = useState(false);
  const [progress, setProgress] = useState({ sent: 0, total: 0, failed: 0 });
  const [statusMessage, setStatusMessage] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setContent('');
      setSendToAll(false);
      setProgress({ sent: 0, total: 0, failed: 0 });
      setStatusMessage('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      alert('Please fill in both subject and content');
      return;
    }

    // Determine recipients
    const recipients = sendToAll ? allUsers : selectedUsers;
    
    // Check if there are any recipients
    if (recipients.length === 0) {
      alert('Please select at least one user to send emails to');
      return;
    }

    setIsSending(true);
    setStatusMessage('Preparing to send emails...');
    
    setProgress({ sent: 0, total: recipients.length, failed: 0 });

    try {
      // Check if EmailJS SMTP service is configured
      if (SMTPEmailService.isConfigured()) {
        // Log the current configuration for debugging
        console.log('EmailJS Configuration Check:', {
          serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
          templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
          userId: process.env.REACT_APP_EMAILJS_USER_ID
        });

        setStatusMessage('Sending emails via EmailJS SMTP service...');
        
        try {
          // Prepare recipients for EmailJS SMTP service
          const smtpRecipients = recipients.map(user => ({
            email: user.email,
            name: user.full_name,
          }));

          // Create HTML template
          const htmlTemplate = `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                  .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                  .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>${subject}</h1>
                  </div>
                  <div class="content">
                    <p>Hi {{name}},</p>
                    <div>${content.replace(/\n/g, '<br />')}</div>
                  </div>
                  <div class="footer">
                    <p>You're receiving this email because you're a registered user at Surprise Supermarket.</p>
                    <p>&copy; ${new Date().getFullYear()} Surprise Supermarket. All rights reserved.</p>
                  </div>
                </div>
              </body>
            </html>
          `;

          // Send bulk emails via EmailJS SMTP service
          const result = await SMTPEmailService.sendBulkEmails(
            smtpRecipients,
            subject,
            htmlTemplate,
            undefined,
            100 // 100ms delay between emails
          );

          // Log notifications in database
          for (const recipient of recipients) {
            await EmailNotificationService.supabase.from('email_notifications').insert({
              user_email: recipient.email,
              user_name: recipient.full_name,
              notification_type: 'bulk_email',
              subject: subject,
              content: content,
              status: result.errors.some((error: string) => error.includes(recipient.email)) ? 'failed' : 'sent',
              sent_at: result.errors.some((error: string) => error.includes(recipient.email)) ? null : new Date().toISOString(),
            });
          }

          setStatusMessage(`Completed via EmailJS SMTP service! Sent: ${result.sent}, Failed: ${result.failed}`);
        } catch (error) {
          console.error('Error sending via EmailJS SMTP service:', error);
          setStatusMessage(`Error: ${(error as Error).message}`);
        }
      } else {
        // EmailJS not configured
        setStatusMessage('EmailJS SMTP service not configured. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_USER_ID in your .env file.');
      }

      onEmailSent();
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error sending bulk emails:', error);
      setStatusMessage('Error occurred while sending emails');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  const recipientCount = sendToAll ? allUsers.length : selectedUsers.length;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Bulk Email</h2>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <RecipientInfo>
            <FiUsers />
            <span>
              Sending to {recipientCount} user{recipientCount !== 1 ? 's' : ''}{' '}
              {sendToAll ? '(All Users)' : '(Selected Users)'}
            </span>
          </RecipientInfo>
          
          {!sendToAll && selectedUsers.length > 0 && (
            <SelectedUsersPreview>
              <small>Selected users:</small>
              <UserList>
                {selectedUsers.slice(0, 3).map(user => (
                  <UserItem key={user.id}>
                    <FiUser />
                    <span>{user.full_name || user.email}</span>
                  </UserItem>
                ))}
                {selectedUsers.length > 3 && (
                  <UserItem>
                    <span>+{selectedUsers.length - 3} more</span>
                  </UserItem>
                )}
              </UserList>
            </SelectedUsersPreview>
          )}
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>Send to:</Label>
              <RadioGroup>
                <label>
                  <input
                    type="radio"
                    checked={!sendToAll}
                    onChange={() => setSendToAll(false)}
                    disabled={isSending}
                  />
                  Selected Users ({selectedUsers.length})
                </label>
                <label>
                  <input
                    type="radio"
                    checked={sendToAll}
                    onChange={() => setSendToAll(true)}
                    disabled={isSending}
                  />
                  All Users ({allUsers.length})
                </label>
              </RadioGroup>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSending}
                placeholder="Enter email subject"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="content">Content *</Label>
              <TextArea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSending}
                placeholder="Enter email content. You can include links and they will be clickable."
                required
                rows={8}
              />
              <HelpText>
                You can include links in your content. Line breaks will be preserved.
              </HelpText>
            </FormGroup>
            
            {isSending && (
              <ProgressSection>
                <ProgressBar>
                  <div 
                    className="progress-fill" 
                    style={{ 
                      width: `${progress.total > 0 ? (progress.sent + progress.failed) / progress.total * 100 : 0}%` 
                    }}
                  />
                </ProgressBar>
                <ProgressText>
                  {statusMessage} ({progress.sent} sent, {progress.failed} failed)
                </ProgressText>
              </ProgressSection>
            )}
            
            {statusMessage && !isSending && (
              <StatusMessage>{statusMessage}</StatusMessage>
            )}
            
            <FormActions>
              <Button type="button" $secondary onClick={onClose} disabled={isSending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSending || !subject.trim() || !content.trim()}>
                <FiSend />
                {isSending ? 'Sending...' : 'Send Emails'}
              </Button>
            </FormActions>
          </Form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BulkEmailModal;

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636E72;
  
  &:hover {
    color: #2D3436;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const RecipientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #636E72;
  
  svg {
    color: #6C9A7F;
  }
`;

const SelectedUsersPreview = styled.div`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  
  small {
    display: block;
    margin-bottom: 0.5rem;
    color: #636E72;
    font-weight: 600;
  }
`;

const UserList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: 20px;
  font-size: 0.8rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const Form = styled.form``;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2D3436;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  
  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: normal;
  }
  
  input[type="radio"] {
    margin: 0;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
  
  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
  
  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
`;

const HelpText = styled.small`
  display: block;
  margin-top: 0.5rem;
  color: #636E72;
`;

const ProgressSection = styled.div`
  margin: 1.5rem 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #E1E8ED;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  
  .progress-fill {
    height: 100%;
    background: #6C9A7F;
    transition: width 0.3s ease;
  }
`;

const ProgressText = styled.div`
  font-size: 0.9rem;
  color: #636E72;
  text-align: center;
`;

const StatusMessage = styled.div`
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  text-align: center;
  background: #6C9A7F15;
  color: #6C9A7F;
  font-weight: 500;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button<{ $secondary?: boolean }>`
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$secondary ? '#95A5A6' : '#6C9A7F'};
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    background: ${props => props.$secondary ? '#7F8C8D' : '#5A8569'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #BDC3C7;
    cursor: not-allowed;
    transform: none;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;