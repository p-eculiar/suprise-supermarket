import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { DriverLocationService } from '../../services/driverLocationService';
import { FiMapPin, FiTruck, FiPackage, FiUser, FiPhone, FiClock } from 'react-icons/fi';

const DriverApp: React.FC = () => {
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState('confirmed');

  // Get assigned orders for this driver
  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['driver-orders'],
    queryFn: async () => {
      // In a real implementation, this would filter by the current driver
      // For now, we'll get all orders assigned to drivers
      const { data, error } = await supabase
        .from('delivery_tracking')
        .select(`
          *,
          order:orders (
            id,
            order_number,
            customer_name,
            customer_phone,
            shipping_address,
            shipping_city,
            shipping_state
          )
        `)
        .not('driver_name', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleUpdateLocation = async () => {
    if (!currentOrder || !location) return;

    setIsUpdating(true);
    try {
      // Reverse geocode to get address (simplified - in real app use proper geocoding service)
      const address = `${currentOrder.order.shipping_city}, ${currentOrder.order.shipping_state}`;

      const success = await DriverLocationService.updateDriverLocation(
        currentOrder.order_id,
        {
          latitude: location.lat,
          longitude: location.lng,
          address,
          timestamp: new Date().toISOString(),
          accuracy: 10 // meters
        }
      );

      if (success) {
        alert('Location updated successfully');
        refetch();
      } else {
        alert('Failed to update location');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error updating location');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) throw error;

      // Also update order status
      await supabase
        .from('orders')
        .update({
          status: status === 'delivered' ? 'delivered' : 'processing',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      alert('Status updated successfully');
      refetch();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Loading>Loading assigned deliveries...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FiTruck /> Driver Dashboard
        </Title>
      </Header>

      {orders && orders.length > 0 ? (
        <OrdersList>
          {orders.map((delivery: any) => (
            <OrderCard 
              key={delivery.id} 
              $active={currentOrder?.id === delivery.id}
              onClick={() => setCurrentOrder(delivery)}
            >
              <OrderHeader>
                <OrderNumber>#{delivery.order.order_number}</OrderNumber>
                <StatusBadge $status={delivery.status}>
                  {delivery.status.replace('_', ' ')}
                </StatusBadge>
              </OrderHeader>

              <OrderBody>
                <CustomerInfo>
                  <FiUser />
                  <div>
                    <CustomerName>{delivery.order.customer_name}</CustomerName>
                    <CustomerPhone>
                      <FiPhone /> {delivery.order.customer_phone}
                    </CustomerPhone>
                  </div>
                </CustomerInfo>

                <Address>
                  <FiMapPin />
                  <div>
                    {delivery.order.shipping_address}, {delivery.order.shipping_city}, {delivery.order.shipping_state}
                  </div>
                </Address>

                {currentOrder?.id === delivery.id && (
                  <Actions>
                    <LocationButton onClick={handleUpdateLocation} disabled={isUpdating}>
                      <FiMapPin /> {isUpdating ? 'Updating...' : 'Update Location'}
                    </LocationButton>

                    <StatusSelect 
                      value={deliveryStatus} 
                      onChange={(e) => setDeliveryStatus(e.target.value)}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Preparing</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                    </StatusSelect>

                    <UpdateButton 
                      onClick={() => handleStatusChange(delivery.order_id, deliveryStatus)}
                    >
                      <FiPackage /> Update Status
                    </UpdateButton>
                  </Actions>
                )}
              </OrderBody>
            </OrderCard>
          ))}
        </OrdersList>
      ) : (
        <EmptyState>
          <FiPackage />
          <h3>No Assigned Deliveries</h3>
          <p>You don't have any deliveries assigned to you right now.</p>
        </EmptyState>
      )}

      {location && (
        <LocationInfo>
          <FiMapPin /> Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </LocationInfo>
      )}
    </Container>
  );
};

export default DriverApp;

// Styled Components
const Container = styled.div`
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  color: #2D3436;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #636E72;
`;

const OrdersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OrderCard = styled.div<{ $active?: boolean }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 2px solid ${({ $active }) => ($active ? '#6C9A7F' : 'transparent')};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #F8F9FA;
  border-bottom: 1px solid #DFE6E9;
`;

const OrderNumber = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D3436;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  background: ${({ $status }) => {
    switch ($status) {
      case 'confirmed': return '#3498DB20';
      case 'preparing': return '#FF980020';
      case 'out_for_delivery': return '#6C9A7F20';
      case 'delivered': return '#27AE6020';
      default: return '#9E9E9E20';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'confirmed': return '#3498DB';
      case 'preparing': return '#FF9800';
      case 'out_for_delivery': return '#6C9A7F';
      case 'delivered': return '#27AE60';
      default: return '#9E9E9E';
    }
  }};
`;

const OrderBody = styled.div`
  padding: 1.5rem;
`;

const CustomerInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;

  svg {
    color: #6C9A7F;
    margin-top: 0.25rem;
  }
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const CustomerPhone = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #636E72;
`;

const Address = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: flex-start;

  svg {
    color: #6C9A7F;
    margin-top: 0.25rem;
  }

  div {
    color: #2D3436;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    background: #B2BEC3;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #5A8470;
  }
`;

const StatusSelect = styled.select`
  padding: 0.75rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const UpdateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3498DB;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2980B9;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  svg {
    font-size: 3rem;
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

const LocationInfo = styled.div`
  background: #F8F9FA;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #636E72;
`;