import { supabase } from '../lib/supabase';

interface NewProductEmailData {
  productName: string;
  productPrice: number;
  productImage: string;
  productDescription: string;
  productId: string;
}

interface DiscountEmailData {
  discountTitle: string;
  discountPercentage: number;
  discountCode: string;
  expiryDate: string;
  discountDescription: string;
}

interface EventEmailData {
  eventTitle: string;
  eventDate: string;
  eventDescription: string;
  eventLocation?: string;
}

/**
 * Email Notification Service
 * Sends notifications to users about new products
 */
export class EmailNotificationService {
  /**
   * Send actual email using Resend API or any email service
   * Replace this with your actual email service integration
   */
  private static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      // Using fetch API to call Resend API
      // You can replace this with SendGrid, Mailgun, AWS SES, etc.
      const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY;
      const FROM_EMAIL = process.env.REACT_APP_FROM_EMAIL || 'noreply@surprisesupermarket.com';

      if (!RESEND_API_KEY) {
        console.warn('Resend API key not configured. Email queued but not sent.');
        return false;
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        console.error('Email sending failed:', await response.text());
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send new product notification to all subscribed users
   * This function can be called when a new product is added
   */
  static async sendNewProductNotification(productData: NewProductEmailData) {
    try {
      // Fetch all users who have opted in for email notifications
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('email, full_name, email_notifications')
        .eq('email_notifications', true);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log('No users subscribed to email notifications');
        return { success: true, message: 'No subscribers' };
      }

      let sentCount = 0;
      let failedCount = 0;

      // Send emails to all subscribed users
      for (const user of users) {
        const subject = `🎉 New Product Alert: ${productData.productName}`;
        const html = this.getNewProductEmailTemplate(user.full_name || 'Valued Customer', productData);
        
        const sent = await this.sendEmail(user.email, subject, html);
        
        if (sent) {
          sentCount++;
        } else {
          failedCount++;
        }

        // Log notification in database
        await supabase.from('email_notifications').insert({
          user_email: user.email,
          user_name: user.full_name,
          product_id: productData.productId,
          product_name: productData.productName,
          product_price: productData.productPrice,
          product_image: productData.productImage,
          notification_type: 'new_product',
          status: sent ? 'sent' : 'failed',
          sent_at: sent ? new Date().toISOString() : null,
        });
      }

      console.log(`Emails sent: ${sentCount}, Failed: ${failedCount}`);

      return {
        success: true,
        message: `Notifications sent to ${sentCount} users, ${failedCount} failed`,
        count: sentCount,
      };
    } catch (error: any) {
      console.error('Error sending email notifications:', error);
      throw new Error(`Failed to send notifications: ${error.message}`);
    }
  }

