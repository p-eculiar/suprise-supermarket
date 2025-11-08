// Simple test to check if the email proxy is running
// Run this from the command line: node test-proxy-connection.js

async function testProxyConnection() {
  console.log('Testing email proxy connection...');
  
  const proxyUrl = process.env.REACT_APP_EMAIL_PROXY_URL || 'http://localhost:3001/send-email';
  
  try {
    // Test OPTIONS request to see if server is responding
    const response = await fetch(proxyUrl, {
      method: 'OPTIONS',
      timeout: 5000 // 5 second timeout
    });
    
    console.log('Proxy server response:');
    console.log('- Status:', response.status);
    console.log('- OK:', response.ok);
    
    if (response.ok) {
      console.log('✅ Proxy server is running and accessible');
    } else {
      console.log('❌ Proxy server returned an error status');
    }
  } catch (error) {
    console.log('❌ Proxy connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('   The proxy server is not running on port 3001');
      console.log('   Please start the proxy server with: node email-proxy.js');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('   Could not resolve the proxy server address');
      console.log('   Check that REACT_APP_EMAIL_PROXY_URL is set correctly');
    } else if (error.message.includes('timeout')) {
      console.log('   Connection timed out - server may be unresponsive');
    }
  }
}

// Run the test
testProxyConnection();