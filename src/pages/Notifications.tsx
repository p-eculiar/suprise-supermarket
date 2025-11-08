import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { FiBell, FiCheck, FiTrash2, FiFilter, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'order' | 'product' | 'promotion' | 'system'>('all');

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: () => notificationService.getUserNotifications(user?.id || ''),
    enabled: !!user?.id,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
    },
  });

  // Filter notifications based on selected filters
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read/unread status
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;
    
    // Filter by type
    if (selectedType !== 'all' && notification.type !== selectedType) return false;
    
    return true;
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDeleteNotification = (notificationId: string) => {
    deleteNotificationMutation.mutate(notificationId);
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return '🛒';
      case 'product': return '📦';
      case 'promotion': return '🎉';
      case 'system': return '🔔';
      default: return '🔔';
    }
  };

  if (!user) {
    return (
      <Container>
        <EmptyState>
          <FiBell size={48} />
          <h3>Please login to view notifications</h3>
          <p>You need to be logged in to see your notifications.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Notifications</Title>
        {notifications.filter(n => !n.read).length > 0 && (
          <MarkAllReadButton
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            Mark all as read
          </MarkAllReadButton>
        )}
      </Header>

      <Filters>
        <FilterGroup>
          <FilterLabel>Status:</FilterLabel>
          <FilterButton 
            $active={filter === 'all'} 
            onClick={() => setFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            $active={filter === 'unread'} 
            onClick={() => setFilter('unread')}
          >
            Unread
          </FilterButton>
          <FilterButton 
            $active={filter === 'read'} 
            onClick={() => setFilter('read')}
          >
            Read
          </FilterButton>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>Type:</FilterLabel>
          <FilterButton 
            $active={selectedType === 'all'} 
            onClick={() => setSelectedType('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            $active={selectedType === 'order'} 
            onClick={() => setSelectedType('order')}
          >
            Orders
          </FilterButton>
          <FilterButton 
            $active={selectedType === 'product'} 
            onClick={() => setSelectedType('product')}
          >
            Products
          </FilterButton>
          <FilterButton 
            $active={selectedType === 'promotion'} 
            onClick={() => setSelectedType('promotion')}
          >
            Promotions
          </FilterButton>
          <FilterButton 
            $active={selectedType === 'system'} 
            onClick={() => setSelectedType('system')}
          >
            System
          </FilterButton>
        </FilterGroup>
      </Filters>

      {isLoading ? (
        <LoadingState>
          <FiBell className="spinner" />
          <p>Loading notifications...</p>
        </LoadingState>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState>
          <FiBell size={48} />
          <h3>No notifications found</h3>
          <p>
            {filter === 'unread' 
              ? "You don't have any unread notifications." 
              : "You don't have any notifications matching your filters."}
          </p>
        </EmptyState>
      ) : (
        <NotificationList>
          {filteredNotifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              $unread={!notification.read}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NotificationIcon>
                {getNotificationIcon(notification.type)}
              </NotificationIcon>
              
              <NotificationContent>
                <NotificationHeader>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationTime>
                    {formatTimeAgo(notification.created_at)}
                  </NotificationTime>
                </NotificationHeader>
                
                <NotificationMessage>{notification.message}</NotificationMessage>
                
                <NotificationActions>
                  {!notification.read && (
                    <ActionButton
                      onClick={() => handleMarkAsRead(notification.id)}
                      title="Mark as read"
                    >
                      <FiCheck />
                      Mark as read
                    </ActionButton>
                  )}
                  <ActionButton
                    onClick={() => handleDeleteNotification(notification.id)}
                    title="Delete"
                    $danger
                  >
                    <FiTrash2 />
                    Delete
                  </ActionButton>
                </NotificationActions>
              </NotificationContent>
            </NotificationItem>
          ))}
        </NotificationList>
      )}
    </Container>
  );
};

export default Notifications;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
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

const MarkAllReadButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #5A8470;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const Filters = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.span`
  font-weight: 600;
  color: #2D3436;
  white-space: nowrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$active ? '#6C9A7F' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border: 1px solid ${props => props.$active ? '#6C9A7F' : '#DFE6E9'};
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$active ? '#5A8470' : '#F8F9FA'};
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #636E72;
  
  .spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2D3436;
  }
  
  p {
    margin: 0;
    max-width: 400px;
  }
`;

const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const NotificationItem = styled.div<{ $unread: boolean }>`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 3px solid ${props => props.$unread ? '#6C9A7F' : 'transparent'};
  
  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const NotificationIcon = styled.div`
  font-size: 1.5rem;
  margin-top: 0.25rem;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3436;
`;

const NotificationTime = styled.div`
  font-size: 0.875rem;
  color: #999;
  white-space: nowrap;
`;

const NotificationMessage = styled.p`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #636E72;
  line-height: 1.6;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$danger ? '#E74C3C15' : '#6C9A7F15'};
  color: ${props => props.$danger ? '#E74C3C' : '#6C9A7F'};
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$danger ? '#E74C3C' : '#6C9A7F'};
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;