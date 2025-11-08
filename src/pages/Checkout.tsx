import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { paymentService, OrderData } from '../services/paymentService';
import toast from '../components/common/Toast';
import { FaCreditCard, FaTruck, FaCheckCircle, FaSpinner, FaPaypal, FaUniversity } from 'react-icons/fa';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Nigeria',
  });
  
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });
  
  const [bankInfo, setBankInfo] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });

  const subtotal = getCartTotal();
  const tax = subtotal * 0.075; // 7.5% tax
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  const handleCreateOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData: OrderData = {
        user_id: user.id,
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        delivery_address: shippingInfo.address,
        delivery_city: shippingInfo.city,
        delivery_state: shippingInfo.state,
        delivery_postal_code: shippingInfo.zipCode || '',
        delivery_notes: '',
        subtotal: subtotal,
        tax: tax,
        delivery_fee: shipping,
        discount: 0,
        total: total,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image_url: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };

      // Create order using payment service
      const result = await paymentService.createOrder(orderData);
      
      if (!result) {
        throw new Error('Failed to create order');
      }

      toast.success(`Order ${result.orderNumber} created successfully!`);

      // Clear cart
      clearCart();

      // Navigate to order confirmation
      navigate(`/order-confirmation/${result.orderId}`);
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <EmptyCart>
        <h2>Your cart is empty</h2>
        <p>Add some products to checkout</p>
        <button onClick={() => navigate('/products')}>Shop Now</button>
      </EmptyCart>
    );
  }

  return (
    <CheckoutContainer>
      <CheckoutHeader>
        <h1>Checkout</h1>
        <Steps>
          <Step $active={step === 1} $completed={step > 1}>1. Shipping</Step>
          <Step $active={step === 2} $completed={step > 2}>2. Payment</Step>
          <Step $active={step === 3}>3. Review</Step>
        </Steps>
      </CheckoutHeader>

      <CheckoutContent>
        <MainSection>
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <Section>
              <SectionTitle>Shipping Information</SectionTitle>
              <Form>
                <FormRow>
                  <FormGroup>
                    <Label>First Name *</Label>
                    <Input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Last Name *</Label>
                    <Input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Phone *</Label>
                    <Input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>

                <FormGroup>
                  <Label>Address *</Label>
                  <Input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormRow>
                  <FormGroup>
                    <Label>City *</Label>
                    <Input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>State *</Label>
                    <Input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Zip Code *</Label>
                    <Input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      required
                    />
                  </FormGroup>
                </FormRow>

                <ButtonGroup>
                  <Button onClick={() => navigate('/cart')} variant="secondary">Back to Cart</Button>
                  <Button onClick={() => setStep(2)}>Continue to Payment</Button>
                </ButtonGroup>
              </Form>
            </Section>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <Section>
              <SectionTitle>Payment Method</SectionTitle>
              
              <PaymentMethods>
                <PaymentOption
                  $active={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard />
                  <span>Credit/Debit Card</span>
                </PaymentOption>
                <PaymentOption
                  $active={paymentMethod === 'paypal'}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <FaPaypal />
                  <span>PayPal</span>
                </PaymentOption>
                <PaymentOption
                  $active={paymentMethod === 'bank'}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <FaUniversity />
                  <span>Bank Transfer</span>
                </PaymentOption>
              </PaymentMethods>

              {paymentMethod === 'card' && (
                <Form>
                  <FormGroup>
                    <Label>Card Number *</Label>
                    <Input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardInfo.cardNumber}
                      onChange={(e) => setCardInfo({ ...cardInfo, cardNumber: e.target.value })}
                      maxLength={16}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Cardholder Name *</Label>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={cardInfo.cardName}
                      onChange={(e) => setCardInfo({ ...cardInfo, cardName: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup>
                      <Label>Expiry Date *</Label>
                      <Input
                        type="text"
                        placeholder="MM/YY"
                        value={cardInfo.expiryDate}
                        onChange={(e) => setCardInfo({ ...cardInfo, expiryDate: e.target.value })}
                        maxLength={5}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>CVV *</Label>
                      <Input
                        type="text"
                        placeholder="123"
                        value={cardInfo.cvv}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvv: e.target.value })}
                        maxLength={3}
                        required
                      />
                    </FormGroup>
                  </FormRow>
                </Form>
              )}

              {paymentMethod === 'paypal' && (
                <PayPalInfo>
                  <p>You will be redirected to PayPal to complete your payment.</p>
                </PayPalInfo>
              )}

              {paymentMethod === 'bank' && (
                <Form>
                  <FormGroup>
                    <Label>Bank Name *</Label>
                    <Input
                      type="text"
                      value={bankInfo.bankName}
                      onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Account Number *</Label>
                    <Input
                      type="text"
                      value={bankInfo.accountNumber}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Account Name *</Label>
                    <Input
                      type="text"
                      value={bankInfo.accountName}
                      onChange={(e) => setBankInfo({ ...bankInfo, accountName: e.target.value })}
                      required
                    />
                  </FormGroup>
                </Form>
              )}

              <ButtonGroup>
                <Button onClick={() => setStep(1)} variant="secondary">Back</Button>
                <Button onClick={() => setStep(3)}>Review Order</Button>
              </ButtonGroup>
            </Section>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <Section>
              <SectionTitle>Review Your Order</SectionTitle>
              
              <ReviewSection>
                <ReviewSubtitle>Shipping Information</ReviewSubtitle>
                <ReviewInfo>
                  <p><strong>Name:</strong> {shippingInfo.firstName} {shippingInfo.lastName}</p>
                  <p><strong>Email:</strong> {shippingInfo.email}</p>
                  <p><strong>Phone:</strong> {shippingInfo.phone}</p>
                  <p><strong>Address:</strong> {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                </ReviewInfo>
              </ReviewSection>

              <ReviewSection>
                <ReviewSubtitle>Payment Method</ReviewSubtitle>
                <ReviewInfo>
                  <p><strong>Method:</strong> {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}</p>
                </ReviewInfo>
              </ReviewSection>

              <ReviewSection>
                <ReviewSubtitle>Order Items</ReviewSubtitle>
                {cartItems.map((item) => (
                  <OrderItem key={item.id}>
                    <ItemImage src={item.imageUrl} alt={item.name} />
                    <ItemDetails>
                      <ItemName>{item.name}</ItemName>
                      <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                    </ItemDetails>
                    <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
                  </OrderItem>
                ))}
              </ReviewSection>

              <ButtonGroup>
                <Button onClick={() => setStep(2)} variant="secondary">Back</Button>
                <Button onClick={handleCreateOrder} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Place Order'}
                </Button>
              </ButtonGroup>
            </Section>
          )}
        </MainSection>

        {/* Order Summary Sidebar */}
        <Sidebar>
          <SummaryCard>
            <SummaryTitle>Order Summary</SummaryTitle>
            <SummaryRow>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax (7.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </SummaryRow>
            <Divider />
            <SummaryRow $total>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </SummaryRow>
          </SummaryCard>
        </Sidebar>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

export default Checkout;

// Styled Components
const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const CheckoutHeader = styled.div`
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
`;

const Steps = styled.div`
  display: flex;
  gap: 2rem;
`;

const Step = styled.div<{ $active: boolean; $completed?: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  background: ${({ $active, $completed, theme }) => 
    $active ? theme.colors.primary.main : $completed ? theme.colors.primary.light : theme.colors.common.gray[200]};
  color: ${({ $active, $completed }) => ($active || $completed) ? 'white' : '#666'};
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const MainSection = styled.div``;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
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
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${({ variant, theme }) => 
    variant === 'secondary' ? 'transparent' : theme.colors.primary.main};
  color: ${({ variant, theme }) => 
    variant === 'secondary' ? theme.colors.text.primary : 'white'};
  border: ${({ variant, theme }) => 
    variant === 'secondary' ? `2px solid ${theme.colors.border.main}` : 'none'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PaymentOption = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem;
  border: 2px solid ${({ $active, theme }) => 
    $active ? theme.colors.primary.main : theme.colors.border.main};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ $active, theme }) => 
    $active ? `${theme.colors.primary.main}10` : 'white'};
  
  svg {
    font-size: 2rem;
    color: ${({ $active, theme }) => 
      $active ? theme.colors.primary.main : theme.colors.text.secondary};
  }
  
  span {
    font-weight: 600;
    text-align: center;
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const PayPalInfo = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.common.gray[100]};
  border-radius: 8px;
  margin-bottom: 1rem;
  
  p {
    margin: 0;
    text-align: center;
  }
`;

const ReviewSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const ReviewSubtitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 1rem;
`;

const ReviewInfo = styled.div`
  p {
    margin: 0.5rem 0;
    line-height: 1.6;
  }
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ItemQuantity = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ItemPrice = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const Sidebar = styled.aside`
  @media (max-width: 968px) {
    order: -1;
  }
`;

const SummaryCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
`;

const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
`;

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: ${({ $total }) => ($total ? '1.25rem' : '1rem')};
  font-weight: ${({ $total }) => ($total ? '700' : '400')};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  margin: 1.5rem 0;
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  h2 {
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
  
  button {
    padding: 1rem 2rem;
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    
    &:hover {
      opacity: 0.9;
    }
  }
`;
