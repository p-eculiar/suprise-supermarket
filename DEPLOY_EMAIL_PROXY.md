# Deploy Email Proxy to Render.com

## Prerequisites
1. A free account at [render.com](https://render.com)
2. Your Resend API key

## Deployment Steps

### 1. Fork the Repository (if needed)
If you don't have the files on GitHub, you'll need to upload them.

### 2. Create New Web Service on Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository (or choose "Public Git repository")
4. Enter this URL: `https://github.com/your-username/suprise-supermarket` (replace with your repo)

### 3. Configure the Service
- **Name**: `suprise-supermarket-email-proxy`
- **Environment**: Python
- **Build Command**: `pip install flask flask-cors requests python-dotenv`
- **Start Command**: `python email-proxy.py`
- **Instance Type**: Free

### 4. Add Environment Variables
Click "Advanced" and add these variables:
```
RESEND_API_KEY=re_FSLE7xJS_D63s5HyHt39ZyRC2XtRCTP6Y
FROM_EMAIL=onboarding@resend.dev
PORT=3001
```

### 5. Deploy
Click "Create Web Service"

### 6. Get Your Deployed URL
After deployment completes, you'll see a URL like:
`https://suprise-supermarket-email-proxy.onrender.com`

### 7. Update Your Main Application
Update your `.env` file with:
```env
REACT_APP_EMAIL_PROXY_URL=https://suprise-supermarket-email-proxy.onrender.com/send-email
```

### 8. Redeploy Your Main Application
Redeploy your main React application with the updated environment variable.

## Testing
After deployment:
1. Go to your admin dashboard
2. Select users and send bulk emails
3. Real emails will be sent to actual user addresses
4. Check your email inbox to confirm

## Important Notes
- The free tier on Render may have some limitations
- First request after inactivity may be slow (cold start)
- Make sure your Resend API key is valid