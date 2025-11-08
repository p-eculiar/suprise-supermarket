import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { OrderItemThumbnail } from '../../components/common/StyledImage';
import { FiPackage, FiClock, FiMapPin, FiDollarSign, FiEye, FiRefreshCw } from 'react-icons/fi';
import toast from '../../components/common/Toast';

interface Order {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: any;
  items?: any[];
}

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await userService.getUserOrders(user.id);
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '#F39C12';
      case 'processing':
        return '#3498DB';
      case 'shipped':
        return '#9B59B6';
      case 'delivered':
        return '#27AE60';
      case 'cancelled':
        return '#E74C3C';
      default:
        return '#95A5A6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FiClock />;
      case 'processing':
      case 'shipped':
        return <FiPackage />;
      case 'delivered':
        return <FiPackage />;
      default:
        return <FiPackage />;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <p>Loading your orders...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>My Orders</Title>
          <Subtitle>Track and manage your orders</Subtitle>
        </div>
        <RefreshButton onClick={loadOrders}>
          <FiRefreshCw /> Refresh
        </RefreshButton>
      </Header>

      <FilterBar>
        <FilterButton 
          $active={filterStatus === 'all'} 
          onClick={() => setFilterStatus('all')}
        >
          All Orders ({orders.length})
        </FilterButton>
        <FilterButton 
          $active={filterStatus === 'pending'} 
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({orders.filter(o => o.status.toLowerCase() === 'pending').length})
        </FilterButton>
        <FilterButton 
          $active={filterStatus === 'processing'} 
          onClick={() => setFilterStatus('processing')}
        >
          Processing ({orders.filter(o => o.status.toLowerCase() === 'processing').length})
        </FilterButton>
        <FilterButton 
          $active={filterStatus === 'delivered'} 
          onClick={() => setFilterStatus('delivered')}
        >
          Delivered ({orders.filter(o => o.status.toLowerCase() === 'delivered').length})
        </FilterButton>
      </FilterBar>

      {filteredOrders.length === 0 ? (
        <EmptyState>
          <FiPackage />
          <h3>No orders found</h3>
          <p>
            {filterStatus === 'all' 
              ? "You haven't placed any orders yet." 
              : `No ${filterStatus} orders found.`}
          </p>
        </EmptyState>
      ) : (
        <OrdersList>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderNumber>
                  <FiPackage />
                  Order #{order.order_number}
                </OrderNumber>
                <StatusBadge $color={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  {order.status}
                </StatusBadge>
              </OrderHeader>

              <OrderBody>
                <OrderInfo>
                  <InfoItem>
                    <FiClock />
                    <div>
                      <InfoLabel>Order Date</InfoLabel>
                      <InfoValue>
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </InfoValue>
                    </div>
                  </InfoItem>

                  <InfoItem>
                    <FiDollarSign />
                    <div>
                      <InfoLabel>Total Amount</InfoLabel>
                      <InfoValue>₦{order.total.toLocaleString()}</InfoValue>
                    </div>
                  </InfoItem>

                  {order.shipping_address && (
                    <InfoItem>
                      <FiMapPin />
                      <div>
                        <InfoLabel>Delivery Address</InfoLabel>
                        <InfoValue>
                          {order.shipping_address.city}, {order.shipping_address.state}
                        </InfoValue>
                      </div>
                    </InfoItem>
                  )}
                </OrderInfo>
              </OrderBody>

              <OrderFooter>
                <ViewButton onClick={() => setSelectedOrder(order)}>
                  <FiEye /> View Details
                </ViewButton>
                {order.status.toLowerCase() === 'delivered' && (
                  <ReorderButton>
                    <FiRefreshCw /> Reorder
                  </ReorderButton>
                )}
              </OrderFooter>
            </OrderCard>
          ))}
        </OrdersList>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal onClick={() => setSelectedOrder(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Order Details</h2>
              <CloseButton onClick={() => setSelectedOrder(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <OrderDetailSection>
                <h3>Order #{selectedOrder.order_number}</h3>
                <StatusBadge $color={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </StatusBadge>
              </OrderDetailSection>

              <OrderDetailSection>
                <DetailLabel>Order Date:</DetailLabel>
                <DetailValue>
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </DetailValue>
              </OrderDetailSection>

              <OrderDetailSection>
                <DetailLabel>Total Amount:</DetailLabel>
                <DetailValue>₦{selectedOrder.total.toLocaleString()}</DetailValue>
              </OrderDetailSection>

              {selectedOrder.shipping_address && (
                <OrderDetailSection>
                  <DetailLabel>Delivery Address:</DetailLabel>
                  <DetailValue>
                    {selectedOrder.shipping_address.address}<br />
                    {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}
                  </DetailValue>
                </OrderDetailSection>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Orders;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const RefreshButton = styled.button`
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

  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.25rem;
  background: ${({ $active }) => ($active ? '#6C9A7F' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#2D3436')};
  border: 2px solid ${({ $active }) => ($active ? '#6C9A7F' : '#DFE6E9')};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #6C9A7F;
    background: ${({ $active }) => ($active ? '#5A8470' : '#F0F7F5')};
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #F8F9FA;
  border-bottom: 1px solid #DFE6E9;
`;

const OrderNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: #2D3436;

  svg {
    color: #6C9A7F;
  }
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: capitalize;
`;

const OrderBody = styled.div`
  padding: 1.5rem;
`;

const OrderInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  gap: 1rem;

  svg {
    font-size: 1.25rem;
    color: #6C9A7F;
    margin-top: 0.25rem;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
`;

const OrderFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #F8F9FA;
  border-top: 1px solid #DFE6E9;
`;

const ViewButton = styled.button`
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

  &:hover {
    background: #5A8470;
  }
`;

const ReorderButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #6C9A7F;
  border: 2px solid #6C9A7F;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #F0F7F5;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;

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
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;

  h2 {
    font-size: 1.5rem;
    color: #2D3436;
  }
`;

const CloseButton = styled.button`
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

const OrderDetailSection = styled.div`
  margin-bottom: 1.5rem;

  h3 {
    font-size: 1.25rem;
    color: #2D3436;
    margin-bottom: 0.5rem;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #636E72;
  margin-bottom: 0.5rem;
`;

const DetailValue = styled.div`
  color: #2D3436;
  font-size: 1.1rem;
`;
