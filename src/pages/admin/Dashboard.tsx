import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { 
  FiShoppingCart, 
  FiDollarSign, 
  FiPackage, 
  FiUsers, 
  FiTrendingUp, 
  FiAlertTriangle, 
  FiRefreshCw,
  FiBell,
  FiCreditCard,
  FiActivity,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiXCircle
} from 'react-icons/fi';
import BankTransferManagement from '../../components/admin/BankTransferManagement';
import DocumentManagement from '../../components/admin/DocumentManagement';
import AdminNotificationDashboard from '../../components/admin/AdminNotificationDashboard';
import toast from '../../components/common/Toast';
import { useSettings } from '../../contexts/SettingsContext';

const AdminDashboard: React.FC = () => {
  const { settings, formatCurrency: formatCurrencyContext } = useSettings();
  const [inventoryAlerts, setInventoryAlerts] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    stats: true,
    alerts: true,
    orders: true
  });
  const toastTimeouts = useRef<{[key: string]: NodeJS.Timeout}>({});

  // Debounced toast function to prevent duplicate error messages
  const debouncedToastError = (key: string, message: string) => {
    // Clear existing timeout for this key
    if (toastTimeouts.current[key]) {
      clearTimeout(toastTimeouts.current[key]);
    }
    
    // Set new timeout
    toastTimeouts.current[key] = setTimeout(() => {
      toast.error(message);
    }, 100); // Small delay to prevent duplicates
  };

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      try {
        // First try to get stats from the view
        const { data: viewData, error: viewError } = await supabase
          .from('dashboard_stats')
          .select('*')
          .single();
        
        if (!viewError && viewData) {
          return viewData;
        }
        
        // Fallback: calculate stats directly
        const [
          { count: totalOrders, error: ordersError },
          { data: completedOrders, error: revenueError },
          { count: totalProducts, error: productsError },
          { count: totalUsers, error: usersError }
        ] = await Promise.all([
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total').eq('status', 'completed'),
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }) // Use profiles instead of users
        ]);

        if (ordersError) {
          console.error('Error fetching total orders:', ordersError);
        }
        
        if (revenueError) {
          console.error('Error fetching completed orders:', revenueError);
        }
        
        if (productsError) {
          console.error('Error fetching total products:', productsError);
        }
        
        if (usersError) {
          console.error('Error fetching total users:', usersError);
        }

        // Calculate total revenue from completed orders
        const totalRevenue = completedOrders 
          ? completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) 
          : 0;

        return {
          total_orders: totalOrders || 0,
          total_revenue: totalRevenue,
          total_products: totalProducts || 0,
          total_users: totalUsers || 0
        };
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        debouncedToastError('dashboard-stats', 'Failed to fetch dashboard stats');
        return {
          total_orders: 0,
          total_revenue: 0,
          total_products: 0,
          total_users: 0
        };
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const { data: recentOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            customer_name,
            total,
            status,
            created_at
          `)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching recent orders:', error);
          debouncedToastError('recent-orders', 'Failed to fetch recent orders');
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error('Error fetching recent orders:', error);
        debouncedToastError('recent-orders', 'Failed to fetch recent orders');
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const { refetch: refetchInventoryAlerts } = useQuery({
    queryKey: ['admin-inventory-alerts'],
    queryFn: async () => {
      try {
        // First check if the inventory_alerts table exists by trying a simple query
        const { data, error } = await supabase
          .from('inventory_alerts')
          .select('*')
          .eq('resolved', false)
          .limit(10);
          
        // If we get a "table not found" error, it's expected in some environments
        if (error && error.message.includes('schema cache')) {
          console.log('Inventory alerts table not available in this environment');
          setInventoryAlerts([]);
          return [];
        }
        
        if (error) {
          console.error('Error fetching inventory alerts:', error);
          // Don't show toast error for inventory alerts as it might not exist yet
          // debouncedToastError('inventory-alerts', 'Failed to fetch inventory alerts');
          return [];
        }
        
        setInventoryAlerts(data || []);
        return data || [];
      } catch (error) {
        console.error('Error fetching inventory alerts:', error);
        // Don't show toast error for inventory alerts as it might not exist yet
        // debouncedToastError('inventory-alerts', 'Failed to fetch inventory alerts');
        return [];
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
  });

  const refetchAll = () => {
    refetchStats();
    refetchOrders();
    refetchInventoryAlerts();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    refetchInventoryAlerts();
    
    // Cleanup timeouts on unmount
    return () => {
      Object.values(toastTimeouts.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [refetchInventoryAlerts]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle color="#4CAF50" />;
      case 'pending':
        return <FiClock color="#FF9800" />;
      case 'processing':
        return <FiActivity color="#2196F3" />;
      case 'cancelled':
        return <FiXCircle color="#F44336" />;
      default:
        return <FiClock color="#9E9E9E" />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <MobileMenuButton onClick={() => setIsSidebarOpen(true)}>
              <FiMenu size={24} />
            </MobileMenuButton>
            <Title>Admin Dashboard</Title>
          </HeaderLeft>
          <HeaderRight>
            <RefreshButton onClick={refetchAll}>
              <FiRefreshCw />
            </RefreshButton>
          </HeaderRight>
        </HeaderContent>
      </Header>

      <MainContent>
        <Sidebar $isOpen={isSidebarOpen}>
          <SidebarHeader>
            <h2>Navigation</h2>
            <CloseSidebarButton onClick={() => setIsSidebarOpen(false)}>
              <FiX size={24} />
            </CloseSidebarButton>
          </SidebarHeader>
          <NavSection>
            <NavItem 
              $active={activeSection === 'overview'} 
              onClick={() => setActiveSection('overview')}
            >
              <FiActivity /> Dashboard Overview
            </NavItem>
            <NavItem 
              $active={activeSection === 'notifications'} 
              onClick={() => setActiveSection('notifications')}
            >
              <FiBell /> Notifications
            </NavItem>
            <NavItem 
              $active={activeSection === 'payments'} 
              onClick={() => setActiveSection('payments')}
            >
              <FiCreditCard /> Payments
            </NavItem>
            <NavItem 
              $active={activeSection === 'documents'} 
              onClick={() => setActiveSection('documents')}
            >
              <FiPackage /> Documents
            </NavItem>
          </NavSection>
        </Sidebar>

        <Overlay $isOpen={isSidebarOpen} onClick={() => setIsSidebarOpen(false)} />

        <ContentArea>
          {activeSection === 'overview' && (
            <>
              <WelcomeSection>
                <WelcomeContent>
                  <WelcomeTitle>Welcome back, Admin</WelcomeTitle>
                  <WelcomeSubtitle>Here's what's happening with your store today</WelcomeSubtitle>
                </WelcomeContent>
              </WelcomeSection>

              <Section $expanded={expandedSections.stats}>
                <SectionHeader onClick={() => toggleSection('stats')}>
                  <SectionTitle>Performance Metrics</SectionTitle>
                  <SectionToggle>
                    {expandedSections.stats ? <FiChevronUp /> : <FiChevronDown />}
                  </SectionToggle>
                </SectionHeader>
                {expandedSections.stats && (
                  <StatsGrid>
                    <StatCard>
                      <StatIcon $color="#4CAF50">
                        <FiShoppingCart />
                      </StatIcon>
                      <StatInfo>
                        <StatValue>{stats?.total_orders?.toLocaleString() || 0}</StatValue>
                        <StatLabel>Total Orders</StatLabel>
                        <StatTrend positive>+12% from last week</StatTrend>
                      </StatInfo>
                    </StatCard>

                    <StatCard>
                      <StatIcon $color="#2196F3">
                        <FiDollarSign />
                      </StatIcon>
                      <StatInfo>
                        <StatValue>{formatCurrencyContext(stats?.total_revenue || 0)}</StatValue>
                        <StatLabel>Total Revenue</StatLabel>
                        <StatTrend positive>+8% from last week</StatTrend>
                      </StatInfo>
                    </StatCard>

                    <StatCard>
                      <StatIcon $color="#FF9800">
                        <FiPackage />
                      </StatIcon>
                      <StatInfo>
                        <StatValue>{stats?.total_products?.toLocaleString() || 0}</StatValue>
                        <StatLabel>Products</StatLabel>
                        <StatTrend positive>+3% from last week</StatTrend>
                      </StatInfo>
                    </StatCard>

                    <StatCard>
                      <StatIcon $color="#9C27B0">
                        <FiUsers />
                      </StatIcon>
                      <StatInfo>
                        <StatValue>{stats?.total_users?.toLocaleString() || 0}</StatValue>
                        <StatLabel>Users</StatLabel>
                        <StatTrend positive>+5% from last week</StatTrend>
                      </StatInfo>
                    </StatCard>
                  </StatsGrid>
                )}
              </Section>

              <Section $expanded={expandedSections.alerts}>
                <SectionHeader onClick={() => toggleSection('alerts')}>
                  <SectionTitle>Inventory Alerts</SectionTitle>
                  <SectionToggle>
                    {expandedSections.alerts ? <FiChevronUp /> : <FiChevronDown />}
                  </SectionToggle>
                </SectionHeader>
                {expandedSections.alerts && (
                  inventoryAlerts && inventoryAlerts.length > 0 ? (
                    <AlertsGrid>
                      {inventoryAlerts.slice(0, 6).map((alert: any) => (
                        <AlertCard key={alert.id} $type={alert.alert_type}>
                          <AlertIcon>
                            <FiAlertTriangle />
                          </AlertIcon>
                          <AlertContent>
                            <AlertTitle>{alert.product_name}</AlertTitle>
                            <AlertMessage>
                              {alert.alert_type === 'low_stock' && `${alert.current_stock} units remaining`}
                              {alert.alert_type === 'out_of_stock' && 'Product is out of stock'}
                            </AlertMessage>
                            <AlertTime>{formatDate(alert.created_at)}</AlertTime>
                          </AlertContent>
                        </AlertCard>
                      ))}
                    </AlertsGrid>
                  ) : (
                    <EmptyState>
                      <FiCheckCircle size={48} color="#4CAF50" />
                      <EmptyStateTitle>All Good!</EmptyStateTitle>
                      <EmptyStateMessage>No inventory alerts at the moment</EmptyStateMessage>
                    </EmptyState>
                  )
                )}
              </Section>

              <Section $expanded={expandedSections.orders}>
                <SectionHeader onClick={() => toggleSection('orders')}>
                  <SectionTitle>Recent Orders</SectionTitle>
                  <SectionToggle>
                    {expandedSections.orders ? <FiChevronUp /> : <FiChevronDown />}
                  </SectionToggle>
                </SectionHeader>
                {expandedSections.orders && (
                  <TableContainer>
                    <Table>
                      <thead>
                        <tr>
                          <TableHeader>Order ID</TableHeader>
                          <TableHeader>Customer</TableHeader>
                          <TableHeader>Amount</TableHeader>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Date</TableHeader>
                          <TableHeader>Actions</TableHeader>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders && recentOrders.length > 0 ? (
                          recentOrders.map((order: any) => (
                            <TableRow key={order.id}>
                              <TableCell>#{order.order_number || order.id.slice(0, 8)}</TableCell>
                              <TableCell>{order.customer_name}</TableCell>
                              <TableCell>{formatCurrencyContext(order.total || 0)}</TableCell>
                              <TableCell>
                                <StatusBadge $variant={getStatusVariant(order.status)}>
                                  {getStatusIcon(order.status)}
                                  <StatusText>
                                    {order.status?.charAt(0).toUpperCase() + (order.status?.slice(1) || '')}
                                  </StatusText>
                                </StatusBadge>
                              </TableCell>
                              <TableCell>{formatDate(order.created_at)}</TableCell>
                              <TableCell>
                                <ActionButton>
                                  <FiEye />
                                </ActionButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6}>
                              <EmptyState>
                                <FiShoppingCart size={48} color="#9E9E9E" />
                                <EmptyStateTitle>No Orders Yet</EmptyStateTitle>
                                <EmptyStateMessage>There are no recent orders to display</EmptyStateMessage>
                              </EmptyState>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </TableContainer>
                )}
              </Section>
            </>
          )}

          {activeSection === 'notifications' && <AdminNotificationDashboard />}

          {activeSection === 'payments' && (
            <Section>
              <SectionHeader>
                <SectionTitle>Bank Transfer Payments</SectionTitle>
              </SectionHeader>
              <BankTransferManagement />
            </Section>
          )}

          {activeSection === 'documents' && (
            <Section>
              <SectionHeader>
                <SectionTitle>Document Management</SectionTitle>
              </SectionHeader>
              <DocumentManagement />
            </Section>
          )}
        </ContentArea>
      </MainContent>
    </DashboardContainer>
  );
};

export default AdminDashboard;

// Styled Components
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf9 100%);
`;

const Header = styled.header`
  background: white;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid #eef2f7;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #2d3436;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3436;
  margin: 0;
  background: linear-gradient(90deg, #6c9a7f 0%, #4a7a64 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const RefreshButton = styled.button`
  background: #6c9a7f;
  border: none;
  cursor: pointer;
  color: white;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  
  &:hover {
    background: #5a8470;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.2);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: rotate(90deg);
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  width: 280px;
  background: white;
  border-right: 1px solid #eef2f7;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: sticky;
  top: 0;
  height: calc(100vh - 70px);
  overflow-y: auto;
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    position: fixed;
    top: 70px;
    left: 0;
    height: calc(100vh - 70px);
    z-index: 1000;
    transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
    box-shadow: 5px 0 25px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 480px) {
    width: 250px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;
  
  h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #2d3436;
    font-weight: 600;
  }
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: space-between;
  }
