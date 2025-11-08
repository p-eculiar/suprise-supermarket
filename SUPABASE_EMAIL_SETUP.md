# 📧 SUPABASE EMAIL CONFIRMATION SETUP

This guide will help you set up email confirmations with custom branded emails for Surprise Supermarket.

---

## ⚡ QUICK SETUP (10 minutes)

### Step 1: Enable Email Confirmation (2 minutes)

1. **Go to your Supabase Dashboard**
   - Open: https://supabase.com
   - Click on your project: "surprise-supermarket"

2. **Navigate to Authentication Settings**
   - In the left sidebar, click **"Authentication"** (person icon 👤)
   - Click **"Settings"** at the top
   - Or directly click: **Settings** → **Authentication**

3. **Enable Email Confirmations**
   - Scroll to **"User Signups"** section
   - Find: **"Enable email confirmations"**
   - **Toggle it ON** (should be green)
   - This ensures users must verify email before logging in

4. **Click "Save"** at the bottom

✅ **Result**: Users must now confirm their email before they can log in!

---

### Step 2: Customize Email Templates (8 minutes)

1. **Still in Authentication Settings**
   - Scroll down to **"Email Templates"** section
   - You'll see several template types:
     - Confirm signup
     - Invite user
     - Magic link
     - Change email address
     - Reset password

2. **Click on "Confirm signup"** (This is the verification email)

3. **Replace the default template with this CUSTOM template:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - Surprise Supermarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: white; width: 80px; height: 80px; border-radius: 50%; padding: 15px; margin-bottom: 15px;">
                <span style="font-size: 40px;">🛒</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Surprise Supermarket</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">Fresh Groceries, Delivered</p>
            </td>
          </tr>
          
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">
                Welcome, {{ .Data.full_name }}! 🎉
              </h2>
              
              <p style="color: #666666; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                Thank you for joining Surprise Supermarket! We're excited to have you as part of our community.
              </p>
              
              <p style="color: #666666; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                To complete your registration and start shopping for fresh groceries, please verify your email address by clicking the button below:
              </p>
              
              <!-- Verification Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);">
                      ✅ Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="color: #6C9A7F; font-size: 13px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 0 0 30px 0;">
                {{ .ConfirmationURL }}
              </p>
              
              <!-- What to Expect -->
              <div style="background-color: #f8f9fa; border-left: 4px solid #6C9A7F; padding: 20px; border-radius: 6px; margin: 0 0 30px 0;">
                <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
                  What's Next?
                </h3>
                <ul style="color: #666666; line-height: 1.8; font-size: 15px; margin: 0; padding-left: 20px;">
                  <li>Browse thousands of fresh products</li>
                  <li>Get exclusive deals and discounts</li>
                  <li>Track your orders in real-time</li>
                  <li>Earn loyalty rewards on every purchase</li>
                </ul>
              </div>
              
              <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 0; font-style: italic;">
                This link will expire in 24 hours. If you didn't create an account with Surprise Supermarket, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 15px 0;">
                Need help? Contact us at 
                <a href="mailto:support@surprisesupermarket.com" style="color: #6C9A7F; text-decoration: none; font-weight: 600;">
                  support@surprisesupermarket.com
                </a>
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                © 2025 Surprise Supermarket. All rights reserved.
              </p>
              <p style="color: #999999; font-size: 11px; margin: 0;">
                Fresh Groceries | Local Delivery | Quality You Can Trust
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

4. **Update the email subject:**
   - Subject line: `Welcome to Surprise Supermarket, {{ .Data.full_name }}! Please verify your email 🎉`

5. **Click "Save"**

✅ **Result**: Users now receive a beautiful branded email!

---

### Step 3: Customize "Reset Password" Email (Optional)

