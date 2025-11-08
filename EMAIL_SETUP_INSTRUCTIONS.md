# Email Setup Instructions

## Issue Identified
The bulk email functionality is not working because the Resend API key is not configured in your environment variables. This is why you're seeing "Completed! Sent: 0, Failed: 1".

## Solution

### Step 1: Get a Resend API Key

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Once logged in, go to the API Keys section
4. Create a new API key
5. Copy the API key (it starts with "re_")

### Step 2: Configure Your Environment Variables

Add the following lines to your `.env` file:

```env
# Email Configuration (Resend)
REACT_APP_RESEND_API_KEY=re_your_actual_api_key_here
REACT_APP_FROM_EMAIL=noreply@surprisesupermarket.com
```

Replace `re_your_actual_api_key_here` with your actual Resend API key.

### Step 3: Alternative Email Providers

If you prefer to use a different email provider, you can modify the email service:

#### Option 1: SendGrid
1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Get your API key
3. Update your `.env` file:
```env
REACT_APP_SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
REACT_APP_FROM_EMAIL=noreply@surprisesupermarket.com
```

4. Replace the `sendEmail` method in `src/services/emailService.ts` with:
```typescript
private static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.REACT_APP_FROM_EMAIL;

    if (!SENDGRID_API_KEY) {
      console.warn('SendGrid API key not configured');
      return false;
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: FROM_EMAIL },
        subject: subject,
        content: [{ type: 'text/html', value: html }],
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
```

#### Option 2: SMTP (Gmail, Outlook, etc.)
1. Get your SMTP credentials
2. Update your `.env` file:
```env
REACT_APP_SMTP_HOST=smtp.yourprovider.com
REACT_APP_SMTP_PORT=587
REACT_APP_SMTP_USER=your_email@provider.com
REACT_APP_SMTP_PASS=your_app_password
REACT_APP_FROM_EMAIL=your_email@provider.com
```

3. Replace the `sendEmail` method in `src/services/emailService.ts` with:
```typescript
private static async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const SMTP_HOST = process.env.REACT_APP_SMTP_HOST;
    const SMTP_PORT = process.env.REACT_APP_SMTP_PORT;
    const SMTP_USER = process.env.REACT_APP_SMTP_USER;
    const SMTP_PASS = process.env.REACT_APP_SMTP_PASS;
    const FROM_EMAIL = process.env.REACT_APP_FROM_EMAIL;

    // You'll need to install nodemailer: npm install nodemailer
    // And create a backend service since SMTP from frontend is not recommended
    // This is a simplified example - in practice, you'd call your backend API
    
    console.warn('SMTP from frontend not implemented. Please set up a backend email service.');
    return false;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
```

### Step 4: Restart Your Development Server

After updating your `.env` file:
1. Stop your development server (Ctrl+C)
2. Start it again with `npm start`

### Step 5: Test the Email Functionality

1. Go to the Admin Dashboard → Users page
2. Select one or more users
3. Click "Send Bulk Email"
4. Fill in the subject and content
5. Click "Send Emails"
6. You should now see emails being sent successfully

## Troubleshooting

If emails still aren't sending:

1. **Check the browser console** for any error messages
2. **Verify your API key** is correct and hasn't expired
3. **Check that your domain is verified** in Resend (for production)
4. **Ensure your .env file is in the root directory** of your project
5. **Make sure you restarted your development server** after updating the .env file

## Button Color Confirmation

The send button color is already using the correct green color from your website (`#6C9A7F`). No changes are needed for the button color.

## Need Help?

If you continue to have issues:
1. Check the browser console for detailed error messages
2. Verify all environment variables are correctly set
3. Contact your email service provider for API key issues