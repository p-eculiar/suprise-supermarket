# EmailJS SMTP Integration Setup

This document explains how to set up EmailJS SMTP service for bulk email sending in the admin dashboard.

## Benefits of EmailJS SMTP

1. **Better for Bulk Sending**: SMTP is designed for high-volume email sending
2. **More Reliable**: SMTP connections are more stable for bulk operations
3. **Better Rate Limiting Control**: You can control the sending rate more precisely
4. **Lower Latency**: Direct SMTP connection vs. API calls

## Setup Instructions

### 1. Get EmailJS SMTP Credentials

1. Go to your EmailJS dashboard (https://www.emailjs.com/)
2. Navigate to the SMTP section
3. Get your SMTP credentials:
   - SMTP Host
   - SMTP Port (usually 587)
   - SMTP Username
   - SMTP Password

### 2. Configure Environment Variables

Update your `.env` file with the following variables:

```env
# EmailJS SMTP Configuration (for bulk email sending)
REACT_APP_EMAILJS_SMTP_HOST=smtp.emailjs.com
REACT_APP_EMAILJS_SMTP_PORT=587
REACT_APP_EMAILJS_SMTP_USER=your_emailjs_smtp_username
REACT_APP_EMAILJS_SMTP_PASS=your_emailjs_smtp_password
```

### 3. How It Works

The system automatically detects if SMTP credentials are configured:
- If SMTP is configured, it uses the SMTP service for bulk sending
- If SMTP is not configured, it falls back to the Resend API

### 4. Testing the Integration

1. Log in to the admin dashboard
2. Go to the Users page
3. Select one or more users
4. Click "Send Bulk Email"
5. Fill in the subject and content
6. Click "Send Emails"

The system will automatically use SMTP if configured, otherwise fall back to Resend.

## Troubleshooting

### If emails are not sending:

1. Check that all SMTP environment variables are set correctly
2. Verify your EmailJS SMTP credentials in the dashboard
3. Check the browser console for error messages
4. Ensure your EmailJS account has sufficient credits

### If falling back to Resend:

1. Make sure your REACT_APP_RESEND_API_KEY is set correctly
2. Verify that the API key is valid and has not expired