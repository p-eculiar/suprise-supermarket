import { supabase } from '../lib/supabase';
import toast from '../components/common/Toast';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'promotion' | 'system';
  read: boolean;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  order_updates: boolean;
  product_alerts: boolean;
  promotions: boolean;
}

class NotificationService {
  // Create a new notification
  async createNotification(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get user notifications with real-time updates
  async getUserNotifications(userId: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Set up real-time notification subscription for users
  setupUserNotificationSubscription(userId: string, onNotification: (notification: Notification) => void) {
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          onNotification(newNotification);
          
          // Show toast notification
          this.showToastNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Set up real-time notification subscription for admins
  setupAdminNotificationSubscription(onNotification: (notification: Notification) => void) {
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          onNotification(newNotification);
          
          // Show toast notification
          this.showToastNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Enhanced setupNotificationSubscription that works for both users and admins
  setupNotificationSubscription(userId: string, userRole: string, onNotification: (notification: Notification) => void) {
    // For admins, subscribe to all notifications
    if (userRole === 'admin') {
      return this.setupAdminNotificationSubscription(onNotification);
    }
    
    // For regular users, subscribe to their notifications only
    return this.setupUserNotificationSubscription(userId, onNotification);
  }

  // Show toast notification based on type
  private showToastNotification(notification: Notification) {
    switch (notification.type) {
      case 'order':
        toast.info(`${notification.title}: ${notification.message}`);
        break;
      case 'product':
        toast.success(`${notification.title}: ${notification.message}`);
        break;
      case 'promotion':
        toast.warning(`${notification.title}: ${notification.message}`);
        break;
      case 'system':
        toast.info(`${notification.title}: ${notification.message}`);
        break;
      default:
        toast.info(notification.message);
    }
  }

  // Create admin notification
  async createAdminNotification(title: string, message: string, type: 'order' | 'product' | 'promotion' | 'system' = 'system', data?: any) {
    try {
      // Get all admin users
      const { data: admins, error: adminError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'admin');

      if (adminError) throw adminError;

      if (admins && admins.length > 0) {
        // Create notifications for all admins
        const notifications = admins.map((admin: any) => ({
          user_id: admin.id,
          title,
          message,
          type,
          read: false,
          data
        }));

        const { error: insertError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error creating admin notifications:', error);
      throw error;
    }
  }

  // Create order-related notifications for both user and admins
  async createOrderNotification(userId: string, orderId: string, status: string, orderNumber?: string) {
    const notificationMap = {
      'pending': {
        title: 'Order Received! 🛒',
        message: `Your order ${orderNumber ? `#${orderNumber}` : 'has been received'} and is being processed.`
      },
      'processing': {
        title: 'Order Processing! ⚙️',
        message: `Your order ${orderNumber ? `#${orderNumber}` : 'is being prepared'} and will be shipped soon.`
      },
      'shipped': {
        title: 'Order Shipped! 🚚',
        message: `Great news! Your order ${orderNumber ? `#${orderNumber}` : 'has been shipped'} and is on its way.`
      },
      'delivered': {
        title: 'Order Delivered! ✅',
        message: `Your order ${orderNumber ? `#${orderNumber}` : 'has been delivered'} successfully. Enjoy your groceries!`
      },
      'cancelled': {
        title: 'Order Cancelled ❌',
        message: `Your order ${orderNumber ? `#${orderNumber}` : 'has been cancelled'}. If you have questions, please contact support.`
      }
    };

    const notification = notificationMap[status as keyof typeof notificationMap];
    if (notification) {
      // Create notification for the user
      await this.createNotification({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: 'order',
        read: false,
        data: { orderId, status }
      });

      // Create notification for admins
      await this.createAdminNotification(
        `Order Update: ${orderNumber || orderId}`,
        `${notification.title} - ${notification.message}`,
        'order',
        { orderId, status, userId, orderNumber }
      );
    }
  }

  // Create low stock notification for admins
  async createLowStockNotification(productId: string, productName: string, currentStock: number) {
    const { data: admins } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        title: 'Low Stock Alert! ⚠️',
        message: `${productName} is running low (${currentStock} units remaining). Consider restocking.`,
        type: 'product' as const,
        read: false,
        data: { productId, productName, currentStock }
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
    }
  }

  // Create promotion notification
  async createPromotionNotification(userIds: string[], title: string, message: string, promotionData?: any) {
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: 'promotion' as const,
      read: false,
      data: promotionData
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;
  }

  // Get notification statistics for user dashboard
  async getNotificationStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_notification_stats', { user_id: userId });
      if (error) throw error;
      return data[0] || {
        total_count: 0,
        unread_count: 0,
        order_notifications: 0,
        product_notifications: 0,
        promotion_notifications: 0,
        system_notifications: 0
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total_count: 0,
        unread_count: 0,
        order_notifications: 0,
        product_notifications: 0,
        promotion_notifications: 0,
        system_notifications: 0
      };
    }
  }

  // Get notification statistics for admin dashboard
  async getAdminNotificationStats() {
    try {
      const { data, error } = await supabase.rpc('get_admin_notification_stats');
      if (error) throw error;
      return data[0] || {
        total_count: 0,
        unread_count: 0,
        today_count: 0,
        order_notifications: 0,
        product_notifications: 0,
        promotion_notifications: 0,
        system_notifications: 0
      };
    } catch (error) {
      console.error('Error getting admin notification stats:', error);
      return {
        total_count: 0,
        unread_count: 0,
        today_count: 0,
        order_notifications: 0,
        product_notifications: 0,
        promotion_notifications: 0,
        system_notifications: 0
      };
    }
  }

  // Get notification preferences
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_notifications, push_notifications, order_updates, product_alerts, promotions')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data || {
        email_notifications: true,
        push_notifications: true,
        order_updates: true,
        product_alerts: true,
        promotions: true
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      return {
        email_notifications: true,
        push_notifications: true,
        order_updates: true,
        product_alerts: true,
        promotions: true
      };
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(preferences)
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  // Get detailed notification preferences
  async getDetailedNotificationPreferences(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting detailed notification preferences:', error);
      return [];
    }
  }

  // Update notification preference
  async updateNotificationPreference(
    userId: string,
    preferenceType: string,
    category: string,
    enabled: boolean
  ) {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          preference_type: preferenceType,
          category,
          enabled
        }, {
          onConflict: 'user_id,preference_type,category'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      return false;
    }
  }

  // Check if user should receive a specific type of notification
  async shouldReceiveNotification(userId: string, category: string, type: string = 'email') {
    try {
      // First check the detailed preferences
      const { data: detailedPrefs, error: detailedError } = await supabase
        .from('notification_preferences')
        .select('enabled')
        .eq('user_id', userId)
        .eq('preference_type', type)
        .eq('category', category)
        .single();

      if (!detailedError && detailedPrefs) {
        return detailedPrefs.enabled;
      }

      // Fallback to general preferences
      const { data: generalPrefs, error: generalError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!generalError && generalPrefs) {
        // Type-safe access to preference fields
        switch (type) {
          case 'email':
            return (generalPrefs as any).email_notifications !== false;
          case 'push':
            return (generalPrefs as any).push_notifications !== false;
          default:
            return true;
        }
      }

      // Default to true if no preferences found
      return true;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      return true;
    }
  }

  // Enhanced create notification that respects user preferences
  async createNotificationWithPreferences(notification: Omit<Notification, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Check if user wants this type of notification
      const shouldReceive = await this.shouldReceiveNotification(
        notification.user_id,
        notification.type,
        'email' // or 'push' depending on the notification type
      );

      if (!shouldReceive) {
        console.log(`User ${notification.user_id} has disabled ${notification.type} notifications`);
        return null;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      
      // Show toast notification
      this.showToastNotification(data);
      
      return data;
    } catch (error) {
      console.error('Error creating notification with preferences:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();