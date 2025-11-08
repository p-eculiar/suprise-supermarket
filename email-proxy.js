// Simple email proxy server using Express.js
// This should be deployed to a server or cloud function

// Load environment variables
require('dotenv').config({ path: '.env.proxy' });

const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Check if API key is provided
console.log('Resend API Key configured:', !!process.env.RESEND_API_KEY);
console.log('API Key starts with "re_"?:', process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_'));

// Initialize Resend with your API key
// In production, use environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    resendApiKeyConfigured: !!process.env.RESEND_API_KEY,
    resendApiKeyValidFormat: process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email proxy server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Send email endpoint: http://localhost:${PORT}/send-email`);
  
  // Check if API key is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('WARNING: RESEND_API_KEY is not set in .env.proxy file');
    console.warn('Email sending will not work until you configure the API key');
  } else if (!process.env.RESEND_API_KEY.startsWith('re_')) {
    console.warn('WARNING: RESEND_API_KEY does not start with "re_" - it may be invalid');
  } else {
    console.log('Resend API key is configured correctly');
  }
});