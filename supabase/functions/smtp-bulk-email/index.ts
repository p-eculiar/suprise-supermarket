// Supabase Edge Function for SMTP bulk email sending
// This function handles bulk email sending via SMTP with Resend API fallback

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface EmailRecipient {
  email: string;
  name?: string;
}

interface BulkEmailRequest {
  recipients: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
}

// Function to send email via SMTP using Deno's built-in SMTP client
async function sendEmailViaSMTP(
  recipient: EmailRecipient,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    // Get SMTP configuration from environment variables
    const smtpHost = Deno.env.get('EMAILJS_SMTP_HOST');
    const smtpPort = Deno.env.get('EMAILJS_SMTP_PORT');
    const smtpUsername = Deno.env.get('EMAILJS_SMTP_USER');
    const smtpPassword = Deno.env.get('EMAILJS_SMTP_PASS');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'no-reply@suprisesuper.com';

    if (!smtpHost || !smtpUsername || !smtpPassword) {
      console.error('SMTP configuration not complete');
      return false;
    }

    // For Deno, we'll use a different approach since there's no built-in SMTP client
    // We'll fall back to Resend API for now and implement SMTP later if needed
    console.log(`SMTP configuration detected but not implemented in Deno environment`);
    return false;
  } catch (error) {
    console.error(`Error with SMTP configuration:`, error);
    return false;
  }
}

// Function to send email via Resend API (fallback)
async function sendEmailViaResend(
  recipient: EmailRecipient,
  subject: string,
  html: string
): Promise<boolean> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

    if (!resendApiKey) {
      console.error('Resend API key not configured');
      return false;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient.email],
        subject: subject,
        html: html,
      }),
    });

    const result = await response.json();
    console.log('Resend API response:', result);

    if (response.ok) {
      console.log(`Email sent successfully via Resend to ${recipient.email}`);
      return true;
    } else {
      console.error(`Failed to send email via Resend to ${recipient.email}:`, result);
      return false;
    }
  } catch (error) {
    console.error(`Error sending email via Resend to ${recipient.email}:`, error);
    return false;
  }
}

// Main function to handle bulk email sending
async function handleBulkEmail(request: BulkEmailRequest) {
  try {
    console.log('Processing bulk email request for', request.recipients.length, 'recipients');

    // Validate request data
    if (!request.recipients || request.recipients.length === 0) {
      console.error('No recipients provided');
      return { success: false, error: 'No recipients provided' };
    }

    if (!request.subject || !request.html) {
      console.error('Missing subject or content');
      return { success: false, error: 'Missing subject or content' };
    }

    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Check if SMTP is configured
    const smtpHost = Deno.env.get('EMAILJS_SMTP_HOST');
    const smtpUser = Deno.env.get('EMAILJS_SMTP_USER');
    const smtpPass = Deno.env.get('EMAILJS_SMTP_PASS');

    const useSMTP = !!(smtpHost && smtpUser && smtpPass);

    // Send emails to all recipients
    for (const recipient of request.recipients) {
      try {
        let sent = false;

        if (useSMTP) {
          // Try to send via SMTP (currently not implemented in Deno)
          // For now, we'll just log that SMTP is configured
          console.log(`SMTP is configured but not yet implemented in Deno environment`);
          // sent = await sendEmailViaSMTP(
          //   recipient,
          //   request.subject,
          //   request.html,
          //   request.text
          // );
        }

        if (!sent) {
          // Fallback to Resend API
          sent = await sendEmailViaResend(
            recipient,
            request.subject,
            request.html
          );
        }

        if (sent) {
          sentCount++;
        } else {
          failedCount++;
          errors.push(`Failed to send to ${recipient.email}`);
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`Error processing email for ${recipient.email}:`, error);
        failedCount++;
        errors.push(`Error sending to ${recipient.email}: ${error.message}`);
      }
    }

    console.log(`Bulk email processing completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return {
      success: true,
      message: `Bulk email processing completed. Sent: ${sentCount}, Failed: ${failedCount}`,
      sent: sentCount,
      failed: failedCount,
      errors: errors
    };
  } catch (error) {
    console.error('Error processing bulk email request:', error);
    return { success: false, error: error.message };
  }
}

// HTTP endpoint
serve(async (req) => {
  try {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Parse the request body
    let requestData: BulkEmailRequest | null = null;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }

    // Process the bulk email request
    const result = await handleBulkEmail(requestData);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch (error) {
    console.error('Error in HTTP handler:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
});