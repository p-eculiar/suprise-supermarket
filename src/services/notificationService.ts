import { supabase } from '../lib/supabase';
import toast from '../components/common/Toast';

export interface Notification {
  id: string;
  user_id: string;
  type: 'order_status' | 'delivery_update' | 'payment' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export class NotificationService {
  private static listeners: Map<string, () => void> = new Map();

  /**
   * Get all notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50
  ): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  /**
   * Create a new notification
   */
  static async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any,
    actionUrl?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert([{
          user_id: userId,
          type,
          title,
          message,
          data,
          action_url: actionUrl,
          read: false,
          created_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time notifications for a user
   */
  static subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): () => void {
    const channelId = `notifications:${userId}`;

    // Remove existing listener if any
    this.unsubscribeFromNotifications(userId);

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification;
          
          // Show toast notification
          this.showToastNotification(notification);
          
          // Call callback
          onNotification(notification);
          
          // Play notification sound (optional)
          this.playNotificationSound();
        }
      )
      .subscribe();

    // Store cleanup function
    const cleanup = () => {
      channel.unsubscribe();
    };

    this.listeners.set(userId, cleanup);

    return cleanup;
  }

  /**
   * Unsubscribe from notifications
   */
  static unsubscribeFromNotifications(userId: string): void {
    const cleanup = this.listeners.get(userId);
    if (cleanup) {
      cleanup();
      this.listeners.delete(userId);
    }
  }

  /**
   * Show toast notification
   */
  private static showToastNotification(notification: Notification): void {
    const typeConfig = {
      order_status: { icon: '📦', duration: 5000 },
      delivery_update: { icon: '🚚', duration: 5000 },
      payment: { icon: '💳', duration: 5000 },
      promotion: { icon: '🎉', duration: 7000 },
      system: { icon: '🔔', duration: 4000 },
    };

    const config = typeConfig[notification.type] || typeConfig.system;

    toast.info(`${config.icon} ${notification.title}: ${notification.message}`);
  }

  /**
   * Play notification sound
   */
  private static playNotificationSound(): void {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors (user hasn't interacted with page yet)
      });
    } catch (error) {
      // Ignore errors
    }
  }

  /**
   * Request browser notification permission
   */
  static async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification
   */
  static showBrowserNotification(notification: Notification): void {
    if (Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo192.png',
        badge: '/logo192.png',
        tag: notification.id,
        requireInteraction: false,
      });

      browserNotification.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        browserNotification.close();
      };
    }
  }

  /**
   * Batch send notifications to multiple users
   */
  static async sendBatchNotifications(
    userIds: string[],
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<number> {
    try {
      const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      return notifications.length;
    } catch (error) {
      console.error('Error sending batch notifications:', error);
      return 0;
    }
  }

  /**
   * Send order status notification
   */
  static async sendOrderStatusNotification(
    userId: string,
    orderId: string,
    status: string
  ): Promise<boolean> {
    const statusMessages: Record<string, { title: string; message: string }> = {
      pending: {
        title: 'Order Received',
        message: 'We have received your order and are processing it.',
      },
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and is being prepared.',
      },
      preparing: {
        title: 'Order Being Prepared',
        message: 'We are carefully preparing your items.',
      },
      out_for_delivery: {
        title: 'Out for Delivery',
        message: 'Your order is on its way!',
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered.',
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled.',
      },
    };

    const statusData = statusMessages[status] || {
      title: 'Order Update',
      message: 'Your order status has been updated.',
    };

    return this.createNotification(
      userId,
      'order_status',
      statusData.title,
      statusData.message,
      { orderId, status },
      `/dashboard/orders`
    );
  }

  /**
   * Send payment notification
   */
  static async sendPaymentNotification(
    userId: string,
    amount: number,
    status: 'success' | 'failed',
    reference: string
  ): Promise<boolean> {
    const title = status === 'success' 
      ? 'Payment Successful' 
      : 'Payment Failed';
    
    const message = status === 'success'
      ? `Your payment of $${amount.toFixed(2)} was successful.`
      : `Your payment of $${amount.toFixed(2)} failed. Please try again.`;

    return this.createNotification(
      userId,
      'payment',
      title,
      message,
      { amount, status, reference },
      '/dashboard/payment'
    );
  }

  /**
   * Send promotion notification
   */
  static async sendPromotionNotification(
    userIds: string[],
    title: string,
    message: string,
    promoCode?: string
  ): Promise<number> {
    return this.sendBatchNotifications(
      userIds,
      'promotion',
      title,
      message,
      { promoCode }
    );
  }
}
