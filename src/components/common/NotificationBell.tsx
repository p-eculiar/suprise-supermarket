import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiX, FiCheck, FiPackage, FiDollarSign, FiGift } from 'react-icons/fi';
import { NotificationService, Notification } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      subscribeToNotifications();
      
      // Request permission for browser notifications
      NotificationService.requestNotificationPermission();
    }

    return () => {
      if (user) {
        NotificationService.unsubscribeFromNotifications(user.id);
      }
    };
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        NotificationService.getUserNotifications(user.id, 20),
        NotificationService.getUnreadCount(user.id),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    NotificationService.subscribeToNotifications(user.id, (notification) => {
      // Add new notification to list
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Show browser notification
      NotificationService.showBrowserNotification(notification);
    });
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev =>
        prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }

    // Navigate if action URL exists
    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    const success = await NotificationService.markAllAsRead(user.id);
    if (success) {
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    const success = await NotificationService.deleteNotification(notificationId);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const deleted = notifications.find(n => n.id === notificationId);
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order_status':
        return <FiPackage />;
      case 'delivery_update':
        return <FiPackage />;
      case 'payment':
        return <FiDollarSign />;
      case 'promotion':
        return <FiGift />;
      default:
        return <FiBell />;
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <BellContainer ref={dropdownRef}>
      <BellButton onClick={() => setIsOpen(!isOpen)}>
        <FiBell />
        {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </BellButton>

      {isOpen && (
        <NotificationDropdown>
          <DropdownHeader>
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <MarkAllButton onClick={handleMarkAllAsRead}>
                <FiCheck /> Mark all read
              </MarkAllButton>
            )}
          </DropdownHeader>

          <NotificationList>
            {isLoading ? (
              <LoadingMessage>Loading notifications...</LoadingMessage>
            ) : notifications.length === 0 ? (
              <EmptyState>
                <FiBell />
                <p>No notifications yet</p>
              </EmptyState>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  $read={notification.read}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <NotificationIcon $type={notification.type}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                  <NotificationContent>
                    <NotificationTitle>{notification.title}</NotificationTitle>
                    <NotificationMessage>{notification.message}</NotificationMessage>
                    <NotificationTime>{getTimeAgo(notification.created_at)}</NotificationTime>
                  </NotificationContent>
                  {!notification.read && <UnreadDot />}
                  <DeleteButton onClick={(e) => handleDeleteNotification(notification.id, e)}>
                    <FiX />
                  </DeleteButton>
                </NotificationItem>
              ))
            )}
          </NotificationList>

          {notifications.length > 0 && (
            <DropdownFooter>
              <ViewAllButton onClick={() => { navigate('/dashboard'); setIsOpen(false); }}>
                View All Notifications
              </ViewAllButton>
            </DropdownFooter>
          )}
        </NotificationDropdown>
      )}
    </BellContainer>
  );
};

export default NotificationBell;

// Styled Components
const BellContainer = styled.div`
  position: relative;
`;

const BellButton = styled.button`
  position: relative;
  background: none;
  border: none;
  color: #2D3436;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    background: #F8F9FA;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: #E74C3C;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 380px;
  max-width: 90vw;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;

  @media (max-width: 480px) {
    width: 100vw;
    right: -50vw;
    left: 50%;
    transform: translateX(-50%);
  }
`;

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #F8F9FA;

  h3 {
    margin: 0;
    font-size: 1.125rem;
    color: #2D3436;
  }
`;

const MarkAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
    background: #F0F7F5;
  }
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const LoadingMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: #636E72;
`;

const EmptyState = styled.div`
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.3;
  }

  p {
    margin: 0;
  }
`;

const NotificationItem = styled.div<{ $read: boolean }>`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  background: ${({ $read }) => ($read ? 'white' : '#F0F7F5')};
  border-bottom: 1px solid #F8F9FA;
  transition: all 0.2s ease;

  &:hover {
    background: #F8F9FA;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationIcon = styled.div<{ $type: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
  
  background: ${({ $type }) => {
    switch ($type) {
      case 'order_status':
        return '#E3F2FD';
      case 'delivery_update':
        return '#E8F5E9';
      case 'payment':
        return '#FFF3E0';
      case 'promotion':
        return '#F3E5F5';
      default:
        return '#F5F5F5';
    }
  }};

  color: ${({ $type }) => {
    switch ($type) {
      case 'order_status':
        return '#1976D2';
      case 'delivery_update':
        return '#388E3C';
      case 'payment':
        return '#F57C00';
      case 'promotion':
        return '#7B1FA2';
      default:
        return '#757575';
    }
  }};
`;

const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
`;

const NotificationMessage = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  line-height: 1.4;
  margin-bottom: 0.25rem;
`;

const NotificationTime = styled.div`
  font-size: 0.75rem;
  color: #B2BEC3;
`;

const UnreadDot = styled.div`
  width: 8px;
  height: 8px;
  background: #6C9A7F;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 0.25rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #636E72;
  cursor: pointer;
  padding: 0.25rem;
  opacity: 0;
  transition: all 0.2s ease;

  ${NotificationItem}:hover & {
    opacity: 1;
  }

  &:hover {
    color: #E74C3C;
  }
`;

const DropdownFooter = styled.div`
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #F8F9FA;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #F8F9FA;
  border: none;
  border-radius: 8px;
  color: #6C9A7F;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #6C9A7F;
    color: white;
  }
`;
