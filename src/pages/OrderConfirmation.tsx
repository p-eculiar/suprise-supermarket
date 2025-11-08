import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { FiCheckCircle, FiPackage, FiTruck, FiHome } from 'react-icons/fi';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading order details...</LoadingMessage>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <ErrorMessage>Order not found</ErrorMessage>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </Container>
    );
  }

  return (
    <Container>
      <SuccessIcon>
        <FiCheckCircle />
      </SuccessIcon>
      
      <Title>Order Confirmed!</Title>
      <Subtitle>Thank you for your purchase</Subtitle>
      
      <OrderNumber>Order #{order.id.slice(0, 8).toUpperCase()}</OrderNumber>
      
      <StatusTimeline>
        <TimelineItem $active>
          <TimelineIcon><FiCheckCircle /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Order Placed</TimelineTitle>
            <TimelineDate>{new Date(order.created_at).toLocaleDateString()}</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiPackage /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Processing</TimelineTitle>
            <TimelineDate>Pending</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiTruck /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Shipped</TimelineTitle>
            <TimelineDate>Pending</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiHome /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Delivered</TimelineTitle>
            <TimelineDate>Pending</TimelineDate>
          </TimelineContent>
        </TimelineItem>
      </StatusTimeline>

      <OrderDetails>
        <DetailsSection>
          <DetailsTitle>Shipping Information</DetailsTitle>
          <DetailsList>
            <DetailsItem>
              <strong>Name:</strong> {order.customer_name}
            </DetailsItem>
            <DetailsItem>
              <strong>Email:</strong> {order.customer_email}
            </DetailsItem>
            <DetailsItem>
              <strong>Phone:</strong> {order.phone}
            </DetailsItem>
            <DetailsItem>
              <strong>Address:</strong> {order.shipping_address}, {order.shipping_city}, {order.shipping_state} {order.shipping_zip}
            </DetailsItem>
          </DetailsList>
        </DetailsSection>

        <DetailsSection>
          <DetailsTitle>Payment Summary</DetailsTitle>
          <DetailsList>
            <SummaryRow>
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>${order.shipping.toFixed(2)}</span>
            </SummaryRow>
            <Divider />
            <SummaryRow $total>
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </SummaryRow>
          </DetailsList>
        </DetailsSection>

        <DetailsSection>
          <DetailsTitle>Order Items</DetailsTitle>
          {order.items && order.items.map((item: any, index: number) => (
            <OrderItem key={index}>
              <ItemImage src={item.image_url} alt={item.product_name} />
              <ItemDetails>
                <ItemName>{item.product_name}</ItemName>
                <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
              </ItemDetails>
              <ItemPrice>${(item.price * item.quantity).toFixed(2)}</ItemPrice>
            </OrderItem>
          ))}
        </DetailsSection>
      </OrderDetails>

      <ActionButtons>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        <Button onClick={() => navigate('/dashboard/history')} variant="secondary">
          View Order History
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default OrderConfirmation;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.status.error};
  margin-bottom: 2rem;
`;

const SuccessIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 2rem;
  
  svg {
    font-size: 3rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const OrderNumber = styled.div`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.common.gray[100]};
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 3rem;
`;

const StatusTimeline = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
  text-align: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TimelineItem = styled.div<{ $active?: boolean }>`
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
`;

const TimelineIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 0.5rem;
  
  svg {
    font-size: 1.5rem;
  }
`;

const TimelineContent = styled.div``;

const TimelineTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const TimelineDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const OrderDetails = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  margin-bottom: 2rem;
`;

const DetailsSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailsTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const DetailsList = styled.div``;

const DetailsItem = styled.div`
  margin-bottom: 0.75rem;
  line-height: 1.6;
`;

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: ${({ $total }) => ($total ? '1.25rem' : '1rem')};
  font-weight: ${({ $total }) => ($total ? '700' : '400')};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  margin: 1rem 0;
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

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
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
`;
