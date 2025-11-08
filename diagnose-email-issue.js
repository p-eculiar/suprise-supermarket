// Diagnostic script to check email sending issues
// Run this in your browser console or as a Node.js script

async function diagnoseEmailIssue() {
  console.log('=== EMAIL SENDING DIAGNOSIS ===');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  console.log('REACT_APP_EMAIL_PROXY_URL:', process.env.REACT_APP_EMAIL_PROXY_URL);
  console.log('REACT_APP_FROM_EMAIL:', process.env.REACT_APP_FROM_EMAIL);
  console.log('REACT_APP_RESEND_API_KEY:', process.env.REACT_APP_RESEND_API_KEY ? 'SET' : 'NOT SET');
  
  // Test proxy connectivity
  const proxyUrl = process.env.REACT_APP_EMAIL_PROXY_URL || 'http://localhost:3001/send-email';
  console.log('\n2. Testing proxy connectivity...');
  console.log('Proxy URL:', proxyUrl);
  
  try {
    // Test if proxy is accessible
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(proxyUrl, {
      method: 'OPTIONS',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Proxy accessible:', response.ok);
    console.log('Response status:', response.status);
  } catch (error) {
    console.log('Proxy connection failed:', error.message);
    if (error.name === 'AbortError') {
      console.log('Request timed out - proxy server may not be running');
    }
  }
  
  // Test direct Resend API (should fail due to CORS)
  console.log('\n3. Testing direct Resend API (expected to fail due to CORS)...');
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.REACT_APP_FROM_EMAIL || 'onboarding@resend.dev',
        to: ['test@example.com'],
        subject: 'Test',
        html: '<p>Test</p>',
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Direct Resend API call succeeded (unexpected):', response.ok);
  } catch (error) {
    console.log('Direct Resend API call failed (expected):', error.message);
    if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
      console.log('✓ This confirms the CORS issue');
    }
  }
  
  console.log('\n=== DIAGNOSIS COMPLETE ===');
  console.log('\nNext steps:');
  console.log('1. Make sure the email proxy server is running on port 3001');
  console.log('2. Check that the proxy server has the correct Resend API key');
  console.log('3. Verify that REACT_APP_EMAIL_PROXY_URL is set correctly in .env');
}

// Run the diagnosis
diagnoseEmailIssue();