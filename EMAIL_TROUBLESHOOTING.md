# Email Troubleshooting Guide

## Issue: "Completed! Sent: 0, Failed: 1 (API key not configured)" Despite Correct API Key

If you're seeing this error despite having what appears to be a correct API key, follow these troubleshooting steps:

## Step 1: Verify Your .env File Location and Format

### Check File Location
Your `.env` file should be in the root directory of your project:
```
suprise-supermarket/
├── .env ← This file
├── package.json
├── src/
└── ...
```

### Check File Format
Your `.env` file should look like this (no quotes, no spaces around =):
```env
# ... other variables ...

# Email Configuration (Resend)
REACT_APP_RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FROM_EMAIL=chikwendupeculiar66@gmail.com
```

NOT like this (common mistakes):
```env
# Wrong - Don't use quotes
REACT_APP_RESEND_API_KEY="re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Wrong - Don't use spaces around =
REACT_APP_RESEND_API_KEY = re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Wrong - Don't use placeholder
REACT_APP_RESEND_API_KEY=re_your_actual_api_key_here
```

## Step 2: Verify Your API Key Format

A valid Resend API key:
- Starts with "re_"
- Is approximately 30+ characters long
- Contains only letters and numbers after "re_"

Example: `re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

## Step 3: Check Browser Console for Debug Information

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try to send an email again
4. Look for log messages that start with "Resend API Key Status" or "API Key Debug Info"

You should see something like:
```
Resend API Key Status: {
  hasKey: true,
  keyLength: 32,
  isPlaceholder: false,
  startsWithRe: true
}
```

## Step 4: Restart Your Development Server Completely

1. Stop your development server (Ctrl+C)
2. Close your terminal/command prompt
3. Open a new terminal/command prompt
4. Navigate to your project directory
5. Run `npm start`

## Step 5: Check for Environment Variable Loading Issues

Add this temporary debug code to your `src/index.tsx` or `src/App.tsx` file to verify the environment variable is loaded:

```javascript
// Temporary debug code - remove after troubleshooting
console.log('Environment Variables Check:', {
  RESEND_API_KEY: process.env.REACT_APP_RESEND_API_KEY ? 'SET' : 'NOT SET',
  RESEND_API_KEY_VALUE: process.env.REACT_APP_RESEND_API_KEY,
  FROM_EMAIL: process.env.REACT_APP_FROM_EMAIL
});
```

## Step 6: Verify Your API Key Works

Test your API key directly with curl:

```bash
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_ACTUAL_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "chikwendupeculiar66@gmail.com",
    "subject": "Test Email",
    "html": "<p>This is a test email</p>"
  }'
```

Replace `YOUR_ACTUAL_API_KEY_HERE` with your actual API key.

## Step 7: Check for Common Issues

### Issue 1: File Encoding
Make sure your `.env` file is saved with UTF-8 encoding without BOM.

### Issue 2: Hidden Characters
Sometimes copying and pasting can include hidden characters. Try typing the API key manually.

### Issue 3: Multiple .env Files
Make sure you don't have multiple `.env` files (like `.env.local`, `.env.development`) that might be overriding your settings.

### Issue 4: React Environment Variables
React only exposes environment variables that start with `REACT_APP_`. Make sure your variable name is correct.

## Step 8: Alternative Testing Method

If you're still having issues, temporarily hardcode your API key in the email service for testing (remember to remove it before committing):

In `src/services/emailService.ts`, temporarily replace:
```typescript
const RESEND_API_KEY = process.env.REACT_APP_RESEND_API_KEY;
```

With:
```typescript
const RESEND_API_KEY = "re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Your actual API key
```

## Need More Help?

If you're still experiencing issues:

1. Share the exact console output you see when trying to send an email
2. Verify the API key works with the curl command above
3. Check that your .env file is in the correct location and format
4. Confirm you've restarted your development server after making changes

The debug information we added should help identify exactly what's wrong with your configuration.