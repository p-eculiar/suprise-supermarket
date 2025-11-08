# Email Proxy Setup Instructions

## Problem
Emails are not being sent because the browser cannot directly access the Resend API due to CORS restrictions.

## Solution
We've implemented an email proxy server that acts as an intermediary between the frontend application and the Resend API.

## How It Works
1. Frontend sends email request to the proxy server
2. Proxy server forwards the request to Resend API
3. Resend API sends the email
4. Proxy server returns the response to the frontend

## Setup Instructions

### 1. Install Dependencies
Navigate to your project root directory and install the required dependencies:
```bash
npm install express cors resend
```

### 2. Create Email Proxy Environment File
Create a new file called `.env.proxy` in your project root with the following content:
```env
RESEND_API_KEY=re_FSLE7xJS_D63s5HyHt39ZyRC2XtRCTP6Y
FROM_EMAIL=onboarding@resend.dev
PORT=3001
```

### 3. Start the Email Proxy Server
Run the email proxy server:
```bash
node email-proxy.js
```

You should see output similar to:
```
Email proxy server running on port 3001
```

### 4. Verify the Proxy is Running
Open a new terminal and test the proxy:
```bash
curl -X OPTIONS http://localhost:3001/send-email
```

You should get a response indicating the server is running.

### 5. Restart Your React Application
Make sure your React application picks up the environment variables:
```bash
npm start
```

## Troubleshooting

### Issue: "Completed! Sent: 0, Failed: 1 (Check Resend API configuration)"
This usually means the proxy server is not running or not accessible.

**Solutions:**
1. Make sure the email proxy server is running on port 3001
2. Check that the REACT_APP_EMAIL_PROXY_URL in your .env file is correct
3. Verify your Resend API key is valid

### Issue: "Connection refused" or "Failed to fetch"
This indicates the proxy server is not accessible.

**Solutions:**
1. Start the email proxy server: `node email-proxy.js`
2. Check that port 3001 is not being used by another application
3. Verify your firewall is not blocking the connection

### Issue: Invalid Resend API Key
If emails still aren't sending, your Resend API key might be invalid.

**Solutions:**
1. Log in to your Resend dashboard to verify the API key
2. Make sure you're using a valid, active API key
3. Check that the key is correctly set in the `.env.proxy` file

## Testing the Setup

### 1. Test the Proxy Server
```bash
# Test that the proxy is running
curl -X OPTIONS http://localhost:3001/send-email

# Test sending an email (replace with your email)
curl -X POST http://localhost:3001/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": ["your-email@example.com"],
    "subject": "Test Email",
    "html": "<h1>Test</h1><p>This is a test email.</p>"
  }'
```

### 2. Test from the Admin Dashboard
1. Go to the Admin Users page
2. Select a user and click "Send Bulk Email"
3. Fill in the subject and content
4. Click "Send Emails"
5. Check your email inbox

## Production Deployment

For production, you'll need to deploy the email proxy to a server or cloud function:
1. Deploy the email-proxy.js file to a server
2. Set the environment variables on the server
3. Update REACT_APP_EMAIL_PROXY_URL in your production .env file to point to your deployed proxy

## Security Notes
- Never expose your Resend API key in client-side code
- The proxy server should only be accessible from your application
- Consider adding authentication to the proxy server in production
- Use HTTPS in production