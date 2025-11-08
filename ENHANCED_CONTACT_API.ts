// Enhanced contact API with email notifications
import { supabase } from '../lib/supabase';
import { EmailNotificationService } from './emailService';

// Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// API methods
export const contactApi = {
  /**
   * Submit contact form data to the server and send email notification
   * @param data Contact form data
   * @returns Promise with success status and message
   */
  submitContactForm: async (data: ContactFormData): Promise<{ success: boolean; message: string }> => {
    try {
      // First, save the contact data to the database
      const { error: insertError } = await supabase.from('contacts').insert([data]);

      if (insertError) {
        throw insertError;
      }

      // Send email notification to admin emails
      try {
        // Get admin emails from environment variables
        const adminEmail1 = process.env.REACT_APP_ADMIN_EMAIL_1 || 'chikwendupeculiar66@gmail.com';
        const adminEmail2 = process.env.REACT_APP_ADMIN_EMAIL_2 || 'surpry1980@yahoo.com';
        
        const adminEmails = [adminEmail1];
        if (adminEmail2 && adminEmail2 !== adminEmail1) {
          adminEmails.push(adminEmail2);
        }

        // Create email content
        const emailSubject = `New Contact Form Submission: ${data.subject}`;
        const emailHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .field { margin-bottom: 20px; }
                .label { font-weight: bold; color: #6C9A7F; }
                .footer { text-align: center; margin-top: 30px; padding: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>New Contact Form Submission</h1>
                  <p>Surprise Supermarket</p>
                </div>
                <div class="content">
                  <h2>Contact Details</h2>
                  
                  <div class="field">
                    <div class="label">Name:</div>
                    <div>${data.name}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Email:</div>
                    <div>${data.email}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Subject:</div>
                    <div>${data.subject}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Message:</div>
                    <div>${data.message}</div>
                  </div>
                  
                  <div class="field">
                    <div class="label">Submitted:</div>
                    <div>${new Date().toLocaleString()}</div>
                  </div>
                </div>
                <div class="footer">
                  <p>This email was sent from the contact form on Surprise Supermarket website.</p>
                  <p>&copy; ${new Date().getFullYear()} Surprise Supermarket. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        // Send email to all admin emails
        let emailSent = false;
        for (const adminEmail of adminEmails) {
          try {
            const sent = await EmailNotificationService.sendIndividualEmail(
              adminEmail,
              emailSubject,
              emailHtml
            );
            
            if (sent) {
              emailSent = true;
              console.log(`Contact form notification sent to ${adminEmail}`);
            } else {
              console.warn(`Failed to send contact form notification to ${adminEmail}`);
            }
          } catch (emailError) {
            console.error(`Error sending email to ${adminEmail}:`, emailError);
          }
        }

        if (emailSent) {
          console.log('Contact form email notification sent successfully');
        } else {
          console.warn('Failed to send contact form email notification to any admin');
        }
      } catch (emailError) {
        console.error('Error sending contact form email notification:', emailError);
        // Don't throw here - we still want to consider the form submission successful
        // even if email notification fails
      }

      return { success: true, message: 'Form submitted successfully! We\'ll get back to you soon.' };
    } catch (error: any) {
      console.error('Contact form submission error:', error);
      throw new Error(error.message || 'Failed to submit contact form');
    }
  },
};