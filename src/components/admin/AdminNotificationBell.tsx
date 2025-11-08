import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, Notification } from '../../services/notificationService';

const AdminNotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch admin notifications (all notifications for admins)
  const { data: notifications = [], error: notificationsError } = useQuery<Notification[], Error>({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      // For admins, we'll fetch a broader set of notifications
      if (!user?.id || user.role !== 'admin') {
        return [];
      }
      
      try {
        const result = await notificationService.getUserNotifications(user.id, 20);
        return result || [];
      } catch (error) {
        console.error('Error fetching admin notifications:', error);
        return [];
      }
    },
    enabled: !!user?.id && user.role === 'admin',
  });

  // Fetch unread count for admins
  const { data: unreadCount = 0, error: unreadCountError } = useQuery<number, Error>({
    queryKey: ['admin-unread-count'],
    queryFn: async () => {
      if (!user?.id || user.role !== 'admin') {
        return 0;
      }
      
      try {
        const result = await notificationService.getUnreadCount(user.id);
        return result || 0;
      } catch (error) {
        console.error('Error fetching admin unread count:', error);
        return 0;
      }
    },
    enabled: !!user?.id && user.role === 'admin',
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(user?.id || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
    },
  });

  // Set up real-time subscription for admins
  useEffect(() => {
    if (!user?.id || user.role !== 'admin') return;

    const unsubscribe = notificationService.setupNotificationSubscription(
      user.id,
      'admin',
      () => {
        // Refetch notifications when new ones arrive
        queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-unread-count'] });
      }
    );

    return unsubscribe;
  }, [user?.id, user?.role, queryClient]);

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

  if (!user || user.role !== 'admin') return null;

  return (
    <NotificationContainer>
      <NotificationButton
        onClick={() => setIsOpen(!isOpen)}
        $hasUnread={unreadCount > 0}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiBell />
        {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
      </NotificationButton>

      <AnimatePresence>
      {isOpen && (
          <NotificationDropdown
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <NotificationHeader>
              <NotificationTitle>Admin Notifications</NotificationTitle>
            {unreadCount > 0 && (
                <MarkAllReadButton
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  Mark all read
                </MarkAllReadButton>
              )}
            </NotificationHeader>

          <NotificationList>
              {notifications.length === 0 ? (
              <EmptyState>
                  <FiBell size={32} />
                  <EmptyText>No notifications yet</EmptyText>
              </EmptyState>
            ) : (
              notifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.id}
                    $unread={!notification.read}
                    whileHover={{ backgroundColor: '#f8f9fa' }}
                >
                    <NotificationIcon>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                    
                  <NotificationContent>
                      <NotificationMessage>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                        <NotificationText>{notification.message}</NotificationText>
                        <NotificationTime>
                          {formatTimeAgo(notification.created_at)}
                        </NotificationTime>
                      </NotificationMessage>
                      
                      <NotificationActions>
                        {!notification.read && (
                          <ActionButton
                            onClick={() => handleMarkAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <FiCheck />
                          </ActionButton>
                        )}
                        <ActionButton
                          onClick={() => handleDeleteNotification(notification.id)}
                          title="Delete"
                          $danger
                        >
                          <FiTrash2 />
                        </ActionButton>
                      </NotificationActions>
                  </NotificationContent>
                </NotificationItem>
              ))
            )}
          </NotificationList>

          {notifications.length > 0 && (
              <NotificationFooter>
              <ViewAllLink href="/admin/notifications">View all notifications</ViewAllLink>
              </NotificationFooter>
          )}
        </NotificationDropdown>
      )}
      </AnimatePresence>
    </NotificationContainer>
  );
};

export default AdminNotificationBell;

// Animations
const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
`;

// Styled Components
const NotificationContainer = styled.div`
  position: relative;
`;

const NotificationButton = styled(motion.button)<{ $hasUnread: boolean }>`
  position: relative;
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
  
  svg {
    width: 20px;
    height: 20px;
    color: #636E72;
  }

  &:hover {
    background: #6C9A7F;
    border-color: #6C9A7F;
    
    svg {
      color: white;
    }
  }
  
  ${({ $hasUnread }) => $hasUnread && css`
    animation: ${pulse} 2s infinite;
  `}
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #E74C3C;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
`;

const NotificationDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #E1E8ED;
  overflow: hidden;
  z-index: 1000;
  
  @media (max-width: 768px) {
    width: 300px;
    right: -50px;
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #E1E8ED;
  background: #F8F9FA;
`;

const NotificationTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
    margin: 0;
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;

  &:hover {
    background: #6C9A7F15;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #DFE6E9;
    border-radius: 3px;
  }
`;

const NotificationItem = styled(motion.div)<{ $unread: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #F0F0F0;
  transition: all 0.3s ease;

  &:last-child {
    border-bottom: none;
  }
  
  ${({ $unread }) => $unread && `
    background: #E8F5EC;
    border-left: 3px solid #6C9A7F;
  `}
`;

const NotificationIcon = styled.div`
  font-size: 1.25rem;
  margin-top: 0.125rem;
`;

const NotificationContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
`;

const NotificationMessage = styled.div`
  flex: 1;
`;

const NotificationText = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.25rem;
  line-height: 1.4;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.3s ease;

  ${NotificationItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: ${({ $danger }) => $danger ? '#E74C3C15' : '#6C9A7F15'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    width: 14px;
    height: 14px;
    color: ${({ $danger }) => $danger ? '#E74C3C' : '#6C9A7F'};
  }

  &:hover {
    background: ${({ $danger }) => $danger ? '#E74C3C' : '#6C9A7F'};
    
    svg {
      color: white;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #999;
  
  svg {
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }
`;

const EmptyText = styled.div`
  font-size: 0.875rem;
`;

const NotificationFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #E1E8ED;
  background: #F8F9FA;
  text-align: center;
`;

const ViewAllLink = styled.a`
  color: #6C9A7F;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;