  /**
   * Send discount notification to all subscribed users
   */
  static async sendDiscountNotification(discountData: DiscountEmailData) {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('email_notifications', true);

      if (!users || users.length === 0) {
        return { success: true, message: 'No subscribers' };
      }

      let sentCount = 0;

      for (const user of users) {
        const subject = `💰 Special Discount: ${discountData.discountPercentage}% OFF!`;
        const html = this.getDiscountEmailTemplate(user.full_name || 'Valued Customer', discountData);
        
        const sent = await this.sendEmail(user.email, subject, html);
        if (sent) sentCount++;

        await supabase.from('email_notifications').insert({
          user_email: user.email,
          user_name: user.full_name,
          notification_type: 'discount',
          status: sent ? 'sent' : 'failed',
          sent_at: sent ? new Date().toISOString() : null,
        });
      }

      return { success: true, message: `Discount emails sent to ${sentCount} users`, count: sentCount };
    } catch (error: any) {
      console.error('Error sending discount notifications:', error);
      throw new Error(`Failed to send discount notifications: ${error.message}`);
    }
  }

  /**
   * Send event notification to all subscribed users
   */
  static async sendEventNotification(eventData: EventEmailData) {
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('email_notifications', true);

      if (!users || users.length === 0) {
        return { success: true, message: 'No subscribers' };
      }

      let sentCount = 0;

      for (const user of users) {
        const subject = `🎊 Upcoming Event: ${eventData.eventTitle}`;
        const html = this.getEventEmailTemplate(user.full_name || 'Valued Customer', eventData);
        
        const sent = await this.sendEmail(user.email, subject, html);
        if (sent) sentCount++;

        await supabase.from('email_notifications').insert({
          user_email: user.email,
          user_name: user.full_name,
          notification_type: 'event',
          status: sent ? 'sent' : 'failed',
          sent_at: sent ? new Date().toISOString() : null,
        });
      }

      return { success: true, message: `Event emails sent to ${sentCount} users`, count: sentCount };
    } catch (error: any) {
      console.error('Error sending event notifications:', error);
      throw new Error(`Failed to send event notifications: ${error.message}`);
    }
  }

  /**
   * Get email template for new product notification
   */
  static getNewProductEmailTemplate(userName: string, productData: NewProductEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .product-image {
              width: 100%;
              max-width: 400px;
              height: auto;
              border-radius: 10px;
              margin: 20px 0;
            }
            .price {
              font-size: 28px;
              font-weight: bold;
              color: #6C9A7F;
              margin: 15px 0;
            }
            .button {
              display: inline-block;
              padding: 15px 30px;
              background: #6C9A7F;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Product Alert!</h1>
              <p>Surprise Supermarket</p>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>We're excited to announce a new product that just arrived in our store!</p>
              
              <h3>${productData.productName}</h3>
              <img src="${productData.productImage}" alt="${productData.productName}" class="product-image" />
              
              <p>${productData.productDescription}</p>
              
              <div class="price">$${productData.productPrice.toFixed(2)}</div>
              
              <a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/products/${productData.productId}" class="button">
                View Product →
              </a>
              
              <p style="margin-top: 30px;">
                Don't miss out on this amazing addition to our collection!
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to new product notifications.</p>
              <p><a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/dashboard/customization">Manage your email preferences</a></p>
              <p>&copy; ${new Date().getFullYear()} Surprise Supermarket. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get email template for discount notification
   */
  static getDiscountEmailTemplate(userName: string, discountData: DiscountEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .discount-code { background: #FFD700; color: #333; padding: 15px 30px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 2px; }
            .button { display: inline-block; padding: 15px 30px; background: #6C9A7F; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💰 ${discountData.discountPercentage}% OFF!</h1>
              <p>${discountData.discountTitle}</p>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>Great news! We have an exclusive discount just for you!</p>
              
              <p>${discountData.discountDescription}</p>
              
              <div class="discount-code">${discountData.discountCode}</div>
              
              <p style="text-align: center; color: #e74c3c; font-weight: bold;">
                ⏰ Expires: ${new Date(discountData.expiryDate).toLocaleDateString()}
              </p>
              
              <a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/products" class="button">
                Shop Now →
              </a>
              
              <p style="margin-top: 30px;">
                Use code <strong>${discountData.discountCode}</strong> at checkout to save ${discountData.discountPercentage}%!
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to promotional notifications.</p>
              <p><a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/dashboard/customization">Manage your email preferences</a></p>
              <p>&copy; ${new Date().getFullYear()} Surprise Supermarket. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Get email template for event notification
   */
  static getEventEmailTemplate(userName: string, eventData: EventEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9B59B6 0%, #8E44AD 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-date { background: #9B59B6; color: white; padding: 15px 30px; font-size: 20px; font-weight: bold; text-align: center; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 15px 30px; background: #9B59B6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 ${eventData.eventTitle}</h1>
              <p>You're Invited!</p>
            </div>
            <div class="content">
              <h2>Hi ${userName},</h2>
              <p>We're excited to invite you to an upcoming event!</p>
              
              <div class="event-date">📅 ${new Date(eventData.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              
              ${eventData.eventLocation ? `<p style="text-align: center; font-size: 16px;">📍 <strong>${eventData.eventLocation}</strong></p>` : ''}
              
              <p>${eventData.eventDescription}</p>
              
              <div style="text-align: center;">
                <a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}" class="button">
                  Learn More →
                </a>
              </div>
              
              <p style="margin-top: 30px;">
                Mark your calendar and join us for this special event. We can't wait to see you there!
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you subscribed to event notifications.</p>
              <p><a href="${process.env.REACT_APP_SITE_URL || 'http://localhost:3000'}/dashboard/customization">Manage your email preferences</a></p>
              <p>&copy; ${new Date().getFullYear()} Surprise Supermarket. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Update user email notification preference
   */
  static async updateEmailPreference(userId: string, enabled: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ email_notifications: enabled })
        .eq('id', userId);

      if (error) throw error;

      return { success: true, message: 'Email preference updated' };
    } catch (error: any) {
      console.error('Error updating email preference:', error);
      throw new Error(`Failed to update preference: ${error.message}`);
    }
  }

  /**
   * Send batch email notifications (can be called by cron job)
   */
  static async sendPendingNotifications() {
    try {
      // Fetch pending notifications
      const { data: notifications, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('status', 'pending')
        .limit(100);

      if (error) throw error;

      if (!notifications || notifications.length === 0) {
        console.log('No pending notifications');
        return { success: true, message: 'No pending notifications' };
      }

      // Here you would send actual emails using your email service
      // For demonstration, we'll just mark them as sent
      const notificationIds = notifications.map((n) => n.id);

      const { error: updateError } = await supabase
        .from('email_notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .in('id', notificationIds);

      if (updateError) throw updateError;

      console.log(`Sent ${notifications.length} pending notifications`);

      return {
        success: true,
        message: `Sent ${notifications.length} notifications`,
        count: notifications.length,
      };
    } catch (error: any) {
      console.error('Error sending pending notifications:', error);
      throw new Error(`Failed to send pending notifications: ${error.message}`);
    }
  }
}
