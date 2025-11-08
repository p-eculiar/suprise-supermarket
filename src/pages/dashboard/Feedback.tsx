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

      if (error) throw error;
      setFeedbackList(data || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
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
      const { error } = await supabase
        .from('feedback')
        .insert([{
          user_id: user.id,
          rating: newFeedback.rating,
          category: newFeedback.category,
          message: newFeedback.message
        }]);

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setNewFeedback({ rating: 0, category: 'Product Quality', message: '' });
      loadFeedback();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
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
            <Label>Your Feedback</Label>
            <TextArea
              placeholder="Tell us about your experience..."
              value={newFeedback.message}
              onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
              rows={5}
            />
          </FormGroup>
        </FormBody>
        <FormFooter>
          <SubmitButton onClick={handleSubmitFeedback} disabled={isSubmitting}>
            <FiSend /> {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </SubmitButton>
        </FormFooter>
      </FeedbackForm>

      {/* Feedback History */}
      <FeedbackHistory>
        <HistoryHeader>
          <h3>Your Feedback History</h3>
        </HistoryHeader>

        {feedbackList.length === 0 ? (
          <EmptyState>
            <FiMessageSquare />
            <h3>No feedback yet</h3>
            <p>Share your first experience with us!</p>
          </EmptyState>
        ) : (
          <FeedbackList>
            {feedbackList.map((feedback) => (
              <FeedbackCard key={feedback.id} onClick={() => setSelectedFeedback(feedback)}>
                <FeedbackCardHeader>
                  <FeedbackRating>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        fill={star <= feedback.rating ? getRatingColor(feedback.rating) : 'none'}
                        color={star <= feedback.rating ? getRatingColor(feedback.rating) : '#DFE6E9'}
                      />
                    ))}
                    <span>{feedback.rating} / 5</span>
                  </FeedbackRating>
                  <CategoryBadge>{feedback.category}</CategoryBadge>
                </FeedbackCardHeader>

                <FeedbackMessage>{feedback.message.slice(0, 150)}...</FeedbackMessage>

                <FeedbackCardFooter>
                  <FeedbackDate>
                    <FiClock />
                    {new Date(feedback.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </FeedbackDate>
                  {feedback.admin_response ? (
                    <ResponseBadge>
                      <FiCheckCircle /> Response received
                    </ResponseBadge>
                  ) : (
                    <PendingBadge>
                      <FiClock /> Pending review
                    </PendingBadge>
                  )}
                </FeedbackCardFooter>
              </FeedbackCard>
            ))}
          </FeedbackList>
        )}
      </FeedbackHistory>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <Modal onClick={() => setSelectedFeedback(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2>Feedback Details</h2>
                <CategoryBadge>{selectedFeedback.category}</CategoryBadge>
              </div>
              <ModalCloseButton onClick={() => setSelectedFeedback(null)}>×</ModalCloseButton>
            </ModalHeader>

            <ModalBody>
              <FeedbackThread>
                <ThreadItem $isUser>
                  <ThreadHeader>
                    <ThreadLabel>Your Feedback</ThreadLabel>
                    <FeedbackRating>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          fill={star <= selectedFeedback.rating ? getRatingColor(selectedFeedback.rating) : 'none'}
                          color={star <= selectedFeedback.rating ? getRatingColor(selectedFeedback.rating) : '#DFE6E9'}
                        />
                      ))}
                      <span>{selectedFeedback.rating} / 5</span>
                    </FeedbackRating>
                  </ThreadHeader>
                  <ThreadDate>{new Date(selectedFeedback.created_at).toLocaleString()}</ThreadDate>
                  <ThreadMessage>{selectedFeedback.message}</ThreadMessage>
                </ThreadItem>

                {selectedFeedback.admin_response ? (
                  <ThreadItem $isUser={false}>
                    <ThreadHeader>
                      <ThreadLabel>Our Response</ThreadLabel>
                    </ThreadHeader>
                    <ThreadMessage>{selectedFeedback.admin_response}</ThreadMessage>
                  </ThreadItem>
                ) : (
                  <WaitingMessage>
                    <FiClock />
                    <p>Thank you! We're reviewing your feedback.</p>
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

export default Feedback;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #636E72;
  font-size: 1rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
`;

const FeedbackForm = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%);
  color: white;

  h3 {
    font-size: 1.25rem;
    margin: 0;
  }

  svg {
    font-size: 1.5rem;
  }
`;

const FormBody = styled.div`
  padding: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #2D3436;
`;

const RatingSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarButton = styled.button<{ $active: boolean; $color: string }>`
  width: 48px;
  height: 48px;
  border: 2px solid ${({ $active, $color }) => ($active ? $color : '#DFE6E9')};
  background: ${({ $active, $color }) => ($active ? `${$color}20` : 'white')};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
    fill: ${({ $active, $color }) => ($active ? $color : 'none')};
    stroke: ${({ $active, $color }) => ($active ? $color : '#DFE6E9')};
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const RatingText = styled.span`
  margin-left: 0.5rem;
  font-weight: 600;
  color: #636E72;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
`;

const FormFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #DFE6E9;
  display: flex;
  justify-content: flex-end;
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #5A8470;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FeedbackHistory = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const HistoryHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;

  h3 {
    font-size: 1.25rem;
    color: #2D3436;
    margin: 0;
  }
`;

const FeedbackList = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeedbackCard = styled.div`
  padding: 1.5rem;
  border: 2px solid #F8F9FA;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #6C9A7F;
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.15);
    transform: translateY(-2px);
  }
`;

const FeedbackCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const FeedbackRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 18px;
    height: 18px;
  }

  span {
    margin-left: 0.5rem;
    font-weight: 600;
    color: #636E72;
  }
`;

const CategoryBadge = styled.div`
  padding: 0.375rem 0.875rem;
  background: #6C9A7F20;
  color: #6C9A7F;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
`;

const FeedbackMessage = styled.p`
  color: #636E72;
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const FeedbackCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FeedbackDate = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const ResponseBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #27AE60;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const PendingBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #F39C12;
  font-weight: 600;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;

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
`;
