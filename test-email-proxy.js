// Simple test script for the email proxy
// Run this after starting the email proxy server

async function testEmailProxy() {
  try {
    console.log('Testing email proxy...');
    
    const response = await fetch('http://localhost:3001/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: ['test@example.com'],
        subject: 'Test Email from Proxy',
        html: '<h1>Hello from Email Proxy!</h1><p>This is a test email.</p>',
      }),
    });
    
    const result = await response.json();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Email proxy is working correctly!');
    } else {
      console.log('❌ Email proxy returned an error:', result.error);
    }
  } catch (error) {
    console.log('❌ Failed to test email proxy:', error.message);
  }
}

// Run the test
testEmailProxy();