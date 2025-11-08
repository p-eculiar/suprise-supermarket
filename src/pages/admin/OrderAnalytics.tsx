import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FiBarChart2, FiTrendingUp, FiDollarSign, FiPackage, FiTruck, FiXCircle, FiRefreshCw, FiChevronLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from '../../components/common/Toast';

// Define types for our analytics data
interface StatusBreakdownData {
  count: number;
  revenue: number;
}

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  statusBreakdown: Record<string, StatusBreakdownData>;
  deliveryRate: number;
  averageDeliveryTime: number;
  recentOrders: any[];
}

const OrderAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['order-analytics', dateRange],
    queryFn: async () => {
      // Calculate date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (dateRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      // Get orders within date range
      let query = supabase
        .from('orders')
        .select(`
          id,
          status,
          total,
          created_at,
          delivered_at
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const { data: orders, error } = await query;
      if (error) throw error;

      // Calculate analytics
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      
      // Status breakdown
      const statusBreakdown: Record<string, { count: number; revenue: number }> = {
        pending: { count: 0, revenue: 0 },
        processing: { count: 0, revenue: 0 },
        shipped: { count: 0, revenue: 0 },
        delivered: { count: 0, revenue: 0 },
        cancelled: { count: 0, revenue: 0 },
      };

      orders?.forEach(order => {
        if (statusBreakdown[order.status]) {
          statusBreakdown[order.status].count++;
          statusBreakdown[order.status].revenue += order.total || 0;
        }
      });

      // Calculate delivery metrics
      const deliveredOrders = orders?.filter(order => order.status === 'delivered') || [];
      const deliveryRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;
      
      let totalDeliveryTime = 0;
      deliveredOrders.forEach(order => {
        if (order.delivered_at) {
          const deliveryTime = new Date(order.delivered_at).getTime() - new Date(order.created_at).getTime();
          totalDeliveryTime += deliveryTime;
        }
      });
      
      const averageDeliveryTime = deliveredOrders.length > 0 ? totalDeliveryTime / deliveredOrders.length : 0;

      return {
        totalOrders,
        totalRevenue,
        statusBreakdown,
        deliveryRate,
        averageDeliveryTime,
        recentOrders: orders?.slice(0, 5) || []
      };
    },
    staleTime: 300000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (data) {
      setAnalytics(data);
    }
  }, [data]);

  if (isError) {
    return (
      <Container>
        <Header>
          <Link to="/admin/orders">
            <BackButton>
              <FiChevronLeft /> Back to Orders
            </BackButton>
          </Link>
          <Title>Order Analytics</Title>
          <RefreshButton onClick={() => refetch()}>
            <FiRefreshCw />
          </RefreshButton>
        </Header>
        <ErrorState>
          <h2>Error Loading Analytics</h2>
          <p>{error?.message || 'An unknown error occurred'}</p>
          <RefreshButton onClick={() => refetch()}>
            <FiRefreshCw />
            Try Again
          </RefreshButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Link to="/admin/orders">
          <BackButton>
            <FiChevronLeft /> Back to Orders
          </BackButton>
        </Link>
        <Title>Order Analytics</Title>
        <Actions>
          <DateRangeSelector>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </Select>
          </DateRangeSelector>
          <RefreshButton onClick={() => refetch()}>
            <FiRefreshCw />
          </RefreshButton>
        </Actions>
      </Header>

      {isLoading ? (
        <LoadingState>
          <Spinner />
          <p>Loading analytics...</p>
        </LoadingState>
      ) : (
        <>
          {/* Summary Cards */}
          <SummaryGrid>
            <SummaryCard>
              <CardIcon $color="#4CAF50">
                <FiPackage />
              </CardIcon>
              <CardInfo>
                <CardValue>{analytics?.totalOrders?.toLocaleString() || 0}</CardValue>
                <CardLabel>Total Orders</CardLabel>
              </CardInfo>
            </SummaryCard>

            <SummaryCard>
              <CardIcon $color="#2196F3">
                <FiDollarSign />
              </CardIcon>
              <CardInfo>
                <CardValue>${analytics?.totalRevenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</CardValue>
                <CardLabel>Total Revenue</CardLabel>
              </CardInfo>
            </SummaryCard>

            <SummaryCard>
              <CardIcon $color="#FF9800">
                <FiTruck />
              </CardIcon>
              <CardInfo>
                <CardValue>{analytics?.deliveryRate ? `${analytics.deliveryRate.toFixed(1)}%` : '0%'}</CardValue>
                <CardLabel>Delivery Rate</CardLabel>
              </CardInfo>
            </SummaryCard>

            <SummaryCard>
              <CardIcon $color="#9C27B0">
                <FiTrendingUp />
              </CardIcon>
              <CardInfo>
                <CardValue>
                  {analytics?.averageDeliveryTime 
                    ? `${Math.round(analytics.averageDeliveryTime / (1000 * 60 * 60))}h ${Math.round((analytics.averageDeliveryTime % (1000 * 60 * 60)) / (1000 * 60))}m`
                    : '0h 0m'}
                </CardValue>
                <CardLabel>Avg. Delivery Time</CardLabel>
              </CardInfo>
            </SummaryCard>
          </SummaryGrid>

          {/* Status Breakdown */}
          <Section>
            <SectionHeader>
              <h2>Order Status Breakdown</h2>
            </SectionHeader>
            <StatusGrid>
              {analytics?.statusBreakdown && Object.entries(analytics.statusBreakdown).map(([status, data]) => {
                const typedData = data as StatusBreakdownData;
                return (
                  <StatusCard key={status}>
                    <StatusHeader>
                      <StatusBadge $status={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </StatusBadge>
                    </StatusHeader>
                    <StatusInfo>
                      <StatusCount>{typedData.count} orders</StatusCount>
                      <StatusRevenue>${typedData.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</StatusRevenue>
                    </StatusInfo>
                    <ProgressBar>
                      <ProgressFill 
                        $status={status} 
                        $percentage={analytics.totalOrders > 0 ? (typedData.count / analytics.totalOrders) * 100 : 0} 
                      />
                    </ProgressBar>
                  </StatusCard>
                );
              })}
            </StatusGrid>
          </Section>

          {/* Recent Orders */}
          <Section>
            <SectionHeader>
              <h2>Recent Orders</h2>
            </SectionHeader>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <TableHeader>Order ID</TableHeader>
                    <TableHeader>Customer</TableHeader>
                    <TableHeader>Amount</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Date</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {analytics?.recentOrders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer_name || 'N/A'}</TableCell>
                      <TableCell>${order.total?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>
                        <StatusBadge $status={order.status}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableContainer>
          </Section>
        </>
      )}
    </Container>
  );
};

export default OrderAnalytics;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const BackButton = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  color: #6C9A7F;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background: #F8F9FA;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const DateRangeSelector = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Select = styled.select`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
`;

const RefreshButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
    border-color: #6C9A7F;
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

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  h2 {
    color: #2D3436;
    margin-bottom: 1rem;
  }

  p {
    color: #636E72;
    margin-bottom: 2rem;
    max-width: 500px;
  }
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CardInfo = styled.div``;

const CardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const CardLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.25rem;
    color: #2D3436;
    margin: 0;
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const StatusCard = styled.div`
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  padding: 1rem;
`;

const StatusHeader = styled.div`
  margin-bottom: 1rem;
`;

const StatusInfo = styled.div`
  margin-bottom: 1rem;
`;

const StatusCount = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const StatusRevenue = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #F0F0F0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $status: string; $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  }};
`;

const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#FF980015';
      case 'processing': return '#2196F315';
      case 'shipped': return '#FF980015';
      case 'delivered': return '#4CAF5015';
      case 'cancelled': return '#F4433615';
      default: return '#9E9E9E15';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  }};
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  border-bottom: 1px solid #F0F0F0;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  color: #2D3436;
`;