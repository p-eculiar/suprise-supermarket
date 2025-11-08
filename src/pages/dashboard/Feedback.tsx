import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import toast from '../../components/common/Toast';
import { FiStar, FiSend, FiMessageSquare, FiCheckCircle, FiClock } from 'react-icons/fi';

interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  message: string;
  admin_response?: string;
  created_at: string;
}

const categories = [
  'Product Quality',
  'Delivery Service',
  'Customer Support',
  'Website Experience',
  'Pricing',
  'Other'
];

const Feedback: React.FC = () => {
  const { user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [newFeedback, setNewFeedback] = useState({
    rating: 0,
    category: 'Product Quality',
    message: ''
  });
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    if (user) {
      loadFeedback();
    }
  }, [user]);

  const loadFeedback = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading feedback:', error);
        // If table doesn't exist or other error, show empty state
        setFeedbackList([]);
        return;
      }
      setFeedbackList(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      // If table doesn't exist, show empty state
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!user || !newFeedback.rating || !newFeedback.message.trim()) {
      toast.error('Please provide a rating and message');
      return;
    }

    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user.id,
          rating: newFeedback.rating,
          category: newFeedback.category,
          message: newFeedback.message
        }])
        .select();

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setNewFeedback({ rating: 0, category: 'Product Quality', message: '' });
      loadFeedback();
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      toast.error(`Failed to submit feedback: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return '#27AE60';
    if (rating >= 3) return '#F39C12';
    return '#E74C3C';
  };

  const averageRating = feedbackList.length > 0
    ? (feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <p>Loading your feedback...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Feedback & Reviews</Title>
          <Subtitle>Share your experience with us</Subtitle>
        </div>
      </Header>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiStar />
          </StatIcon>
          <StatInfo>
            <StatLabel>Average Rating</StatLabel>
            <StatValue>{averageRating} / 5.0</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3498DB">
            <FiMessageSquare />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Feedback</StatLabel>
            <StatValue>{feedbackList.length}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#27AE60">
            <FiCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>Responded</StatLabel>
            <StatValue>{feedbackList.filter(f => f.admin_response).length}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Submit New Feedback */}
      <FeedbackForm>
        <FormHeader>
          <h3>Submit New Feedback</h3>
          <FiSend />
        </FormHeader>
        <FormBody>
          <FormGroup>
            <Label>Rate Your Experience</Label>
            <RatingSelector>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarButton
                  key={star}
                  $active={star <= (hoverRating || newFeedback.rating)}
                  $color={getRatingColor(hoverRating || newFeedback.rating)}
                  onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <FiStar />
                </StarButton>
              ))}
              <RatingText>
                {newFeedback.rating > 0 ? `${newFeedback.rating} / 5` : 'Select rating'}
              </RatingText>
            </RatingSelector>
          </FormGroup>

          <FormGroup>
            <Label>Category</Label>
            <Select
              value={newFeedback.category}
              onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>Feedback Message</Label>
            <TextArea
              placeholder="Tell us about your experience..."
              value={newFeedback.message}
              onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
              rows={5}
            />
          </FormGroup>

          <SubmitButton 
            onClick={handleSubmitFeedback} 
            disabled={isSubmitting || !newFeedback.rating || !newFeedback.message.trim()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            <FiSend />
          </SubmitButton>
        </FormBody>
      </FeedbackForm>

      {/* Feedback List */}
      <SectionTitle>Your Feedback History</SectionTitle>
      {feedbackList.length === 0 ? (
        <EmptyState>
          <FiMessageSquare />
          <h3>No feedback yet</h3>
          <p>Share your experience with us by submitting feedback above</p>
        </EmptyState>
      ) : (
        <FeedbackList>
          {feedbackList.map((feedback) => (
            <FeedbackCard 
              key={feedback.id} 
              onClick={() => setSelectedFeedback(feedback)}
              $hasResponse={!!feedback.admin_response}
            >
              <FeedbackHeader>
                <div>
                  <FeedbackRating>
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        style={{ 
                          color: i < feedback.rating ? getRatingColor(feedback.rating) : '#DFE6E9',
                          fill: i < feedback.rating ? getRatingColor(feedback.rating) : 'none'
                        }} 
                      />
                    ))}
                  </FeedbackRating>
                  <FeedbackCategory>{feedback.category}</FeedbackCategory>
                </div>
                <FeedbackDate>
                  {new Date(feedback.created_at).toLocaleDateString()}
                </FeedbackDate>
              </FeedbackHeader>
              <FeedbackMessage>
                {feedback.message.length > 100 
                  ? `${feedback.message.substring(0, 100)}...` 
                  : feedback.message}
              </FeedbackMessage>
              {feedback.admin_response && (
                <ResponseStatus>
                  <FiCheckCircle />
                  <span>Response received</span>
                </ResponseStatus>
              )}
            </FeedbackCard>
          ))}
        </FeedbackList>
      )}

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <Modal onClick={() => setSelectedFeedback(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2>Feedback Details</h2>
                <p>Submitted on {new Date(selectedFeedback.created_at).toLocaleString()}</p>
              </div>
              <ModalCloseButton onClick={() => setSelectedFeedback(null)}>
                ×
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <FeedbackThread>
                <ThreadItem $isUser={true}>
                  <ThreadHeader>
                    <ThreadLabel>You</ThreadLabel>
                  </ThreadHeader>
                  <ThreadDate>
                    {new Date(selectedFeedback.created_at).toLocaleString()}
                  </ThreadDate>
                  <ThreadMessage>
                    {selectedFeedback.message}
                  </ThreadMessage>
                </ThreadItem>
                
                {selectedFeedback.admin_response ? (
                  <ThreadItem $isUser={false}>
                    <ThreadHeader>
                      <ThreadLabel>Support Team</ThreadLabel>
                    </ThreadHeader>
                    <ThreadDate>
                      {selectedFeedback.admin_response && 'Response date placeholder'}
                    </ThreadDate>
                    <ThreadMessage>
                      {selectedFeedback.admin_response}
                    </ThreadMessage>
                  </ThreadItem>
                ) : (
                  <WaitingMessage>
                    <FiClock />
                    <p>Waiting for response</p>
                    <span>We'll get back to you soon</span>
                  </WaitingMessage>
                )}
              </FeedbackThread>
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
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1.25rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: ${({ $color }) => `${$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
  font-size: 1.75rem;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }
`;

const StatInfo = styled.div``;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const FeedbackForm = styled.div`
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

const FormHeader = styled.div`
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
  
  svg {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: 768px) {
    h3 {
      font-size: 1.25rem;
    }
  }
`;

const FormBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

const RatingSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarButton = styled.button<{ $active: boolean; $color: string }>`
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: ${({ $active, $color }) => ($active ? $color : '#DFE6E9')};
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 50%;
  
  svg {
    fill: ${({ $active, $color }) => ($active ? $color : 'none')};
  }
  
  &:hover {
    transform: scale(1.1);
    background: ${({ $color }) => `${$color}10`};
  }
`;

const RatingText = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-left: 0.5rem;
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
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
  min-height: 120px;
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

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
    width: 100%;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const FeedbackList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FeedbackCard = styled.div<{ $hasResponse: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid ${({ $hasResponse, theme }) => 
    $hasResponse ? theme.colors.status.success : theme.colors.status.info};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
  }
`;

const FeedbackHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FeedbackRating = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const FeedbackCategory = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
  margin-top: 0.5rem;
`;

const FeedbackDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const FeedbackMessage = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ResponseStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.status.success};
  font-weight: 600;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  svg {
    font-size: 3rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
  }
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

const FeedbackThread = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ThreadItem = styled.div<{ $isUser: boolean }>`
  padding: 1.25rem;
  background: ${({ $isUser }) => ($isUser ? '#F0F7F5' : '#F8F9FA')};
  border-left: 4px solid ${({ $isUser }) => ($isUser ? '#6C9A7F' : '#3498DB')};
  border-radius: 8px;
`;

const ThreadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ThreadLabel = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: #2D3436;
`;

const ThreadDate = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  margin-bottom: 0.75rem;
`;

const ThreadMessage = styled.p`
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

export default Feedback;