`;

const CloseSidebarButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: #636e72;
  padding: 0.5rem;
  border-radius: 8px;
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const NavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const NavItem = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$active ? '#6c9a7f' : '#636e72'};
  background: ${props => props.$active ? '#6c9a7f10' : 'transparent'};
  font-weight: ${props => props.$active ? '600' : '500'};
  border: 1px solid ${props => props.$active ? '#6c9a7f30' : 'transparent'};
  
  &:hover {
    background: ${props => props.$active ? '#6c9a7f15' : '#f8f9fa'};
    color: ${props => props.$active ? '#6c9a7f' : '#2d3436'};
    transform: translateX(3px);
  }
  
  svg {
    font-size: 1.25rem;
    min-width: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  
  @media (max-width: 768px) {
    display: ${props => props.$isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 999;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const WelcomeSection = styled.div`
  background: linear-gradient(120deg, #6c9a7f 0%, #4a7a64 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 30px rgba(108, 154, 127, 0.2);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
    transform: rotate(30deg);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
`;

const WelcomeTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Section = styled.div<{ $expanded?: boolean }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #eef2f7;
  
  &:hover {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  background: #fafbfc;
  border-bottom: 1px solid #eef2f7;
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.35rem;
  color: #2d3436;
  margin: 0;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
  }
`;

const SectionToggle = styled.div`
  color: #6c9a7f;
  font-size: 1.25rem;
  transition: transform 0.3s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.75rem;
  border-radius: 14px;
  display: flex;
  gap: 1.25rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid #eef2f7;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${props => props.$color}15;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  flex-shrink: 0;
  
  svg {
    width: 28px;
    height: 28px;
  }
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3436;
  margin-bottom: 0.25rem;
  word-break: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: #636e72;
  margin-bottom: 0.5rem;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const StatTrend = styled.div<{ positive: boolean }>`
  font-size: 0.85rem;
  color: ${props => props.positive ? '#4CAF50' : '#F44336'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: "${props => props.positive ? '▲' : '▼'}";
    font-size: 0.7rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.25rem;
    padding: 1.25rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
`;

const AlertCard = styled.div<{ $type: string }>`
  background: ${props => props.$type === 'low_stock' ? '#fff8e1' : '#ffebee'};
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  border: 1px solid ${props => props.$type === 'low_stock' ? '#ffecb3' : '#ffcdd2'};
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const AlertIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #ff980015;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff9800;
  flex-shrink: 0;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.div`
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 0.25rem;
  font-size: 1.05rem;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const AlertMessage = styled.div`
  color: #636e72;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const AlertTime = styled.div`
  font-size: 0.8rem;
  color: #9e9e9e;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #636e72;
  
  svg {
    margin-bottom: 1.5rem;
    opacity: 0.7;
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
    
    svg {
      width: 36px;
      height: 36px;
      margin-bottom: 1rem;
    }
  }
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  color: #2d3436;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const EmptyStateMessage = styled.p`
  font-size: 1rem;
  margin: 0;
  color: #636e72;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  padding: 1.5rem;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    &::-webkit-scrollbar {
      height: 6px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  
  @media (max-width: 768px) {
    min-width: 600px;
  }
  
  @media (max-width: 480px) {
    min-width: 500px;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #636e72;
  white-space: nowrap;
  border-bottom: 2px solid #eef2f7;
  
  &:first-child {
    border-top-left-radius: 8px;
  }
  
  &:last-child {
    border-top-right-radius: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.75rem 0.5rem;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #f8f9fa;
  }
  
  @media (max-width: 480px) {
    &:hover {
      background: #fafbfc;
    }
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2d3436;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    padding: 0.75rem 0.5rem;
  }
`;

const StatusBadge = styled.span<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$variant) {
      case 'success': return '#4caf5015';
      case 'warning': return '#ff980015';
      case 'info': return '#2196f315';
      case 'error': return '#f4433615';
      default: return '#e1e8ed';
    }
  }};
  color: ${props => {
    switch (props.$variant) {
      case 'success': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      case 'error': return '#f44336';
      default: return '#636e72';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$variant) {
      case 'success': return '#4caf5030';
      case 'warning': return '#ff980030';
      case 'info': return '#2196f330';
      case 'error': return '#f4433630';
      default: return '#e1e8ed';
    }
  }};
  
  @media (max-width: 480px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
`;

const StatusText = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6c9a7f15;
  color: #6c9a7f;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6c9a7f;
    color: white;
    transform: scale(1.05);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;