// Simple email proxy server using Express.js
// This should be deployed to a server or cloud function

// Load environment variables
require('dotenv').config({ path: '.env.proxy' });

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

// Check if API key is provided
console.log('Resend API Key configured:', !!process.env.RESEND_API_KEY);
console.log('API Key starts with "re_"?:', process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_'));

// Initialize Resend with your API key
// In production, use environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Create SMTP transporter if SMTP credentials are provided
let smtpTransporter = null;
if (process.env.EMAILJS_SMTP_HOST && process.env.EMAILJS_SMTP_USER && process.env.EMAILJS_SMTP_PASS) {
  smtpTransporter = nodemailer.createTransport({
    host: process.env.EMAILJS_SMTP_HOST,
    port: parseInt(process.env.EMAILJS_SMTP_PORT || '587', 10),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAILJS_SMTP_USER,
      pass: process.env.EMAILJS_SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false // Set to true in production with proper certificates
    }
  });

  // Verify SMTP connection
  smtpTransporter.verify((error, success) => {
    if (error) {
      console.error('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take messages');
    }
  });
}

app.options('/send-email', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.post('/send-email', async (req, res) => {
  try {
    console.log('Received email request:', req.body);
    
    const { from, to, subject, html } = req.body;
    
    // Validate input
    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      });
    }
    
    // Check if Resend is properly configured
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ 
        error: 'Resend API key not configured',
        details: 'Please set RESEND_API_KEY in .env.proxy file'
      });
    }
    
    // Send email using Resend
    const data = await resend.emails.send({
      from: from || process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });
    
    console.log('Email sent successfully:', data);
    res.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    
    // Handle specific error cases
    if (error.message && error.message.includes('Unauthorized')) {
      return res.status(401).json({ 
        error: 'Invalid Resend API key',
        details: 'Please check your RESEND_API_KEY environment variable'
      });
    }
    
    if (error.message && error.message.includes('rate_limit')) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        details: 'Too many requests, please try again later'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
});

// SMTP bulk email endpoint
app.options('/smtp-bulk-email', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

app.post('/smtp-bulk-email', async (req, res) => {
  try {
    console.log('Received SMTP bulk email request:', req.body);
    
    const { recipients, subject, html, text } = req.body;
    
    // Validate input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        error: 'Missing or invalid recipients array' 
      });
    }
    
    if (!subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: subject, html' 
      });
    }
    
    // Check if SMTP is configured
    if (!smtpTransporter) {
      return res.status(500).json({ 
        error: 'SMTP not configured',
        details: 'Please set EMAILJS_SMTP_HOST, EMAILJS_SMTP_USER, and EMAILJS_SMTP_PASS in .env.proxy file'
      });
    }
    
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    
    // Send emails to all recipients
    for (const recipient of recipients) {
      try {
        const mailOptions = {
          from: process.env.FROM_EMAIL || 'no-reply@suprisesuper.com',
          to: recipient.email,
          subject: subject,
          html: html,
          text: text,
        };
        
        await smtpTransporter.sendMail(mailOptions);
        sentCount++;
        console.log(`Email sent successfully to ${recipient.email}`);
      } catch (error) {
        failedCount++;
        errors.push(`Failed to send to ${recipient.email}: ${error.message}`);
        console.error(`Error sending email to ${recipient.email}:`, error);
      }
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    res.json({ 
      success: true,
      sent: sentCount,
      failed: failedCount,
      errors: errors
    });
  } catch (error) {
    console.error('SMTP bulk email error:', error);
    res.status(500).json({ 
      error: 'Failed to send bulk emails via SMTP',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    resendApiKeyConfigured: !!process.env.RESEND_API_KEY,
    resendApiKeyValidFormat: process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_'),
    smtpConfigured: !!smtpTransporter
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Send email endpoint: http://localhost:${PORT}/send-email`);
  console.log(`SMTP bulk email endpoint: http://localhost:${PORT}/smtp-bulk-email`);
  
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('WARNING: RESEND_API_KEY is not set in .env.proxy file');
    console.warn('Email sending will not work until you configure the API key');
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    console.warn('WARNING: RESEND_API_KEY does not start with "re_" - it may be invalid');
  } else {
    console.log('Resend API key is configured correctly');
  }
  
  // Check if SMTP is configured
  if (smtpTransporter) {
    console.log('SMTP is configured and ready');
  } else {
    console.warn('SMTP is not configured - bulk emails will fall back to Resend API');
  }
});