1. Click on **"Reset password"** template
2. Replace with this custom template:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - Surprise Supermarket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: white; width: 80px; height: 80px; border-radius: 50%; padding: 15px; margin-bottom: 15px;">
                <span style="font-size: 40px;">🔒</span>
              </div>
              <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">
                Hi {{ .Data.full_name }},
              </h2>
              
              <p style="color: #666666; line-height: 1.8; font-size: 16px; margin: 0 0 20px 0;">
                We received a request to reset your password for your Surprise Supermarket account.
              </p>
              
              <p style="color: #666666; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                Click the button below to create a new password:
              </p>
              
              <!-- Reset Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="{{ .ConfirmationURL }}" 
                       style="display: inline-block; background: linear-gradient(135deg, #6C9A7F 0%, #5A8470 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">
                      🔒 Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999999; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                Or copy and paste this link:
              </p>
              <p style="color: #6C9A7F; font-size: 13px; word-break: break-all; background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin: 0 0 30px 0;">
                {{ .ConfirmationURL }}
              </p>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; border-radius: 6px;">
                <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
                  <strong>⚠️ Security Note:</strong> If you didn't request this password reset, please ignore this email or contact support if you're concerned about your account security.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Surprise Supermarket. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

3. Subject: `Reset Your Password - Surprise Supermarket 🔒`
4. Click "Save"

---

## 🧪 TESTING EMAIL CONFIRMATION

### Test the Flow:

1. **Logout** from your current account (if logged in)

2. **Register a NEW account**:
   ```
   Name: John Doe
   Email: your-real-email@gmail.com (use a real email you can check!)
   Password: Test123456!
   ```

3. **Check your email inbox**:
   - You should receive a beautiful branded email
   - Subject: "Welcome to Surprise Supermarket, John Doe! Please verify your email 🎉"
   - From: noreply@mail.app.supabase.co (Supabase default sender)

4. **Click "Verify Email Address"** button in the email

5. **You'll be redirected** to your app and logged in

6. **Try logging out and logging in again**:
   - It should work now without the "Email not confirmed" error!

---

## 🎨 CUSTOMIZING SENDER EMAIL (Optional - Paid Feature)

By default, Supabase sends emails from `noreply@mail.app.supabase.co`. 

To use your own domain (e.g., `noreply@surprisesupermarket.com`):

1. Go to **Settings** → **Authentication** → **SMTP Settings**
2. Configure with your email service:
   - **SendGrid** (Recommended, has free tier)
   - **Mailgun**
   - **AWS SES**
   - **Your own SMTP server**

3. Enter SMTP credentials:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: YOUR_SENDGRID_API_KEY
   Sender email: noreply@surprisesupermarket.com
   Sender name: Surprise Supermarket
   ```

4. Click "Save"

**Note**: This requires domain verification with your email provider.

---

## 🚨 TROUBLESHOOTING

### Email not received?

1. **Check spam folder**
2. **Wait 2-3 minutes** (sometimes delayed)
3. **Verify email settings enabled** in Supabase Authentication Settings
4. **Try with different email provider** (Gmail, Outlook, etc.)

### Still getting "Email not confirmed" error?

1. Make sure you **clicked the verification link** in the email
2. Check if **"Enable email confirmations"** is ON in Supabase
3. Try **registering with a new email** to test

### Want to resend verification email?

Add this to your Login page (I can help you implement this if needed):
```typescript
const resendVerification = async () => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: formData.email,
  });
  if (!error) {
    toast.emailVerificationSent();
  }
};
```

---

## ✅ CHECKLIST

After completing this setup:

```
☐ Email confirmations enabled in Supabase
☐ Custom signup email template configured
☐ Custom password reset email template configured (optional)
☐ Tested registration with real email
☐ Received branded verification email
☐ Successfully verified email
☐ Can login without "Email not confirmed" error
☐ Toast notifications showing throughout app
```

---

## 🎉 YOU'RE ALL SET!

Your users will now:
✅ Receive beautiful branded emails
✅ Must verify email before logging in
✅ See toast notifications for every action
✅ Have a professional user experience

**Need help?** Let me know if any step isn't working!
