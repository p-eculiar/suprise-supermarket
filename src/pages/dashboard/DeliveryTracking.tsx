import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { FiMapPin, FiPhone, FiUser, FiClock, FiCheck, FiPackage, FiTruck } from 'react-icons/fi';
import OrderTracking from '../../components/order/OrderTracking';

const DeliveryTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const queryClient = useQueryClient();
  const [deliveryAddress, setDeliveryAddress] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const { data: order, isLoading: orderLoading } = useQuery({
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

  const { data: deliveryTracking, isLoading: trackingLoading } = useQuery({
    queryKey: ['delivery-tracking', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select('*')
        .eq('order_id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  // Realtime: update when order or its delivery tracking changes
  useRealtime<any>({
    table: 'orders',
    events: ['UPDATE'],
    onEvent: () => {
      // Explicitly refetch order data when order changes
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    channelName: 'user-delivery-order',
  });
  useRealtime<any>({
    table: 'delivery_tracking',
    events: ['INSERT','UPDATE','DELETE'],
    onEvent: () => {
      // Explicitly refetch delivery tracking data when tracking changes
      queryClient.invalidateQueries({ queryKey: ['delivery-tracking', orderId] });
    },
    channelName: 'user-delivery-tracking',
  });

  // Set delivery address when order loads
  useEffect(() => {
    if (order && order.shipping_address) {
      // In a real implementation, you would geocode the address to get coordinates
      // For now, we'll use dummy coordinates
      setDeliveryAddress({
        latitude: 6.5244, // Lagos coordinates as example
        longitude: 3.3792,
        address: `${order.shipping_address}, ${order.shipping_city}, ${order.shipping_state}`
      });
    }
  }, [order]);

  if (orderLoading || trackingLoading) {
    return (
      <Container>
        <LoadingContainer>Loading delivery information...</LoadingContainer>
      </Container>
    );
  }

  if (!order || !deliveryTracking) {
    return (
      <Container>
        <ErrorContainer>Delivery information not available</ErrorContainer>
      </Container>
    );
  }

  // Show estimated delivery time if order is approved but not yet assigned
  if (order.approval_status === 'approved' && !deliveryTracking.driver_name) {
    return (
      <Container>
        <InfoCard>
          <InfoIcon>
            <FiClock />
          </InfoIcon>
          <InfoTitle>Order Approved</InfoTitle>
          <InfoMessage>
            Your order has been approved and is being prepared for delivery.
          </InfoMessage>
          <InfoDetail>
            Estimated delivery time: 2 hours
          </InfoDetail>
        </InfoCard>
      </Container>
    );
  }

  // Show driver information and tracking if assigned
  if (deliveryTracking.driver_name) {
    return (
      <Container>
        <Header>
          <Title>Delivery Tracking</Title>
          <OrderId>Order #{order.order_number}</OrderId>
        </Header>

        {/* Driver Information */}
        <DriverCard>
          <DriverHeader>
            <FiTruck /> Driver Information
          </DriverHeader>
          <DriverInfo>
            <DriverAvatar>
              <FiUser />
            </DriverAvatar>
            <DriverDetails>
              <DriverName>{deliveryTracking.driver_name}</DriverName>
              <DriverStatus>Currently {deliveryTracking.status.replace('_', ' ')}</DriverStatus>
            </DriverDetails>
            {deliveryTracking.driver_phone && (
              <CallButton href={`tel:${deliveryTracking.driver_phone}`}>
                <FiPhone /> Call Driver
              </CallButton>
            )}
          </DriverInfo>
        </DriverCard>

        {/* Estimated Delivery Time */}
        {deliveryTracking.estimated_delivery_time && (
          <InfoCard $success>
            <InfoIcon $success>
              <FiClock />
            </InfoIcon>
            <InfoTitle>Estimated Delivery</InfoTitle>
            <InfoMessage>
              Your order is expected to arrive by:
            </InfoMessage>
            <InfoDetail>
              {new Date(deliveryTracking.estimated_delivery_time).toLocaleString()}
            </InfoDetail>
          </InfoCard>
        )}

        {/* Live Tracking */}
        {deliveryAddress && (
          <OrderTracking 
            orderId={orderId!} 
            deliveryAddress={deliveryAddress} 
          />
        )}
      </Container>
    );
  }

  return (
    <Container>
      <InfoCard>
        <InfoIcon>
          <FiClock />
        </InfoIcon>
        <InfoTitle>Order Processing</InfoTitle>
        <InfoMessage>
          Your order is being processed and will be assigned to a delivery driver soon.
        </InfoMessage>
      </InfoCard>
    </Container>
  );
};

export default DeliveryTracking;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #636E72;
  font-size: 1.1rem;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #E74C3C;
  font-size: 1.1rem;
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

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const OrderId = styled.div`
  font-size: 1.1rem;
  color: #636E72;
  font-weight: 600;
`;

const DriverCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const DriverHeader = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DriverAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #6C9A7F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const DriverDetails = styled.div`
  flex: 1;
`;

const DriverName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const DriverStatus = styled.div`
  color: #636E72;
  font-size: 0.9rem;
`;

const CallButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const InfoCard = styled.div<{ $success?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin-bottom: 1.5rem;
  border-top: 4px solid ${({ $success }) => ($success ? '#27AE60' : '#FFB800')};
`;

const InfoIcon = styled.div<{ $success?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ $success }) => ($success ? '#27AE60' : '#FFB800')}15;
  color: ${({ $success }) => ($success ? '#27AE60' : '#FFB800')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
`;

const InfoTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const InfoMessage = styled.p`
  color: #636E72;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const InfoDetail = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
`;