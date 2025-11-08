import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMapPin, FiPhone, FiUser, FiClock, FiCheck, FiPackage, FiTruck } from 'react-icons/fi';
import { DeliveryTrackingService, DeliveryTracking } from '../../services/deliveryTrackingService';

interface OrderTrackingProps {
  orderId: string;
  deliveryAddress: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ orderId, deliveryAddress }) => {
  const [tracking, setTracking] = useState<DeliveryTracking | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTracking();
    const unsubscribe = subscribeToUpdates();

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  useEffect(() => {
    if (tracking?.current_location && deliveryAddress) {
      const dist = DeliveryTrackingService.calculateDistance(
        tracking.current_location.latitude,
        tracking.current_location.longitude,
        deliveryAddress.latitude,
        deliveryAddress.longitude
      );
      setDistance(dist);

      const estimatedEta = DeliveryTrackingService.calculateETA(
        tracking.current_location.latitude,
        tracking.current_location.longitude,
        deliveryAddress.latitude,
        deliveryAddress.longitude
      );
      setEta(estimatedEta);
    }
  }, [tracking, deliveryAddress]);

  const loadTracking = async () => {
    setIsLoading(true);
    try {
      const data = await DeliveryTrackingService.getOrderTracking(orderId);
      setTracking(data);
    } catch (error) {
      console.error('Error loading tracking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToUpdates = () => {
    return DeliveryTrackingService.subscribeToDeliveryUpdates(orderId, (updatedTracking) => {
      setTracking(updatedTracking);
    });
  };

  const getStatusSteps = () => {
    const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(tracking?.status || 'pending');

    return [
      { label: 'Order Placed', icon: <FiCheck />, status: 'pending' },
      { label: 'Confirmed', icon: <FiCheck />, status: 'confirmed' },
      { label: 'Preparing', icon: <FiPackage />, status: 'preparing' },
      { label: 'Out for Delivery', icon: <FiTruck />, status: 'out_for_delivery' },
      { label: 'Delivered', icon: <FiCheck />, status: 'delivered' },
    ].map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  if (isLoading) {
    return <LoadingContainer>Loading tracking information...</LoadingContainer>;
  }

  if (!tracking) {
    return <ErrorContainer>Tracking information not available</ErrorContainer>;
  }

  const statusSteps = getStatusSteps();

  return (
    <TrackingContainer>
      {/* Status Timeline */}
      <StatusTimeline>
        <TimelineTitle>Order Status</TimelineTitle>
        <Timeline>
          {statusSteps.map((step, index) => (
            <TimelineStep key={step.status}>
              <StepIndicator $completed={step.completed} $current={step.current}>
                {step.icon}
              </StepIndicator>
              {index < statusSteps.length - 1 && (
                <StepConnector $completed={step.completed} />
              )}
              <StepLabel $completed={step.completed}>{step.label}</StepLabel>
            </TimelineStep>
          ))}
        </Timeline>
      </StatusTimeline>

      {/* Live Map Section */}
      {tracking.status === 'out_for_delivery' && tracking.current_location && (
        <MapSection>
          <MapHeader>
            <MapTitle>
              <FiMapPin /> Live Tracking
            </MapTitle>
            {distance > 0 && (
              <DistanceInfo>
                <strong>{distance.toFixed(1)} km</strong> away
              </DistanceInfo>
            )}
          </MapHeader>

          {/* Simple map placeholder - In production, use Google Maps or Mapbox */}
          <MapContainer>
            <MapPlaceholder>
              <FiMapPin />
              <p>Delivery Driver Location</p>
              <p className="address">{tracking.current_location.address}</p>
              {eta && (
                <ETABadge>
                  <FiClock />
                  ETA: {eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ETABadge>
              )}
            </MapPlaceholder>
          </MapContainer>

          {/* Driver Information */}
          {tracking.driver_name && (
            <DriverInfo>
              <DriverAvatar>
                <FiUser />
              </DriverAvatar>
              <DriverDetails>
                <DriverName>{tracking.driver_name}</DriverName>
                <DriverRole>Delivery Driver</DriverRole>
              </DriverDetails>
              {tracking.driver_phone && (
                <CallButton href={`tel:${tracking.driver_phone}`}>
                  <FiPhone /> Call
                </CallButton>
              )}
            </DriverInfo>
          )}
        </MapSection>
      )}

      {/* Delivery Details */}
      <DeliveryDetails>
        <DetailsTitle>Delivery Information</DetailsTitle>
        
        <DetailRow>
          <DetailLabel>
            <FiMapPin /> Delivery Address
          </DetailLabel>
          <DetailValue>{deliveryAddress.address}</DetailValue>
        </DetailRow>

        {tracking.estimated_delivery_time && (
          <DetailRow>
            <DetailLabel>
              <FiClock /> Estimated Delivery
            </DetailLabel>
            <DetailValue>
              {new Date(tracking.estimated_delivery_time).toLocaleString()}
            </DetailValue>
          </DetailRow>
        )}

        {tracking.delivery_notes && (
          <DetailRow>
            <DetailLabel>
              <FiPackage /> Delivery Notes
            </DetailLabel>
            <DetailValue>{tracking.delivery_notes}</DetailValue>
          </DetailRow>
        )}
      </DeliveryDetails>

      {/* Tracking History */}
      {tracking.tracking_history && tracking.tracking_history.length > 0 && (
        <TrackingHistory>
          <HistoryTitle>Delivery History</HistoryTitle>
          <HistoryList>
            {tracking.tracking_history.slice().reverse().map((location, index) => (
              <HistoryItem key={index}>
                <HistoryIcon>
                  <FiMapPin />
                </HistoryIcon>
                <HistoryContent>
                  <HistoryLocation>{location.address}</HistoryLocation>
                  <HistoryTime>
                    {new Date(location.timestamp).toLocaleString()}
                  </HistoryTime>
                </HistoryContent>
              </HistoryItem>
            ))}
          </HistoryList>
        </TrackingHistory>
      )}

      {/* Trust Badges */}
      <TrustSection>
        <TrustBadge>
          <BadgeIcon>🔒</BadgeIcon>
          <BadgeText>
            <strong>Secure Delivery</strong>
            <span>Real-time GPS tracking</span>
          </BadgeText>
        </TrustBadge>
        <TrustBadge>
          <BadgeIcon>📦</BadgeIcon>
          <BadgeText>
            <strong>Quality Assured</strong>
            <span>Fresh products guaranteed</span>
          </BadgeText>
        </TrustBadge>
        <TrustBadge>
          <BadgeIcon>⭐</BadgeIcon>
          <BadgeText>
            <strong>Professional</strong>
            <span>Trained delivery staff</span>
          </BadgeText>
        </TrustBadge>
      </TrustSection>
    </TrackingContainer>
  );
};

export default OrderTracking;

// Styled Components
const TrackingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #636E72;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #E74C3C;
`;

const StatusTimeline = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const TimelineTitle = styled.h3`
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const Timeline = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 1rem 0;
`;

const TimelineStep = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
`;

const StepIndicator = styled.div<{ $completed: boolean; $current: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ $completed, $current }) =>
    $completed ? '#6C9A7F' : $current ? '#FFB800' : '#E1E8ED'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  z-index: 2;
  transition: all 0.3s ease;

  ${({ $current }) =>
    $current &&
    `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `}
`;

const StepConnector = styled.div<{ $completed: boolean }>`
  position: absolute;
  top: 24px;
  left: 50%;
  right: -50%;
  height: 4px;
  background: ${({ $completed }) => ($completed ? '#6C9A7F' : '#E1E8ED')};
  z-index: 1;
`;

const StepLabel = styled.div<{ $completed: boolean }>`
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: ${({ $completed }) => ($completed ? '600' : '400')};
  color: ${({ $completed }) => ($completed ? '#2D3436' : '#636E72')};
  text-align: center;
`;

const MapSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const MapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const MapTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0;
`;

const DistanceInfo = styled.div`
  color: #636E72;
  font-size: 0.9375rem;

  strong {
    color: #6C9A7F;
    font-size: 1.125rem;
  }
`;

const MapContainer = styled.div`
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 1.5rem;
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;

  svg {
    font-size: 4rem;
    margin-bottom: 1rem;
    animation: bounce 2s infinite;
  }

  p {
    margin: 0.25rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .address {
    font-size: 0.875rem;
    opacity: 0.9;
    font-weight: 400;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
`;

const ETABadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  color: #2D3436;
  padding: 0.75rem 1.25rem;
  border-radius: 25px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const DriverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
`;

const DriverAvatar = styled.div`
  width: 50px;
  height: 50px;
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
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const DriverRole = styled.div`
  font-size: 0.875rem;
  color: #636E72;
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

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const DeliveryDetails = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const DetailsTitle = styled.h3`
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid #F8F9FA;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #636E72;
  font-weight: 600;
`;

const DetailValue = styled.div`
  color: #2D3436;
  text-align: right;
`;

const TrackingHistory = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
`;

const HistoryTitle = styled.h3`
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const HistoryItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
`;

const HistoryIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #6C9A7F;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const HistoryContent = styled.div`
  flex: 1;
`;

const HistoryLocation = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const HistoryTime = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const TrustSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const BadgeIcon = styled.div`
  font-size: 2rem;
`;

const BadgeText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  strong {
    color: #2D3436;
    font-size: 0.9375rem;
  }

  span {
    color: #636E72;
    font-size: 0.8125rem;
  }
`;
