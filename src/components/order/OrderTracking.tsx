import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FiMapPin, FiTruck, FiClock, FiCheck } from 'react-icons/fi';

interface OrderTrackingProps {
  orderId: string;
  deliveryAddress: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, deliveryAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  const { data: deliveryTracking } = useQuery({
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

  // In a real implementation, you would integrate with a mapping service
  // For now, we'll simulate a map with a placeholder
  useEffect(() => {
    if (mapRef.current && deliveryAddress) {
      // Map initialization would go here in a real implementation
      // For now, we'll just show a placeholder
    }
  }, [deliveryAddress]);

  if (!deliveryTracking) {
    return (
      <TrackingContainer>
        <PlaceholderMap>
          <FiMapPin size={48} color="#6C9A7F" />
          <PlaceholderText>Loading delivery tracking...</PlaceholderText>
        </PlaceholderMap>
      </TrackingContainer>
    );
  }

  // Status timeline steps
  const statusSteps = [
    { id: 'order_placed', label: 'Order Placed', icon: <FiCheck />, completed: true },
    { id: 'order_confirmed', label: 'Order Confirmed', icon: <FiCheck />, completed: deliveryTracking.status !== 'pending' },
    { id: 'out_for_delivery', label: 'Out for Delivery', icon: <FiTruck />, completed: deliveryTracking.status === 'out_for_delivery' || deliveryTracking.status === 'delivered' },
    { id: 'delivered', label: 'Delivered', icon: <FiCheck />, completed: deliveryTracking.status === 'delivered' },
  ];

  return (
    <TrackingContainer>
      <SectionTitle>Live Tracking</SectionTitle>
      
      <MapContainer ref={mapRef}>
        <PlaceholderMap>
          <FiMapPin size={48} color="#6C9A7F" />
          <PlaceholderText>Interactive Map View</PlaceholderText>
          <AddressText>{deliveryAddress.address}</AddressText>
        </PlaceholderMap>
      </MapContainer>
      
      <Timeline>
        {statusSteps.map((step, index) => (
          <TimelineItem key={step.id} isActive={step.completed}>
            <TimelineIcon isActive={step.completed}>
              {step.icon}
            </TimelineIcon>
            <TimelineContent>
              <TimelineLabel isActive={step.completed}>
                {step.label}
              </TimelineLabel>
            </TimelineContent>
            {index < statusSteps.length - 1 && (
              <TimelineConnector isActive={step.completed} />
            )}
          </TimelineItem>
        ))}
      </Timeline>
      
      {deliveryTracking.driver_location && (
        <DriverLocation>
          <FiTruck /> Driver Location Updated: {new Date(deliveryTracking.driver_location.updated_at).toLocaleTimeString()}
        </DriverLocation>
      )}
    </TrackingContainer>
  );
};

export default OrderTracking;

// Styled Components
const TrackingContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const MapContainer = styled.div`
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
  background: #F8F9FA;
`;

const PlaceholderMap = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const PlaceholderText = styled.div`
  font-size: 1.1rem;
  color: #636E72;
  font-weight: 500;
`;

const AddressText = styled.div`
  font-size: 0.9rem;
  color: #636E72;
  text-align: center;
  max-width: 80%;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const TimelineItem = styled.div<{ isActive: boolean }>`
  display: flex;
  position: relative;
  padding-bottom: 1.5rem;
`;

const TimelineIcon = styled.div<{ isActive: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isActive ? '#6C9A7F' : '#DDE6E9'};
  color: ${props => props.isActive ? 'white' : '#636E72'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 2;
  flex-shrink: 0;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-left: 1rem;
`;

const TimelineLabel = styled.div<{ isActive: boolean }>`
  font-size: 1rem;
  font-weight: ${props => props.isActive ? '600' : '400'};
  color: ${props => props.isActive ? '#2D3436' : '#636E72'};
`;

const TimelineConnector = styled.div<{ isActive: boolean }>`
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: -10px;
  width: 2px;
  background: ${props => props.isActive ? '#6C9A7F' : '#DDE6E9'};
  z-index: 1;
`;

const DriverLocation = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #636E72;
  font-size: 0.9rem;
`;