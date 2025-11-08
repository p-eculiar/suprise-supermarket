import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notificationService';
import { supabase } from '../../lib/supabase';
import { FiBell, FiPackage, FiBox, FiTag, FiAlertCircle, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

const AdminNotificationDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');

  const { data: stats, refetch: refetchStats } = useQuery({
    queryKey: ['admin-notification-stats'],
    queryFn: () => notificationService.getAdminNotificationStats()
  });

  const { data: recentNotifications, refetch: refetchNotifications } = useQuery({
    queryKey: ['admin-recent-notifications', timeRange],
    queryFn: async () => {
      // Build date filter based on time range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          // Get start of the week (Sunday)
          const day = now.getDay();
          const diff = now.getDate() - day;
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          // Get start of the month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // Fetch recent notifications with time filter
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);
          
      if (error) throw error;
      return data || [];
    }
  });

  const handleRefresh = () => {
    refetchStats();
    refetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    console.log('=== markAsRead START ===');
    console.log('Notification ID:', notificationId);
    
    try {
      // First, verify we have a valid notification ID
      if (!notificationId) {
        console.error('Invalid notification ID');
        alert('Invalid notification ID.');
        return;
      }
      
      // Check current authentication state
      console.log('Checking authentication state...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        alert('Authentication error. Please refresh the page and try again.');
        return;
      }
      
      if (!user) {
        console.error('No authenticated user');
        alert('You must be logged in to mark notifications as read.');
        return;
      }
      
      console.log('Authenticated user:', user.id);
      
      // Try to update the notification - only set fields that exist
      console.log('Attempting to mark notification as read...');
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read: true
          // Do NOT set updated_at as it doesn't exist in the actual table
        })
        .eq('id', notificationId)
        .select()
        .single();
      
      console.log('Update result:', { data, error });
      
      if (error) {
        console.error('Update failed:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        alert(`Failed to mark notification as read. Database error: ${error.message}`);
        return;
      }
      
      if (!data) {
        console.warn('No data returned from update');
        alert('Notification may have already been marked as read or does not exist.');
        return;
      }
      
      console.log('Successfully marked notification as read');
      
      // Refresh the notifications to update the UI
      refetchNotifications();
      refetchStats();
      
      console.log('=== markAsRead END ===');
    } catch (error: any) {
      console.error('Unexpected error in markAsRead:', error);
      const errorMessage = error.message || error.toString();
      alert(`Unexpected error: ${errorMessage}`);
      console.log('=== markAsRead END (ERROR) ===');
    }
  };

  const markAllAsRead = async () => {
    console.log('=== markAllAsRead START ===');
    
    try {
      // Check current authentication state
      console.log('Checking authentication state...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Authentication error:', authError);
        alert('Authentication error. Please refresh the page and try again.');
        return;
      }
      
      if (!user) {
        console.error('No authenticated user');
        alert('You must be logged in to mark notifications as read.');
        return;
      }
      
      console.log('Authenticated user:', user.id);
      
      // Check how many unread notifications exist
      console.log('Checking unread notifications...');
      const { count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
      
      if (countError) {
        console.error('Count error:', countError);
        alert(`Failed to count unread notifications: ${countError.message}`);
        return;
      }
      
      console.log('Unread notifications:', count);
      
      if (count === 0) {
        alert('No unread notifications to mark as read.');
        return;
      }
      
      // Try to mark all notifications as read - only set fields that exist
      console.log('Marking all notifications as read...');
      const { data, error } = await supabase
        .from('notifications')
        .update({ 
          read: true
          // Do NOT set updated_at as it doesn't exist in the actual table
        })
        .neq('read', true)
        .select();
      
      console.log('Bulk update result:', { data: data?.length, error });
      
      if (error) {
        console.error('Bulk update failed:', error);
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        alert(`Failed to mark all notifications as read. Database error: ${error.message}`);
        return;
      }
      
      console.log('Successfully marked all notifications as read');
      alert(`Successfully marked ${data?.length || 0} notifications as read.`);
      
      // Refresh the notifications to update the UI
      refetchNotifications();
      refetchStats();
      
      console.log('=== markAllAsRead END ===');
    } catch (error: any) {
      console.error('Unexpected error in markAllAsRead:', error);
      const errorMessage = error.message || error.toString();
      alert(`Unexpected error: ${errorMessage}`);
      console.log('=== markAllAsRead END (ERROR) ===');
    }
  };

  return (
    <Container>
      <Header>
        <Title>Notification Dashboard</Title>
        <ButtonGroup>
          <RefreshButton onClick={markAllAsRead}>
            Mark All Read
          </RefreshButton>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
          </RefreshButton>
        </ButtonGroup>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiBell />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.total_count?.toLocaleString() || 0}</StatValue>
            <StatLabel>Total Notifications</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#FF9800">
            <FiAlertCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.unread_count?.toLocaleString() || 0}</StatValue>
            <StatLabel>Unread</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#2196F3">
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.order_notifications?.toLocaleString() || 0}</StatValue>
            <StatLabel>Order Updates</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#9C27B0">
            <FiBox />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.product_notifications?.toLocaleString() || 0}</StatValue>
            <StatLabel>Product Alerts</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4CAF50">
            <FiTag />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.promotion_notifications?.toLocaleString() || 0}</StatValue>
            <StatLabel>Promotions</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#F44336">
            <FiAlertCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats?.system_notifications?.toLocaleString() || 0}</StatValue>
            <StatLabel>System Alerts</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionHeader>
          <h3>Recent Notifications</h3>
          <TimeRangeSelector>
            <TimeRangeButton 
              $active={timeRange === 'today'} 
              onClick={() => setTimeRange('today')}
            >
              Today
            </TimeRangeButton>
            <TimeRangeButton 
              $active={timeRange === 'week'} 
              onClick={() => setTimeRange('week')}
            >
              This Week
            </TimeRangeButton>
            <TimeRangeButton 
              $active={timeRange === 'month'} 
              onClick={() => setTimeRange('month')}
            >
              This Month
            </TimeRangeButton>
          </TimeRangeSelector>
        </SectionHeader>
        
        <NotificationList>
          {recentNotifications && recentNotifications.length > 0 ? (
            recentNotifications.map((notification: any, index: number) => (
              <NotificationItem
                key={notification.id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                $read={notification.read}
              >
                <NotificationIcon>
                  {notification.type === 'order' && <FiPackage />}
                  {notification.type === 'product' && <FiBox />}
                  {notification.type === 'promotion' && <FiTag />}
                  {notification.type === 'system' && <FiAlertCircle />}
                </NotificationIcon>
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationMeta>
                    <NotificationTime>
                      {new Date(notification.created_at).toLocaleString()}
                    </NotificationTime>
                    {!notification.read && (
                      <>
                        <UnreadBadge>Unread</UnreadBadge>
                        <MarkAsReadButton onClick={() => markAsRead(notification.id)}>
                          <FiCheck size={14} />
                          Mark as Read
                        </MarkAsReadButton>
                      </>
                    )}
                  </NotificationMeta>
                </NotificationContent>
              </NotificationItem>
            ))
          ) : (
            <EmptyState>
              <FiBell size={32} />
              <p>No recent notifications</p>
            </EmptyState>
          )}
        </NotificationList>
      </Section>
    </Container>
  );
};

export default AdminNotificationDashboard;

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8470;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.85rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  background: ${props => props.$color}15;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const StatInfo = styled.div`
  flex: 1;
  
  @media (max-width: 480px) {
    min-width: 0;
  }
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
  word-break: break-word;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin: 0;
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }
`;

const TimeRangeSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const TimeRangeButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? '#6C9A7F' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border: 1px solid ${props => props.$active ? '#6C9A7F' : '#DFE6E9'};
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$active ? '#5A8470' : '#F8F9FA'};
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled.div<{ $read?: boolean }>`
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #E1E8ED;
  transition: all 0.3s ease;
  background: ${props => props.$read ? 'white' : '#FFF8E1'};
  
  &:hover {
    background: ${props => props.$read ? '#F8F9FA' : '#FFECB3'};
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    flex-direction: column;
  }
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #6C9A7F15;
  color: #6C9A7F;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.h4`
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  word-break: break-word;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
  color: #636E72;
  line-height: 1.5;
  word-break: break-word;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const UnreadBadge = styled.span`
  background: #FF9800;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
`;

const MarkAsReadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #45a049;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
  
  svg {
    @media (max-width: 480px) {
      width: 12px;
      height: 12px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #999;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    svg {
      width: 24px;
      height: 24px;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;