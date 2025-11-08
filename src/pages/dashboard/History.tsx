import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import { useRealtime } from '../../hooks/useRealtime';

const History: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch orders with real-time updates
  const { data, isLoading } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set initial orders data
  useEffect(() => {
    if (data) {
      setOrders(data);
    }
  }, [data]);

  // Real-time updates for orders
  useRealtime({
    table: 'orders',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    filter: user ? { column: 'user_id', value: user.id } : undefined,
    onEvent: () => {
      // Invalidate the query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
    channelName: 'user-orders-history'
  });

  // Real-time updates for order items
  useRealtime({
    table: 'order_items',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      // Invalidate the query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
    },
    channelName: 'user-order-items-history'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FiClock />;
      case 'processing':
      case 'confirmed':
        return <FiPackage />;
      case 'shipped':
      case 'out_for_delivery':
        return <FiTruck />;
      case 'delivered':
        return <FiCheckCircle />;
      case 'cancelled':
        return <FiClock />;
      default:
        return <FiClock />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#FFA500';
      case 'processing':
      case 'confirmed':
        return '#3498db';
      case 'shipped':
      case 'out_for_delivery':
        return '#9b59b6';
      case 'delivered':
        return '#27ae60';
      case 'cancelled':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  if (isLoading && orders.length === 0) {
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
                <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}</span>
              </StatusBadge>
            </OrderHeader>

            <OrderBody>
              {order.order_items && order.order_items.slice(0, 3).map((item: any, index: number) => (
                <OrderItem key={index}>
                  <ItemImage src={item.image_url || '/placeholder-product.png'} alt={item.product_name} />
                  <ItemDetails>
                    <ItemName>{item.product_name}</ItemName>
                    <ItemQuantity>Qty: {item.quantity}</ItemQuantity>
                  </ItemDetails>
                  <ItemPrice>{formatCurrency(item.price || 0)}</ItemPrice>
                </OrderItem>
              ))}
              {order.order_items && order.order_items.length > 3 && (
                <MoreItems>+{order.order_items.length - 3} more item(s)</MoreItems>
              )}
            </OrderBody>

            <OrderFooter>
              <TotalAmount>
                <span>Total:</span>
                <Amount>{formatCurrency(order.total || 0)}</Amount>
              </TotalAmount>
              {/* Removed View Details button as it's not functioning properly */}
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
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const OrderInfo = styled.div``;

const OrderNumber = styled.div`
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
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
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
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
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.light};
  }
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
`;

const ItemImage = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ItemQuantity = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const TotalAmount = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const Amount = styled.span`
  font-weight: 700;
  color: #6C9A7F; /* Sidebar green color */
  font-size: 1.25rem;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const ViewButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F; /* Sidebar green color */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8470; /* Darker green on hover */
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
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
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
    
    svg {
      font-size: 2rem;
    }
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
`;

const ShopButton = styled.button`
  padding: 1rem 2rem;
  background: #6C9A7F; /* Sidebar green color */
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470; /* Darker green on hover */
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
    font-size: 0.9rem;
  }
`;