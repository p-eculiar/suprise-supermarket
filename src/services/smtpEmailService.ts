/**
 * SMTP Email Service using EmailJS SMTP relay
 * This service sends emails directly via EmailJS SMTP without any backend proxy
 */

interface EmailRecipient {
  email: string;
  name?: string;
}

export class SMTPEmailService {
  /**
   * Send bulk emails directly via EmailJS SMTP service
   * No backend proxy required!
   */
  static async sendBulkEmails(
    recipients: EmailRecipient[],
    subject: string,
    html: string,
    text?: string,
    delayMs: number = 100
  ): Promise<{ sent: number; failed: number; errors: string[] }> {
    try {
      // Get EmailJS SMTP configuration from environment variables
      const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
      const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
      const userId = process.env.REACT_APP_EMAILJS_USER_ID;

      if (!serviceId || !templateId || !userId) {
        throw new Error('EmailJS configuration not complete. Please set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_USER_ID in your .env file.');
      }

      let sentCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Send emails to all recipients using EmailJS API
      for (const recipient of recipients) {
        try {
          // Validate email address
          if (!recipient.email || !recipient.email.includes('@')) {
            errors.push(`Invalid email: ${recipient.email}`);
            failedCount++;
            continue;
          }

          // Prepare email data matching your EmailJS template parameter names
          const emailData = {
            service_id: serviceId,
            template_id: templateId,
            user_id: userId,
            template_params: {
              email: recipient.email,    // Changed from to_email to email (matches your template)
              name: recipient.name || 'Valued Customer',  // Changed from to_name to name (matches your template)
              subject: subject,         // This matches your template
              message: html.replace(/<[^>]*>/g, '') // Simple text version
            }
          };

          // Send email directly via EmailJS API
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });

          if (response.ok) {
            sentCount++;
            console.log(`✅ Email sent to ${recipient.email}`);
          } else {
            const errorText = await response.text();
            errors.push(`Failed to send to ${recipient.email}: ${response.status} - ${errorText}`);
            console.error(`❌ Failed to send to ${recipient.email}:`, response.status, errorText);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Error sending to ${recipient.email}: ${(error as Error).message}`);
          console.error(`Error sending to ${recipient.email}:`, error);
        }

        // Add delay between emails
        if (delayMs > 0 && recipient !== recipients[recipients.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }

      return {
        sent: sentCount,
        failed: failedCount,
        errors: errors
      };
    } catch (error) {
      console.error('Error sending bulk emails via EmailJS:', error);
      throw error;
    }
  }

  /**
   * Check if EmailJS SMTP service is configured
   */
  static isConfigured(): boolean {
    // Check if we have the required EmailJS environment variables
    const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
    const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
    const userId = process.env.REACT_APP_EMAILJS_USER_ID;
    
    return !!(serviceId && templateId && userId);
  }
}