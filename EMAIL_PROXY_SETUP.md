# Email Proxy Setup

## Problem
The application was unable to send emails because direct browser requests to the Resend API fail due to CORS policy restrictions.

## Solution
Created an email proxy server that acts as an intermediary between the frontend application and the Resend API.

## How It Works
1. Frontend sends email request to the proxy server
2. Proxy server forwards the request to Resend API
3. Resend API sends the email
4. Proxy server returns the response to the frontend

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create a `.env` file in the email proxy directory with your Resend API key:
```env
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=onboarding@resend.dev
PORT=3001
```

### 3. Run the Proxy Server
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

## Files Created
1. `email-proxy.js` - The proxy server implementation
2. `package.json` - Dependencies and scripts
3. Updated `.env` - Added email proxy configuration

## Configuration
The frontend looks for the proxy URL in the `REACT_APP_EMAIL_PROXY_URL` environment variable, which defaults to `http://localhost:3001/send-email`.

## Testing
1. Start the proxy server
2. Run your React application
3. Try sending a bulk email from the admin dashboard
4. Check your email inbox for the received message

## Production Deployment
For production, deploy the email proxy to a server or cloud function (e.g., Vercel Functions, Netlify Functions, AWS Lambda, etc.) and update the `REACT_APP_EMAIL_PROXY_URL` to point to your deployed proxy.

## Security Notes
- Keep your Resend API key secure and never expose it in client-side code
- The proxy server should be deployed with proper security measures
- Consider rate limiting and authentication for production use