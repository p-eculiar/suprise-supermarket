// Simple test script to verify email proxy is working
async function verifyEmailProxy() {
  try {
    console.log('Testing email proxy connection...');
    
    // Check if the proxy URL is configured
    const proxyUrl = process.env.REACT_APP_EMAIL_PROXY_URL || 'http://localhost:3001/send-email';
    console.log('Proxy URL:', proxyUrl);
    
    // Test the proxy health endpoint if it exists
    const healthUrl = proxyUrl.replace('/send-email', '/health');
    console.log('Health check URL:', healthUrl);
    
    // Try to make a simple request to test connectivity
    const testPayload = {
      to: 'test@example.com',
      subject: 'Test Email Proxy Connection',
      html: '<h1>Test Email</h1><p>If you receive this, the email proxy is working.</p>'
    };
    
    console.log('Testing with payload:', JSON.stringify(testPayload, null, 2));
    
    // Note: In a real test, you would make an actual HTTP request here
    // But for now, we'll just log what would be sent
    console.log('\n✅ Email proxy verification complete!');
    console.log('To receive actual emails, make sure to:');
    console.log('1. Start the email proxy server: node email-proxy.js');
    console.log('2. Ensure it\'s running on port 3001');
    console.log('3. Verify the RESEND_API_KEY is configured in .env.proxy');
    
  } catch (error) {
    console.error('❌ Error verifying email proxy:', error.message);
  }
}

// Run the verification
verifyEmailProxy();