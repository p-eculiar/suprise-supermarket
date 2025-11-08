# Production Email Setup Guide

This guide will help you set up a custom "from" email address when you move to production with your custom domain.

## Current Setup (Development)
You're currently using your personal email address:
```
REACT_APP_FROM_EMAIL=chikwendupeculiar66@gmail.com
```

This works fine for development and testing, but for production, you'll want to use a professional email address from your custom domain.

## Production Setup Steps

### Step 1: Get Your Custom Domain
When you host your application on Netlify and get your custom domain (e.g., `surprisesupermarket.com`), you'll need to verify it with Resend.

### Step 2: Verify Your Domain in Resend
1. Log in to your Resend dashboard
2. Go to the "Domains" section
3. Click "Add Domain"
4. Enter your domain (e.g., `surprisesupermarket.com`)
5. Resend will provide DNS records that you need to add to your domain registrar

### Step 3: Add DNS Records
Depending on your domain registrar (GoDaddy, Namecheap, Google Domains, etc.), the process will vary slightly:

#### For Netlify DNS:
If you're using Netlify DNS:
1. Go to your Netlify site settings
2. Navigate to "Domain Management"
3. Click on your domain
4. Go to "DNS settings"
5. Add the DNS records provided by Resend

#### For Other DNS Providers:
1. Log in to your DNS provider's dashboard
2. Find the DNS management section for your domain
3. Add the TXT and CNAME records provided by Resend

### Step 4: Update Your Environment Variables
Once your domain is verified, update your `.env` file:

```env
REACT_APP_RESEND_API_KEY=re_your_actual_api_key_here
REACT_APP_FROM_EMAIL=noreply@surprisesupermarket.com
```

### Step 5: Update Netlify Environment Variables
When you deploy to Netlify:
1. Go to your site settings in Netlify
2. Navigate to "Environment Variables"
3. Add the same variables:
   - `REACT_APP_RESEND_API_KEY`: re_your_actual_api_key_here
   - `REACT_APP_FROM_EMAIL`: noreply@surprisesupermarket.com

### Step 6: Test the Setup
1. Deploy your updated site to Netlify
2. Test the email functionality
3. Check that emails are being sent from your custom domain

## Best Practices for Production Email

### 1. Use Professional Email Addresses
- `noreply@surprisesupermarket.com` for automated emails
- `support@surprisesupermarket.com` for customer support
- `info@surprisesupermarket.com` for general inquiries

### 2. Set Up SPF and DKIM Records
Resend automatically handles SPF and DKIM for verified domains, which helps with email deliverability.

### 3. Monitor Email Performance
- Check your Resend dashboard for delivery rates
- Monitor spam complaints
- Track email opens and clicks if relevant

### 4. Consider Email Templates
For a more professional appearance, consider using custom email templates that match your brand.

## Troubleshooting Production Issues

### Common Issues:
1. **DNS Verification Fails**: Double-check that you've added all DNS records correctly
2. **Emails Go to Spam**: Ensure your domain is properly verified and SPF/DKIM records are set up
3. **Email Sending Fails**: Verify your API key and environment variables are correctly set in Netlify

### How to Check:
1. Look at browser console logs for errors
2. Check the Netlify deploy logs
3. Review the Resend dashboard for any delivery issues

## Need Help?
If you encounter issues during the production setup:
1. Check the Resend documentation: https://resend.com/docs
2. Contact Resend support through their dashboard
3. Verify all DNS records are correctly propagated (can take up to 48 hours)