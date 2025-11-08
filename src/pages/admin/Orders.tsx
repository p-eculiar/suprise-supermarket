import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiDownload, FiEye, FiPackage } from 'react-icons/fi';

interface Order {
  id: string;
  customer: string;
  email: string;
  products: number;
  amount: number;
  platformFee: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
  paymentMethod: string;
}

const AdminOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - will be replaced with Supabase data
  const orders: Order[] = [
    {
      id: 'ORD-1234',
      customer: 'John Doe',
      email: 'john@example.com',
      products: 5,
      amount: 125.50,
      platformFee: 3.14, // 2.5% commission
      status: 'completed',
      date: '2024-10-09T10:30:00',
      paymentMethod: 'Card'
    },
    {
      id: 'ORD-1235',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      products: 3,
      amount: 89.99,
      platformFee: 2.25,
      status: 'processing',
      date: '2024-10-09T09:15:00',
      paymentMethod: 'Card'
    },
    {
      id: 'ORD-1236',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      products: 8,
      amount: 245.00,
      platformFee: 6.13,
      status: 'pending',
      date: '2024-10-09T08:45:00',
      paymentMethod: 'PayPal'
    },
    {
      id: 'ORD-1237',
      customer: 'Sarah Williams',
      email: 'sarah@example.com',
      products: 4,
      amount: 156.75,
      platformFee: 3.92,
      status: 'completed',
      date: '2024-10-08T16:20:00',
      paymentMethod: 'Card'
    },
  ];

  const totalPlatformFees = orders.reduce((sum, order) => sum + order.platformFee, 0);
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Orders Management</Title>
          <RevenueInfo>
            Total Revenue: <Amount>${totalRevenue.toLocaleString()}</Amount> | 
            Platform Fees: <Amount>${totalPlatformFees.toFixed(2)}</Amount>
          </RevenueInfo>
        </HeaderLeft>
        <ExportButton>
          <FiDownload />
          Export Orders
        </ExportButton>
      </Header>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatValue>{orders.length}</StatValue>
          <StatLabel>Total Orders</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{orders.filter(o => o.status === 'pending').length}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{orders.filter(o => o.status === 'processing').length}</StatValue>
          <StatLabel>Processing</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{orders.filter(o => o.status === 'completed').length}</StatValue>
          <StatLabel>Completed</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search orders by ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </FilterGroup>
      </FilterBar>

      {/* Orders Table */}
      <OrdersTable>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Platform Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>
                <OrderId>{order.id}</OrderId>
              </TableCell>
              <TableCell>
                <CustomerInfo>
                  <CustomerName>{order.customer}</CustomerName>
                  <CustomerEmail>{order.email}</CustomerEmail>
                </CustomerInfo>
              </TableCell>
              <TableCell>{order.products} items</TableCell>
              <TableCell>
                <OrderAmount>${order.amount}</OrderAmount>
              </TableCell>
              <TableCell>
                <PlatformFee>${order.platformFee.toFixed(2)}</PlatformFee>
              </TableCell>
              <TableCell>
                <StatusBadge $status={order.status}>{order.status}</StatusBadge>
              </TableCell>
              <TableCell>
                <OrderDate>{new Date(order.date).toLocaleString()}</OrderDate>
              </TableCell>
              <TableCell>{order.paymentMethod}</TableCell>
              <TableCell>
                <ActionButtons>
                  <ActionButton title="View Details">
                    <FiEye />
                  </ActionButton>
                  <ActionButton title="Update Status">
                    <FiPackage />
                  </ActionButton>
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </OrdersTable>
    </Container>
  );
};

export default AdminOrders;

const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const RevenueInfo = styled.div`
  font-size: 0.95rem;
  color: #636E72;
`;

const Amount = styled.span`
  font-weight: 700;
  color: #6C9A7F;
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #6C9A7F;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 0 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  svg {
    color: #999;
    width: 20px;
    height: 20px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background: #F8F9FA;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
`;

const OrderId = styled.div`
  font-weight: 700;
  color: #6C9A7F;
`;

const CustomerInfo = styled.div``;

const CustomerName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const CustomerEmail = styled.div`
  font-size: 0.875rem;
  color: #999;
`;

const OrderAmount = styled.div`
  font-weight: 700;
  color: #2D3436;
`;

const PlatformFee = styled.div`
  font-weight: 600;
  color: #6C9A7F;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF5015';
      case 'processing': return '#4ECDC415';
      case 'pending': return '#FF980015';
      case 'cancelled': return '#E74C3C15';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF50';
      case 'processing': return '#4ECDC4';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#E74C3C';
      default: return '#636E72';
    }
  }};
  text-transform: capitalize;
`;

const OrderDate = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6C9A7F15;
  color: #6C9A7F;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;
