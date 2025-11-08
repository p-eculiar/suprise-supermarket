import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { FiMessageSquare, FiStar, FiRefreshCw, FiCheck, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';

interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  category: string;
  message: string;
  admin_response?: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface Message {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  admin_response?: string;
  status: 'open' | 'replied' | 'closed';
  created_at: string;
  responded_at?: string;
  user_email?: string;
  user_name?: string;
}

const RealtimeData: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feedback' | 'messages'>('feedback');
  const [selectedItem, setSelectedItem] = useState<Feedback | Message | null>(null);

  // Load feedback and messages
  const loadData = async () => {
    try {
      console.log('Loading data...');
      setLoading(true);
      
      // Load feedback with user info
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select(`
          *,
          user:profiles(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (feedbackError) {
        console.error('Feedback error:', feedbackError);
        throw feedbackError;
      }

      // Enhance feedback with user info
      const enhancedFeedback = feedbackData?.map(item => ({
        ...item,
        user_email: item.user?.email || 'Unknown',
        user_name: item.user?.full_name || 'Unknown User'
      })) || [];

      console.log('Loaded feedback:', enhancedFeedback);
      setFeedback(enhancedFeedback);

      // Load messages with user info
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          user:profiles(email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (messagesError) {
        console.error('Messages error:', messagesError);
        throw messagesError;
      }

      // Enhance messages with user info
      const enhancedMessages = messagesData?.map(item => ({
        ...item,
        user_email: item.user?.email || 'Unknown',
        user_name: item.user?.full_name || 'Unknown User'
      })) || [];

      console.log('Loaded messages:', enhancedMessages);
      setMessages(enhancedMessages);
    } catch (error) {
      console.error('Error loading data:', error);
      // Still set empty arrays to avoid infinite loading state
      setFeedback([]);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Realtime updates for feedback
  useRealtime({
    table: 'feedback',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: (payload) => {
      console.log('Feedback real-time event:', payload);
      loadData();
    },
    channelName: 'admin-feedback-realtime'
  });

  // Realtime updates for messages
  useRealtime({
    table: 'messages',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: (payload) => {
      console.log('Messages real-time event:', payload);
      loadData();
    },
    channelName: 'admin-messages-realtime'
  });

  useEffect(() => {
    loadData();
  }, []);

  // Also reload data when the component mounts to ensure we have the latest data
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        loadData();
      }
    }, 3000); // Load data after 3 seconds if still loading

    return () => clearTimeout(timer);
  }, [loading]);

  const handleMarkAsResponded = async (type: 'feedback' | 'message', id: string) => {
    try {
      if (type === 'feedback') {
        const { error } = await supabase
          .from('feedback')
          .update({ admin_response: 'Acknowledged' })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('messages')
          .update({ status: 'replied', admin_response: 'Acknowledged', responded_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      }

      loadData();
    } catch (error) {
      console.error('Error marking as responded:', error);
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

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#27AE60';
    if (rating >= 3) return '#F39C12';
    return '#E74C3C';
  };

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <p>Loading real-time data...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <TitleSection>
          <Title>Real-Time Data</Title>
          <Subtitle>Monitor user feedback and messages in real-time</Subtitle>
        </TitleSection>
        <Actions>
          <RefreshButton onClick={loadData}>
            <FiRefreshCw /> Refresh
          </RefreshButton>
        </Actions>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiStar />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Feedback</StatLabel>
            <StatValue>{feedback.length}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3498DB">
            <FiMessageSquare />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Messages</StatLabel>
            <StatValue>{messages.length}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#F39C12">
            <FiClock />
          </StatIcon>
          <StatInfo>
            <StatLabel>Pending Messages</StatLabel>
            <StatValue>{messages.filter(m => m.status === 'open').length}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#27AE60">
            <FiCheck />
          </StatIcon>
          <StatInfo>
            <StatLabel>Responded</StatLabel>
            <StatValue>
              {feedback.filter(f => f.admin_response).length + messages.filter(m => m.status === 'replied' || m.status === 'closed').length}
            </StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <Tabs>
        <TabButton 
          $active={activeTab === 'feedback'} 
          onClick={() => setActiveTab('feedback')}
        >
          <FiStar /> Feedback ({feedback.length})
        </TabButton>
        <TabButton 
          $active={activeTab === 'messages'} 
          onClick={() => setActiveTab('messages')}
        >
          <FiMessageSquare /> Messages ({messages.length})
        </TabButton>
      </Tabs>

      {activeTab === 'feedback' ? (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feedback.map((item) => (
              <TableRow key={item.id} onClick={() => setSelectedItem(item)}>
                <TableCell>
                  <UserInfo>
                    <UserIcon>
                      <FiUser />
                    </UserIcon>
                    <div>
                      <UserName>{item.user_name}</UserName>
                      <UserEmail>{item.user_email}</UserEmail>
                    </div>
                  </UserInfo>
                </TableCell>
                <TableCell>
                  <Rating $color={getRatingColor(item.rating)}>
                    <FiStar /> {item.rating}
                  </Rating>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>
                  <MessagePreview>{item.message.substring(0, 50)}...</MessagePreview>
                </TableCell>
                <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  {item.admin_response ? (
                    <StatusBadge $color="#27AE60">Responded</StatusBadge>
                  ) : (
                    <StatusBadge $color="#F39C12">Pending</StatusBadge>
                  )}
                </TableCell>
                <TableCell>
                  {!item.admin_response && (
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsResponded('feedback', item.id);
                    }}>
                      <FiCheck /> Mark as Responded
                    </ActionButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      ) : (
        <DataTable>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((item) => (
              <TableRow key={item.id} onClick={() => setSelectedItem(item)}>
                <TableCell>
                  <UserInfo>
                    <UserIcon>
                      <FiUser />
                    </UserIcon>
                    <div>
                      <UserName>{item.user_name}</UserName>
                      <UserEmail>{item.user_email}</UserEmail>
                    </div>
                  </UserInfo>
                </TableCell>
                <TableCell>{item.subject}</TableCell>
                <TableCell>
                  <MessagePreview>{item.message.substring(0, 50)}...</MessagePreview>
                </TableCell>
                <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <StatusBadge $color={getStatusColor(item.status)}>
                    {item.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {item.status === 'open' && (
                    <ActionButton onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsResponded('message', item.id);
                    }}>
                      <FiCheck /> Mark as Responded
                    </ActionButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {selectedItem && (
        <Modal onClick={() => setSelectedItem(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>{activeTab === 'feedback' ? 'Feedback Details' : 'Message Details'}</h2>
              <CloseButton onClick={() => setSelectedItem(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailRow>
                <DetailLabel>User:</DetailLabel>
                <DetailValue>
                  <UserInfo>
                    <UserIcon>
                      <FiUser />
                    </UserIcon>
                    <div>
                      <UserName>{(selectedItem as any).user_name}</UserName>
                      <UserEmail>{(selectedItem as any).user_email}</UserEmail>
                    </div>
                  </UserInfo>
                </DetailValue>
              </DetailRow>
              
              {activeTab === 'feedback' && (
                <>
                  <DetailRow>
                    <DetailLabel>Rating:</DetailLabel>
                    <DetailValue>
                      <Rating $color={getRatingColor((selectedItem as Feedback).rating)}>
                        <FiStar /> {(selectedItem as Feedback).rating} / 5
                      </Rating>
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Category:</DetailLabel>
                    <DetailValue>{(selectedItem as Feedback).category}</DetailValue>
                  </DetailRow>
                </>
              )}
              
              {activeTab === 'messages' && (
                <DetailRow>
                  <DetailLabel>Subject:</DetailLabel>
                  <DetailValue>{(selectedItem as Message).subject}</DetailValue>
                </DetailRow>
              )}
              
              <DetailRow>
                <DetailLabel>Date:</DetailLabel>
                <DetailValue>{format(new Date(selectedItem.created_at), 'MMM dd, yyyy h:mm a')}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Message:</DetailLabel>
                <DetailValue>
                  <MessageText>{selectedItem.message}</MessageText>
                </DetailValue>
              </DetailRow>
              
              {activeTab === 'feedback' && (selectedItem as Feedback).admin_response && (
                <DetailRow>
                  <DetailLabel>Admin Response:</DetailLabel>
                  <DetailValue>
                    <MessageText>{(selectedItem as Feedback).admin_response}</MessageText>
                  </DetailValue>
                </DetailRow>
              )}
              
              {activeTab === 'messages' && (selectedItem as Message).admin_response && (
                <DetailRow>
                  <DetailLabel>Admin Response:</DetailLabel>
                  <DetailValue>
                    <MessageText>{(selectedItem as Message).admin_response}</MessageText>
                    <ResponseDate>
                      Responded: {format(new Date((selectedItem as Message).responded_at!), 'MMM dd, yyyy h:mm a')}
                    </ResponseDate>
                  </DetailValue>
                </DetailRow>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default RealtimeData;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TitleSection = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #636E72;
  margin: 0;
`;

const Actions = styled.div``;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  padding-bottom: 1rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ $active }) => ($active ? 'white' : 'transparent')};
  border: 1px solid #E1E8ED;
  border-bottom: ${({ $active }) => ($active ? '2px solid #6C9A7F' : '1px solid #E1E8ED')};
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #F8F9FA;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const DataTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #F8F9FA;
  border-bottom: 1px solid #E1E8ED;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 2fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid #E1E8ED;
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #F8F9FA;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHead = styled.div`
  font-weight: 700;
  color: #2D3436;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableBody = styled.div``;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.875rem;
  color: #636E72;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #636E72;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #2D3436;
  font-size: 0.875rem;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const Rating = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ $color }) => $color};
  font-weight: 600;
`;

const MessagePreview = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StatusBadge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  text-transform: capitalize;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #636E72;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #E1E8ED;
  border-top: 4px solid #6C9A7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
  
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
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
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

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  width: 120px;
  font-weight: 600;
  color: #2D3436;
`;

const DetailValue = styled.div`
  flex: 1;
  color: #636E72;
`;

const MessageText = styled.div`
  background: #F8F9FA;
  padding: 1rem;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const ResponseDate = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
  text-align: right;
`;