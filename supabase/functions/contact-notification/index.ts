// Supabase Edge Function for contact form notifications
// This function is triggered when a new contact is submitted

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Function to send email using Email.js
async function sendEmail(contact: any): Promise<boolean> {
  try {
    // Get Email.js configuration from environment variables
    const serviceId = Deno.env.get('EMAILJS_SERVICE_ID');
    const templateId = Deno.env.get('EMAILJS_TEMPLATE_ID');
    const userId = Deno.env.get('EMAILJS_USER_ID');
    
    if (!serviceId || !templateId || !userId) {
      console.error('Email.js configuration not complete');
      return false;
    }

    // Prepare email data
    const emailData = {
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      template_params: {
        from_name: 'Surprise Supermarket Contact Form',
        to_name: 'Admin',
        from_email: contact.email,
        to_email: Deno.env.get('ADMIN_EMAIL_1') || 'chikwendupeculiar66@gmail.com',
        subject: `New Contact Form Submission: ${contact.subject || 'No Subject'}`,
        name: contact.name,
        email: contact.email,
        message: contact.message || 'No Message',
        reply_to: contact.email
      }
    };

    // Send email using Email.js API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': 'https://awepkphahdheqomgucby.supabase.co',
        'Referer': 'https://awepkphahdheqomgucby.supabase.co/'
      },
      body: JSON.stringify(emailData),
    });

    console.log('Email.js API response status:', response.status);
    
    if (response.ok) {
      console.log('Email sent successfully via Email.js');
      return true;
    } else {
      const errorText = await response.text();
      console.error('Email.js API error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('Error sending email via Email.js:', error);
    return false;
  }
}

// Main function to handle contact notifications
async function handleContactNotification(contact: any) {
  try {
    console.log('Processing contact notification for:', contact?.email || 'unknown');
    
    // Validate contact data
    if (!contact || !contact.email || !contact.name) {
      console.error('Invalid contact data received:', contact);
      return { success: false, error: 'Invalid contact data' };
    }
    
    // Get admin emails from environment variables
    const adminEmail1 = Deno.env.get('ADMIN_EMAIL_1') || 'chikwendupeculiar66@gmail.com';
    const adminEmail2 = Deno.env.get('ADMIN_EMAIL_2');

    // Send email to primary admin
    console.log(`Sending email to primary admin: ${adminEmail1}`);
    const primaryEmailSent = await sendEmail({
      ...contact,
      to_email: adminEmail1
    });
    
    // Send email to secondary admin if configured
    let secondaryEmailSent = true;
    if (adminEmail2 && adminEmail2 !== adminEmail1) {
      console.log(`Sending email to secondary admin: ${adminEmail2}`);
      secondaryEmailSent = await sendEmail({
        ...contact,
        to_email: adminEmail2
      });
    }

    if (primaryEmailSent || secondaryEmailSent) {
      console.log('Contact form email notification sent successfully');
    } else {
      console.warn('Failed to send contact form email notification to any admin');
    }
    
    return { success: true, message: 'Notification processed' };
  } catch (error) {
    console.error('Error processing contact notification:', error);
    return { success: false, error: error.message };
  }
}

// HTTP endpoint for testing
serve(async (req) => {
  try {
    // Log the incoming request
    console.log('Received request:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    });
    
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
    
    // Parse the request body
    let contactData: any = null;
    try {
      const body = await req.json();
      contactData = body.contact || body;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      // Try to get raw body
      try {
        const text = await req.text();
        console.log('Raw request body:', text);
        contactData = JSON.parse(text).contact || JSON.parse(text);
      } catch (textError) {
        console.error('Error parsing raw body:', textError);
        contactData = {};
      }
    }
    
    console.log('Parsed contact data:', contactData);
    
    // Process the contact notification
    const result = await handleContactNotification(contactData);
    
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