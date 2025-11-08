import React from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';

const History: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock />;
      case 'processing':
        return <FiPackage />;
      case 'shipped':
        return <FiTruck />;
      case 'delivered':
        return <FiCheckCircle />;
      default:
        return <FiClock />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'processing':
        return '#3498db';
      case 'shipped':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (isLoading) {
    return <Container><LoadingMessage>Loading orders...</LoadingMessage></Container>;
  }

  if (!orders || orders.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon><FiPackage /></EmptyIcon>
          <EmptyTitle>No Orders Yet</EmptyTitle>
          <EmptyText>Start shopping to see your order history here</EmptyText>
          <ShopButton onClick={() => navigate('/products')}>Start Shopping</ShopButton>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Order History</Title>
        <Subtitle>View and track all your orders</Subtitle>
      </Header>

      <OrdersList>
        {orders.map((order: any) => (
          <OrderCard key={order.id}>
            <OrderHeader>
              <OrderInfo>
                <OrderNumber>Order #{order.id.slice(0, 8).toUpperCase()}</OrderNumber>
                <OrderDate>{new Date(order.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</OrderDate>
              </OrderInfo>
              <StatusBadge $color={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
              </StatusBadge>
            </OrderHeader>

            <OrderBody>
              {order.items && order.items.slice(0, 3).map((item: any, index: number) => (
                <OrderItem key={index}>
                  <ItemImage src={item.image_url} alt={item.product_name} />
                  <ItemDetails>
                    <ItemName>{item.product_name}</ItemName>
                    <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                  </ItemDetails>
                  <ItemPrice>${item.price.toFixed(2)}</ItemPrice>
                </OrderItem>
              ))}
              {order.items && order.items.length > 3 && (
                <MoreItems>+{order.items.length - 3} more item(s)</MoreItems>
              )}
            </OrderBody>

            <OrderFooter>
              <TotalAmount>
                <span>Total:</span>
                <Amount>${order.total.toFixed(2)}</Amount>
              </TotalAmount>
              <ViewButton onClick={() => navigate(`/order-confirmation/${order.id}`)}>
                View Details
              </ViewButton>
            </OrderFooter>
          </OrderCard>
        ))}
      </OrdersList>
    </Container>
  );
};

export default History;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
`;

const OrderInfo = styled.div``;

const OrderNumber = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
`;

const OrderDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
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
  
  svg {
    font-size: 1.125rem;
  }
`;

const OrderBody = styled.div`
  margin-bottom: 1rem;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
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
  font-weight: 600;
`;

const MoreItems = styled.div`
  text-align: center;
  padding: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const OrderFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};
`;

const TotalAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
`;

const Amount = styled.span`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: 1.25rem;
`;

const ViewButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.common.gray[100]};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  
  svg {
    font-size: 2.5rem;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const ShopButton = styled.button`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;
