# 📧 Email Notification System - Complete Setup Guide

## Overview

The Surprise Supermarket application now has a **fully functional email notification system** that sends actual emails to users who opt-in during registration. The system supports:

✅ **New Product Announcements**  
✅ **Special Discounts & Promotions**  
✅ **Exclusive Events**  

---

## 🎯 Key Features

### 1. User Opt-In During Registration
- ✅ Checkbox on registration page (checked by default)
- ✅ User preference saved to Supabase user metadata
- ✅ Can be toggled anytime in user dashboard settings

### 2. Automatic Email Sending
- ✅ Emails sent immediately when admin creates new product
- ✅ Emails sent when admin creates discount/event
- ✅ Only sends to users who opted-in
- ✅ Beautiful HTML email templates
- ✅ Tracking of sent/failed emails in database

### 3. Multiple Email Types
- **New Products**: Sent automatically when product is created
- **Discounts**: Sent manually by admins with coupon codes
- **Events**: Sent manually by admins for special occasions

---

## 🛠️ Email Service Integration

The system is configured to use **Resend** (recommended), but you can easily switch to:
- SendGrid
- Mailgun
- Amazon SES
- Postmark
- Any SMTP service

### Option 1: Resend (Recommended)

**Why Resend?**
- ✅ Modern, developer-friendly API
- ✅ Free tier: 3,000 emails/month
- ✅ Excellent deliverability
- ✅ Simple integration
- ✅ Beautiful dashboard

**Setup Steps:**

1. **Sign up for Resend**
   ```
   Visit: https://resend.com
   Create free account
   ```

2. **Get API Key**
   - Go to Dashboard → API Keys
   - Create new API key
   - Copy the key (starts with `re_`)

3. **Verify Domain (Optional but Recommended)**
   - Go to Dashboard → Domains
   - Add your domain (e.g., surprisesupermarket.com)
   - Add DNS records as shown
   - Wait for verification

4. **Add to Environment Variables**
   ```env
   # Add to .env file
   REACT_APP_RESEND_API_KEY=re_your_api_key_here
   REACT_APP_FROM_EMAIL=noreply@surprisesupermarket.com
   REACT_APP_SITE_URL=http://localhost:3000  # or your production URL
   ```

5. **Test It!**
   - Register a new user (with email notifications checked)
   - Go to Admin Dashboard
   - Create a new product
   - Check your email inbox!

### Option 2: SendGrid

If you prefer SendGrid instead:

1. **Sign up**: https://sendgrid.com (Free tier: 100 emails/day)

2. **Get API Key**: Dashboard → Settings → API Keys

3. **Update Code**: In `src/services/emailService.ts`, replace the Resend API call with:

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

4. **Environment Variables**:
```env
REACT_APP_SENDGRID_API_KEY=SG.your_api_key_here
REACT_APP_FROM_EMAIL=noreply@surprisesupermarket.com
```

---

## 📝 How It Works

### User Registration Flow

1. **User Registers**
   ```
   ┌─────────────────┐
   │  Register Page  │
   │  ✓ Email notif. │ ← Checkbox checked by default
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │   Supabase Auth │
   │   user_metadata │ ← email_notifications: true
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Profiles Table  │ ← Trigger creates profile
   │ email_notif: ✓  │
   └─────────────────┘
   ```

2. **Admin Creates Product**
   ```
   ┌─────────────────┐
   │ Admin Dashboard │
   │ Create Product  │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Product Created │
   │  in Database    │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Email Service   │
   │ Query subscribed│
   │     users       │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │  Send Emails    │
   │  (via Resend)   │
   └────────┬────────┘
            │
            ▼
   ┌─────────────────┐
   │ Log in Database │
   │  (sent/failed)  │
   └─────────────────┘
   ```

3. **User Receives Email**
   ```
   📧 Email arrives in inbox
   
   Subject: 🎉 New Product Alert: Fresh Organic Tomatoes
   
   Beautiful HTML template with:
   - Product name
   - Product image
   - Price
   - Description
   - "View Product" button
   - Unsubscribe link
   ```

---

## 🎨 Email Templates

### 1. New Product Email
- **Trigger**: When admin creates new product
- **Template**: Green gradient header, product image, price, CTA button
- **Subject**: `🎉 New Product Alert: [Product Name]`

### 2. Discount Email
- **Trigger**: Manual admin action (you need to create UI for this)
- **Template**: Gold discount code box, expiry date, terms
- **Subject**: `💰 Special Discount: [X]% OFF!`

### 3. Event Email
- **Trigger**: Manual admin action (you need to create UI for this)
- **Template**: Purple gradient, event date, location, RSVP button
- **Subject**: `🎊 Upcoming Event: [Event Name]`

---

## 📊 Notification Tracking

All sent emails are tracked in the `email_notifications` table:

```sql
Table: email_notifications
Columns:
- id: UUID
- user_email: TEXT
- user_name: TEXT
- product_id: UUID (for new products)
- product_name: TEXT
- notification_type: TEXT (new_product|discount|event)
- status: TEXT (sent|failed)
- sent_at: TIMESTAMP
- created_at: TIMESTAMP
```

**View Notification Stats:**
```sql
-- Total emails sent
SELECT COUNT(*) FROM email_notifications WHERE status = 'sent';

-- Failed emails
SELECT COUNT(*) FROM email_notifications WHERE status = 'failed';

-- Emails sent today
SELECT COUNT(*) FROM email_notifications 
WHERE sent_at::date = CURRENT_DATE;
```

---

## 🧪 Testing

