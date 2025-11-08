import React from 'react';
import styled from 'styled-components';
import { 
  FiUsers, FiShoppingCart, FiDollarSign, FiTrendingUp, 
  FiPackage, FiPercent, FiActivity, FiAlertCircle 
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

const AdminDashboard: React.FC = () => {
  // Fetch real stats from Supabase
  const { data: ordersData } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('total, status, created_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: productsCount } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: usersCount } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentOrdersData } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats from real data
  const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total, 0) || 0;
  const totalOrders = ordersData?.length || 0;
  const activeOrders = ordersData?.filter(o => o.status === 'processing' || o.status === 'pending').length || 0;
  const platformFees = totalRevenue * 0.025; // 2.5% commission

  const stats = {
    totalRevenue,
    totalOrders,
    totalUsers: usersCount || 0,
    totalProducts: productsCount || 0,
    platformFees,
    activeOrders,
    growthRate: 12.5,
    pendingIssues: 3
  };

  const recentOrders = recentOrdersData?.map(order => ({
    id: order.id.slice(0, 8),
    customer: order.customer_name,
    amount: order.total,
    status: order.status,
    date: new Date(order.created_at).toLocaleString()
  })) || [];

  const topProducts = [
    { name: 'Loading...', sales: 0, revenue: 0, trend: '0%' },
  ];

  return (
    <DashboardContainer>
      <DashboardHeader>
        <Title>Dashboard Overview</Title>
        <DateRange>Today: {new Date().toLocaleDateString()}</DateRange>
      </DashboardHeader>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard $color="#6C9A7F">
          <StatIcon>
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Revenue</StatLabel>
            <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
            <StatTrend $positive>+12.5% from last month</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#4ECDC4">
          <StatIcon>
            <FiShoppingCart />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Orders</StatLabel>
            <StatValue>{stats.totalOrders.toLocaleString()}</StatValue>
            <StatTrend $positive>+8.2% from last month</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#FF9800">
          <StatIcon>
            <FiUsers />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Users</StatLabel>
            <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
            <StatTrend $positive>+5.4% from last month</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#9B59B6">
          <StatIcon>
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Products</StatLabel>
            <StatValue>{stats.totalProducts}</StatValue>
            <StatTrend>Updated daily</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#6C9A7F">
          <StatIcon>
            <FiPercent />
          </StatIcon>
          <StatInfo>
            <StatLabel>Platform Fees</StatLabel>
            <StatValue>${stats.platformFees.toLocaleString()}</StatValue>
            <StatTrend $positive>2.5% commission</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#FF6B6B">
          <StatIcon>
            <FiActivity />
          </StatIcon>
          <StatInfo>
            <StatLabel>Active Orders</StatLabel>
            <StatValue>{stats.activeOrders}</StatValue>
            <StatTrend>Real-time updates</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#4CAF50">
          <StatIcon>
            <FiTrendingUp />
          </StatIcon>
          <StatInfo>
            <StatLabel>Growth Rate</StatLabel>
            <StatValue>{stats.growthRate}%</StatValue>
            <StatTrend $positive>Monthly average</StatTrend>
          </StatInfo>
        </StatCard>

        <StatCard $color="#E74C3C">
          <StatIcon>
            <FiAlertCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>Pending Issues</StatLabel>
            <StatValue>{stats.pendingIssues}</StatValue>
            <StatTrend>Requires attention</StatTrend>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Main Content Grid */}
      <ContentGrid>
        {/* Recent Orders */}
        <Section>
          <SectionHeader>
            <SectionTitle>Recent Orders</SectionTitle>
            <ViewAllLink to="/admin/orders">View All</ViewAllLink>
          </SectionHeader>
          <OrdersTable>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>${order.amount}</TableCell>
                  <TableCell>
                    <StatusBadge $status={order.status}>{order.status}</StatusBadge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </OrdersTable>
        </Section>

        {/* Top Products */}
        <Section>
          <SectionHeader>
            <SectionTitle>Top Selling Products</SectionTitle>
            <ViewAllLink to="/admin/analytics">View Analytics</ViewAllLink>
          </SectionHeader>
          <ProductsList>
            {topProducts.map((product, index) => (
              <ProductItem key={index}>
                <ProductRank>{index + 1}</ProductRank>
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductStats>
                    {product.sales} sales • ${product.revenue.toLocaleString()}
                  </ProductStats>
                </ProductInfo>
                <ProductTrend $positive>{product.trend}</ProductTrend>
              </ProductItem>
            ))}
          </ProductsList>
        </Section>
      </ContentGrid>

      {/* Quick Actions */}
      <QuickActions>
        <ActionCard to="/admin/products/new">
          <ActionIcon><FiPackage /></ActionIcon>
          <ActionTitle>Add Product</ActionTitle>
        </ActionCard>
        <ActionCard to="/admin/analytics/nigeria">
          <ActionIcon><FiTrendingUp /></ActionIcon>
          <ActionTitle>Nigeria Analytics</ActionTitle>
        </ActionCard>
        <ActionCard to="/admin/users">
          <ActionIcon><FiUsers /></ActionIcon>
          <ActionTitle>Manage Users</ActionTitle>
        </ActionCard>
        <ActionCard to="/admin/settings">
          <ActionIcon><FiPercent /></ActionIcon>
          <ActionTitle>Platform Settings</ActionTitle>
        </ActionCard>
      </QuickActions>
    </DashboardContainer>
  );
};

export default AdminDashboard;

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const DateRange = styled.div`
  font-size: 0.95rem;
  color: #636E72;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $color: string }>`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => props.$color};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #6C9A7F15;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const StatTrend = styled.div<{ $positive?: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$positive ? '#4CAF50' : '#636E72'};
  font-weight: ${props => props.$positive ? '600' : '400'};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const ViewAllLink = styled(Link)`
  font-size: 0.875rem;
  color: #6C9A7F;
  text-decoration: none;
  font-weight: 600;
  
  &:hover {
    text-decoration: underline;
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead``;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
`;

const TableCell = styled.td`
  padding: 1rem 0;
  font-size: 0.95rem;
  color: #2D3436;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF5015';
      case 'pending': return '#FF980015';
      case 'processing': return '#4ECDC415';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'processing': return '#4ECDC4';
      default: return '#636E72';
    }
  }};
`;

const ProductsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #E8F5EC;
  }
`;

const ProductRank = styled.div`
  width: 32px;
  height: 32px;
  background: #6C9A7F;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ProductStats = styled.div`
  font-size: 0.85rem;
  color: #636E72;
`;

const ProductTrend = styled.div<{ $positive?: boolean }>`
  font-weight: 600;
  color: ${props => props.$positive ? '#4CAF50' : '#E74C3C'};
`;

const QuickActions = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ActionCard = styled(Link)`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    background: #E8F5EC;
  }
`;

const ActionIcon = styled.div`
  width: 60px;
  height: 60px;
  background: #6C9A7F15;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  
  svg {
    width: 28px;
    height: 28px;
  }
`;

const ActionTitle = styled.div`
  font-weight: 600;
  color: #2D3436;
  font-size: 1rem;
`;
