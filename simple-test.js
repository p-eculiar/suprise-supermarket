// Simple test to verify the Resend API key is working
require('dotenv').config({ path: '.env.proxy' });

console.log('Environment variables:');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);

if (process.env.RESEND_API_KEY) {
  console.log('API Key length:', process.env.RESEND_API_KEY.length);
  console.log('Starts with "re_"?:', process.env.RESEND_API_KEY.startsWith('re_'));
}

// Test Resend
const { Resend } = require('resend');

try {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log('Resend initialized successfully');
} catch (error) {
  console.error('Error initializing Resend:', error.message);
}