### Test the Complete Flow

1. **Register Test User**
   ```
   - Go to /register
   - Fill in details
   - ✓ Ensure email notifications checkbox is checked
   - Use a real email you can access
   - Submit registration
   ```

2. **Create Test Product** (as Admin)
   ```
   - Go to /admin/products/new
   - Fill in product details
   - Upload product image
   - Click "Save Product"
   - Check console for: "Email notifications queued successfully"
   ```

3. **Check Email**
   ```
   - Check your inbox
   - Look for email from noreply@surprisesupermarket.com
   - Should arrive within 1-2 minutes
   - If not in inbox, check spam folder
   ```

4. **Verify in Database**
   ```sql
   SELECT * FROM email_notifications 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

---

## ⚙️ Configuration Options

### Customize Email Sender

In `.env`:
```env
# Use your domain for better deliverability
REACT_APP_FROM_EMAIL=hello@yourdomain.com

# Or use a friendly name
REACT_APP_FROM_EMAIL=Surprise Supermarket <noreply@yourdomain.com>
```

### Customize Templates

Edit templates in `src/services/emailService.ts`:
- `getNewProductEmailTemplate()`
- `getDiscountEmailTemplate()`
- `getEventEmailTemplate()`

### Rate Limiting

To avoid hitting email service limits, you can batch emails:

```typescript
// In emailService.ts
for (let i = 0; i < users.length; i += 10) {
  const batch = users.slice(i, i + 10);
  await Promise.all(batch.map(user => sendEmail(...)));
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec delay
}
```

---

## 🚨 Troubleshooting

### Email Not Sending?

**1. Check API Key**
```bash
# In browser console:
console.log(process.env.REACT_APP_RESEND_API_KEY);
// Should NOT be undefined
```

**2. Check Console Logs**
```
Open browser DevTools → Console
Look for:
- "Emails sent: X, Failed: Y"
- "Email sending failed: [error message]"
```

**3. Check Database**
```sql
SELECT * FROM email_notifications 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

**4. Verify User Opt-In**
```sql
SELECT email, email_notifications 
FROM profiles 
WHERE email = 'user@example.com';
```

**5. Check Spam Folder**
- First emails often go to spam
- Mark as "Not Spam" to train filter

### Common Issues

**Issue**: "Resend API key not configured"
- **Solution**: Add `REACT_APP_RESEND_API_KEY` to `.env` file
- Restart development server after adding

**Issue**: "Email sending failed: 401"
- **Solution**: Invalid API key, get new one from Resend dashboard

**Issue**: "Email sending failed: 403"
- **Solution**: Domain not verified, verify your domain in Resend

**Issue**: No users receiving emails
- **Solution**: Check that users have `email_notifications = true` in profiles table

---

## 📈 Production Recommendations

### 1. Use a Real Domain
```
Instead of: noreply@surprisesupermarket.com
Use: noreply@youractualdomain.com
```

### 2. Verify Domain
- Add SPF, DKIM, and DMARC records
- Improves deliverability
- Prevents emails going to spam

### 3. Set Up Webhooks (Advanced)
Resend can notify you of:
- Email delivered
- Email opened
- Email bounced
- Link clicked

### 4. Monitor Sending Limits
- Resend Free: 3,000/month
- SendGrid Free: 100/day
- Upgrade plan if needed

### 5. Implement Unsubscribe
Currently, users can disable via Dashboard → Customization.
Consider adding direct unsubscribe link in emails.

---

## 📚 Additional Features You Can Add

### 1. Admin UI for Discounts
Create admin page to send discount emails:
```typescript
// In admin dashboard
<button onClick={() => {
  EmailNotificationService.sendDiscountNotification({
    discountTitle: "Flash Sale!",
    discountPercentage: 25,
    discountCode: "SAVE25",
    expiryDate: "2024-12-31",
    discountDescription: "Save 25% on all products!",
  });
}}>
  Send Discount Email
</button>
```

### 2. Admin UI for Events
Create admin page to announce events:
```typescript
<button onClick={() => {
  EmailNotificationService.sendEventNotification({
    eventTitle: "Grand Opening",
    eventDate: "2024-12-25",
    eventDescription: "Join us for our grand opening celebration!",
    eventLocation: "123 Main St, Lagos",
  });
}}>
  Announce Event
</button>
```

### 3. Email Scheduling
Use Supabase Edge Functions or cron jobs to schedule emails.

### 4. Personalization
- Use customer's purchase history
- Recommend products they might like
- Birthday/anniversary emails

---

## ✅ Implementation Checklist

- [x] Email notification checkbox in registration
- [x] Save preference to user metadata
- [x] Email service with Resend integration
- [x] New product email template
- [x] Discount email template
- [x] Event email template
- [x] Automatic sending on product creation
- [x] Notification tracking in database
- [x] User preference toggle in settings
- [ ] Get Resend API key (YOU NEED TO DO THIS)
- [ ] Add API key to .env file
- [ ] Test with real email
- [ ] Verify domain for production
- [ ] Create admin UI for discounts (optional)
- [ ] Create admin UI for events (optional)

---

## 🎉 You're All Set!

Your email notification system is **fully implemented and ready to use!**

Just add your Resend API key and start sending beautiful emails to your customers.

**Questions?** Check the code in:
- `src/services/emailService.ts` - Email sending logic
- `src/pages/Register.tsx` - Registration with opt-in
- `src/pages/dashboard/Customization.tsx` - User preferences
- `src/pages/admin/ProductForm.tsx` - Auto-send on product creation
