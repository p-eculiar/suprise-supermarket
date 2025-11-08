import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FiGift, FiUser, FiMapPin, FiCreditCard, FiCheck } from 'react-icons/fi';

const DiasporaCheckout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { basket, currency } = location.state || {};

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [senderData, setSenderData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'United States',
  });

  const [recipientData, setRecipientData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    lga: '',
  });

  const [giftData, setGiftData] = useState({
    message: '',
    deliveryInstructions: '',
    preferredDeliveryDate: '',
  });

  if (!basket) {
    return (
      <Container>
        <ErrorCard>
          <h2>No basket selected</h2>
          <button onClick={() => navigate('/diaspora-gifting')}>Back to Gift Baskets</button>
        </ErrorCard>
      </Container>
    );
  }

  const getPriceInfo = () => {
    switch (currency) {
      case 'USD':
        return { symbol: '$', amount: basket.price_usd, currency: 'USD' };
      case 'GBP':
        return { symbol: '£', amount: basket.price_gbp, currency: 'GBP' };
      case 'EUR':
        return { symbol: '€', amount: basket.price_eur, currency: 'EUR' };
      default:
        return { symbol: '₦', amount: basket.price_ngn, currency: 'NGN' };
    }
  };

  const price = getPriceInfo();

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('diaspora_orders').insert([
        {
          basket_id: basket.id,
          sender_name: senderData.name,
          sender_email: senderData.email,
          sender_phone: senderData.phone,
          sender_country: senderData.country,
          recipient_name: recipientData.name,
          recipient_phone: recipientData.phone,
          recipient_address: recipientData.address,
          recipient_city: recipientData.city,
          recipient_state: recipientData.state,
          recipient_lga: recipientData.lga,
          gift_message: giftData.message,
          delivery_instructions: giftData.deliveryInstructions,
          preferred_delivery_date: giftData.preferredDeliveryDate || null,
          currency: price.currency,
          amount_paid: price.amount,
          total_ngn: basket.price_ngn,
          exchange_rate: basket.price_ngn / price.amount,
          payment_status: 'pending',
          status: 'pending',
        },
      ]);

      if (error) throw error;

      // Redirect to success page
      navigate('/diaspora-order-success', { state: { orderData: data } });
    } catch (error: any) {
      console.error('Error creating order:', error);
      alert(`Failed to create order: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Complete Your Gift Order 🎁</Title>
        <ProgressBar>
          <ProgressStep $active={step >= 1} $completed={step > 1}>
            1. Sender Info
          </ProgressStep>
          <ProgressStep $active={step >= 2} $completed={step > 2}>
            2. Recipient Info
          </ProgressStep>
          <ProgressStep $active={step >= 3} $completed={step > 3}>
            3. Gift Details
          </ProgressStep>
          <ProgressStep $active={step >= 4}>4. Payment</ProgressStep>
        </ProgressBar>
      </Header>

      <Content>
        <MainContent>
          {/* Step 1: Sender Information */}
          {step === 1 && (
            <StepCard>
              <StepTitle>
                <FiUser /> Your Information
              </StepTitle>
              <Form>
                <FormGroup>
                  <Label>Full Name *</Label>
                  <Input
                    type="text"
                    value={senderData.name}
                    onChange={(e) => setSenderData({ ...senderData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email Address *</Label>
                  <Input
                    type="email"
                    value={senderData.email}
                    onChange={(e) => setSenderData({ ...senderData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Phone Number *</Label>
                  <Input
                    type="tel"
                    value={senderData.phone}
                    onChange={(e) => setSenderData({ ...senderData, phone: e.target.value })}
                    placeholder="+1 xxx xxx xxxx"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Country *</Label>
                  <Select
                    value={senderData.country}
                    onChange={(e) => setSenderData({ ...senderData, country: e.target.value })}
                  >
                    <option value="United States">🇺🇸 United States</option>
                    <option value="United Kingdom">🇬🇧 United Kingdom</option>
                    <option value="Canada">🇨🇦 Canada</option>
                    <option value="Germany">🇩🇪 Germany</option>
                    <option value="France">🇫🇷 France</option>
                    <option value="Other">🌍 Other</option>
                  </Select>
                </FormGroup>

                <NextButton onClick={() => setStep(2)}>Continue to Recipient Info</NextButton>
              </Form>
            </StepCard>
          )}

          {/* Step 2: Recipient Information */}
          {step === 2 && (
            <StepCard>
              <StepTitle>
                <FiMapPin /> Recipient Information (Nigeria)
              </StepTitle>
              <Form>
                <FormGroup>
                  <Label>Recipient Full Name *</Label>
                  <Input
                    type="text"
                    value={recipientData.name}
                    onChange={(e) => setRecipientData({ ...recipientData, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Recipient Phone Number *</Label>
                  <Input
                    type="tel"
                    value={recipientData.phone}
                    onChange={(e) => setRecipientData({ ...recipientData, phone: e.target.value })}
                    placeholder="+234 xxx xxx xxxx"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Delivery Address *</Label>
                  <TextArea
                    value={recipientData.address}
                    onChange={(e) => setRecipientData({ ...recipientData, address: e.target.value })}
                    placeholder="Full street address, house number, landmarks"
                    rows={3}
                    required
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>City *</Label>
                    <Input
                      type="text"
                      value={recipientData.city}
                      onChange={(e) => setRecipientData({ ...recipientData, city: e.target.value })}
                      placeholder="e.g., Lagos"
                      required
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>State *</Label>
                    <Select
                      value={recipientData.state}
                      onChange={(e) => setRecipientData({ ...recipientData, state: e.target.value })}
                      required
                    >
                      <option value="">Select State</option>
                      <option value="Lagos">Lagos</option>
                      <option value="Abuja">Abuja (FCT)</option>
                      <option value="Rivers">Rivers</option>
                      <option value="Oyo">Oyo</option>
                      <option value="Kano">Kano</option>
                      <option value="Ogun">Ogun</option>
                      <option value="Delta">Delta</option>
                      <option value="Kaduna">Kaduna</option>
                      <option value="Anambra">Anambra</option>
                      <option value="Enugu">Enugu</option>
                    </Select>
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label>LGA (Local Government Area)</Label>
                  <Input
                    type="text"
                    value={recipientData.lga}
                    onChange={(e) => setRecipientData({ ...recipientData, lga: e.target.value })}
                    placeholder="e.g., Ikeja, Surulere"
                  />
                </FormGroup>

                <ButtonRow>
                  <BackButton onClick={() => setStep(1)}>Back</BackButton>
                  <NextButton onClick={() => setStep(3)}>Continue to Gift Details</NextButton>
                </ButtonRow>
              </Form>
            </StepCard>
          )}

          {/* Step 3: Gift Details */}
          {step === 3 && (
            <StepCard>
              <StepTitle>
                <FiGift /> Gift Details (Optional)
              </StepTitle>
              <Form>
                <FormGroup>
                  <Label>Personal Gift Message</Label>
                  <TextArea
                    value={giftData.message}
                    onChange={(e) => setGiftData({ ...giftData, message: e.target.value })}
                    placeholder="Write a personal message to include with your gift..."
                    rows={4}
                  />
                  <HelpText>This message will be printed and delivered with the basket</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>Delivery Instructions</Label>
                  <TextArea
                    value={giftData.deliveryInstructions}
                    onChange={(e) =>
                      setGiftData({ ...giftData, deliveryInstructions: e.target.value })
                    }
                    placeholder="Any special delivery instructions? (e.g., call before delivery, gate code, etc.)"
                    rows={3}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Preferred Delivery Date</Label>
                  <Input
                    type="date"
                    value={giftData.preferredDeliveryDate}
                    onChange={(e) =>
                      setGiftData({ ...giftData, preferredDeliveryDate: e.target.value })
                    }
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <HelpText>Leave blank for immediate delivery (24-48 hours)</HelpText>
                </FormGroup>

                <ButtonRow>
                  <BackButton onClick={() => setStep(2)}>Back</BackButton>
                  <NextButton onClick={() => setStep(4)}>Continue to Payment</NextButton>
                </ButtonRow>
              </Form>
            </StepCard>
          )}

          {/* Step 4: Payment */}
          {step === 4 && (
            <StepCard>
              <StepTitle>
                <FiCreditCard /> Payment
              </StepTitle>
              
              <PaymentNotice>
                <NoticeIcon>ℹ️</NoticeIcon>
                <NoticeText>
                  <strong>Payment Integration Required</strong>
                  <br />
                  This demo uses a placeholder. In production, integrate with Stripe, PayPal, or Paystack
                  for international payments.
                </NoticeText>
              </PaymentNotice>

              <PaymentSummary>
                <SummaryTitle>Order Summary</SummaryTitle>
                <SummaryLine>
                  <span>Basket:</span>
                  <span>{basket.name}</span>
                </SummaryLine>
                <SummaryLine>
                  <span>Price:</span>
                  <strong>
                    {price.symbol}
                    {price.amount.toFixed(2)}
                  </strong>
                </SummaryLine>
                <SummaryLine>
                  <span>Delivery:</span>
                  <span style={{ color: '#4CAF50' }}>FREE</span>
                </SummaryLine>
                <SummaryTotal>
                  <span>Total:</span>
                  <span>
                    {price.symbol}
                    {price.amount.toFixed(2)}
                  </span>
                </SummaryTotal>
              </PaymentSummary>

              <ButtonRow>
                <BackButton onClick={() => setStep(3)}>Back</BackButton>
                <SubmitButton onClick={handleSubmitOrder} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : `Pay ${price.symbol}${price.amount.toFixed(2)}`}
                </SubmitButton>
              </ButtonRow>
            </StepCard>
          )}
        </MainContent>

        {/* Order Summary Sidebar */}
        <Sidebar>
          <SummaryCard>
            <SummaryHeader>Order Summary</SummaryHeader>
            <BasketInfo>
              <BasketImage src={basket.image_url} alt={basket.name} />
              <BasketName>{basket.name}</BasketName>
              <BasketPrice>
                {price.symbol}
                {price.amount.toFixed(2)}
              </BasketPrice>
            </BasketInfo>

            <ItemsList>
              <ItemsTitle>Includes:</ItemsTitle>
              {basket.items?.map((item: any, idx: number) => (
                <Item key={idx}>
                  <FiCheck />
                  {item.name} ({item.quantity} {item.unit})
                </Item>
              ))}
            </ItemsList>

            <Guarantee>
              <GuaranteeIcon>✓</GuaranteeIcon>
              <GuaranteeText>
                <strong>Quality Guarantee</strong>
                <br />
                Fresh products or money back
              </GuaranteeText>
            </Guarantee>
          </SummaryCard>
        </Sidebar>
      </Content>
    </Container>
  );
};

export default DiasporaCheckout;

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const ProgressStep = styled.div<{ $active: boolean; $completed?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  background: ${({ $active, $completed, theme }) =>
    $completed ? theme.colors.primary.main : $active ? theme.colors.primary.main : '#e0e0e0'};
  color: ${({ $active, $completed }) => ($active || $completed ? 'white' : '#999')};
  font-weight: 600;
  font-size: 0.95rem;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div``;

const StepCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary.main};

  svg {
    font-size: 2rem;
  }
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const HelpText = styled.small`
  color: #999;
  font-size: 0.875rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`;

const NextButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PaymentNotice = styled.div`
  background: #FFF3CD;
  border: 2px solid #FFA500;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
`;

const NoticeIcon = styled.div`
  font-size: 2rem;
`;

const NoticeText = styled.div`
  color: #856404;
  line-height: 1.6;
`;

const PaymentSummary = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const SummaryLine = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
`;

const SummaryTotal = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const Sidebar = styled.div`
  @media (max-width: 1024px) {
    display: none;
  }
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
`;

const SummaryHeader = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
`;

const BasketInfo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const BasketImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const BasketName = styled.h4`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const BasketPrice = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ItemsList = styled.div`
  margin-bottom: 2rem;
`;

const ItemsTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.75rem;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;

  svg {
    color: ${({ theme }) => theme.colors.primary.main};
    flex-shrink: 0;
  }
`;

const Guarantee = styled.div`
  background: #E8F5E9;
  border: 2px solid #4CAF50;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const GuaranteeIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #4CAF50;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
`;

const GuaranteeText = styled.div`
  color: #1B5E20;
  font-size: 0.95rem;
  line-height: 1.5;
`;

const ErrorCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
`;
