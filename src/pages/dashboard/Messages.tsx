import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import toast from '../../components/common/Toast';
import { FiSend, FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface Message {
  id: string;
  subject: string;
  message: string;
  admin_response?: string;
  status: 'open' | 'replied' | 'closed';
  created_at: string;
  responded_at?: string;
}

const Messages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isComposing, setIsComposing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Realtime updates for user's messages
  useRealtime({
    table: 'messages',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    filter: user ? { column: 'user_id', value: user.id } : undefined,
    onEvent: () => loadMessages(),
    channelName: 'user-messages-realtime'
  });

  const loadMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading messages:', error);
        // If table doesn't exist or other error, show empty state
        setMessages([]);
        return;
      }
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      // If table doesn't exist, show empty state
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.subject.trim() || !newMessage.message.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          user_id: user.id,
          subject: newMessage.subject,
          message: newMessage.message,
          status: 'open'
        }])
        .select();

      if (error) throw error;

      toast.success('Message sent successfully!');
      setNewMessage({ subject: '', message: '' });
      setIsComposing(false);
      loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(`Failed to send message: ${error.message || 'Please try again.'}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return '#F39C12';
      case 'replied':
        return '#27AE60';
      case 'closed':
        return '#95A5A6';
      default:
        return '#95A5A6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <FiClock />;
      case 'replied':
        return <FiCheckCircle />;
      case 'closed':
        return <FiAlertCircle />;
      default:
        return <FiMessageSquare />;
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <p>Loading messages...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Messages</Title>
          <Subtitle>Communicate with our support team</Subtitle>
        </div>
        <NewMessageButton onClick={() => setIsComposing(true)}>
          <FiMessageSquare /> New Message
        </NewMessageButton>
      </Header>

      {isComposing && (
        <ComposeCard>
          <ComposeHeader>
            <h3>New Message</h3>
            <CloseButton onClick={() => setIsComposing(false)}>×</CloseButton>
          </ComposeHeader>
          <ComposeBody>
            <FormGroup>
              <Label>Subject</Label>
              <Input
                type="text"
                placeholder="What's this about?"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              />
            </FormGroup>
            <FormGroup>
              <Label>Message</Label>
              <TextArea
                placeholder="Describe your question or issue..."
                value={newMessage.message}
                onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                rows={6}
              />
            </FormGroup>
          </ComposeBody>
          <ComposeFooter>
            <CancelButton onClick={() => setIsComposing(false)}>Cancel</CancelButton>
            <SendButton onClick={handleSendMessage}>
              <FiSend /> Send Message
            </SendButton>
          </ComposeFooter>
        </ComposeCard>
      )}

      {messages.length === 0 ? (
        <EmptyState>
          <FiMessageSquare />
          <h3>No messages yet</h3>
          <p>Start a conversation with our support team by clicking "New Message"</p>
        </EmptyState>
      ) : (
        <MessagesList>
          {messages.map((msg) => (
            <MessageCard key={msg.id} onClick={() => setSelectedMessage(msg)}>
              <MessageHeader>
                <MessageSubject>{msg.subject}</MessageSubject>
                <StatusBadge $color={getStatusColor(msg.status)}>
                  {getStatusIcon(msg.status)}
                  {msg.status}
                </StatusBadge>
              </MessageHeader>
              <MessagePreview>
                {msg.message.length > 100 
                  ? `${msg.message.substring(0, 100)}...` 
                  : msg.message}
              </MessagePreview>
              <MessageFooter>
                <MessageDate>
                  {new Date(msg.created_at).toLocaleDateString()}
                </MessageDate>
                {msg.admin_response && (
                  <ResponseIndicator>
                    <FiCheckCircle />
                    <span>Response received</span>
                  </ResponseIndicator>
                )}
              </MessageFooter>
            </MessageCard>
          ))}
        </MessagesList>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <Modal onClick={() => setSelectedMessage(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2>{selectedMessage.subject}</h2>
                <p>Sent on {new Date(selectedMessage.created_at).toLocaleString()}</p>
              </div>
              <ModalCloseButton onClick={() => setSelectedMessage(null)}>
                ×
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <MessageThread>
                <ThreadMessage $isUser={true}>
                  <ThreadLabel>You</ThreadLabel>
                  <ThreadDate>
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </ThreadDate>
                  <ThreadText>
                    {selectedMessage.message}
                  </ThreadText>
                </ThreadMessage>
                
                {selectedMessage.admin_response ? (
                  <ThreadMessage $isUser={false}>
                    <ThreadLabel>Support Team</ThreadLabel>
                    <ThreadDate>
                      {selectedMessage.responded_at 
                        ? new Date(selectedMessage.responded_at).toLocaleString()
                        : 'Response date not available'}
                    </ThreadDate>
                    <ThreadText>
                      {selectedMessage.admin_response}
                    </ThreadText>
                  </ThreadMessage>
                ) : (
                  <WaitingMessage>
                    <FiClock />
                    <p>Waiting for response</p>
                    <span>We'll get back to you soon</span>
                  </WaitingMessage>
                )}
              </MessageThread>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const NewMessageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F; /* Sidebar green color */
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470; /* Darker green on hover */
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    justify-content: center;
  }
`;

const ComposeCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const ComposeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  font-size: 1.25rem;
  cursor: pointer;
  color: #636E72;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #DFE6E9;
  }
`;

const ComposeBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text.primary};
  resize: vertical;
  min-height: 150px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const ComposeFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  padding: 0.875rem 1.5rem;
  background: #F8F9FA;
  color: #636E72;
  border: 1px solid #DFE6E9;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #DFE6E9;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const SendButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F; /* Sidebar green color */
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470; /* Darker green on hover */
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  svg {
    font-size: 4rem;
    color: #DFE6E9;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #2D3436;
    margin-bottom: 0.5rem;
  }

  p {
    color: #636E72;
    margin: 0;
  }
`;

const MessagesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const MessageCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const MessageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const MessageSubject = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  font-weight: 600;
  font-size: 0.875rem;
  
  svg {
    font-size: 1rem;
  }
`;

const MessagePreview = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const MessageFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const MessageDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ResponseIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #2D7A2D; /* Success green color from theme */
  font-weight: 600;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;

  p {
    margin-top: 1rem;
    color: #636E72;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6C9A7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Modal = styled.div`
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
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    max-width: 95vw;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;

  > div {
    h2 {
      font-size: 1.5rem;
      color: #2D3436;
      margin: 0 0 0.5rem 0;
    }
    
    p {
      color: #636E72;
      margin: 0;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    
    > div h2 {
      font-size: 1.25rem;
    }
  }
`;

const ModalCloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636E72;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #DFE6E9;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const MessageThread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ThreadMessage = styled.div<{ $isUser: boolean }>`
  padding: 1.25rem;
  background: ${({ $isUser }) => ($isUser ? '#F0F7F5' : '#F8F9FA')};
  border-left: 4px solid ${({ $isUser }) => ($isUser ? '#6C9A7F' : '#3498DB')};
  border-radius: 8px;
`;

const ThreadLabel = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ThreadDate = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  margin-bottom: 0.75rem;
`;

const ThreadText = styled.p`
  color: #2D3436;
  line-height: 1.6;
  margin: 0;
`;

const WaitingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: #FFF9E6;
  border-radius: 8px;
  color: #F39C12;

  svg {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin: 0;
    font-weight: 600;
  }
  
  span {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: normal;
  }
`;

export default Messages;