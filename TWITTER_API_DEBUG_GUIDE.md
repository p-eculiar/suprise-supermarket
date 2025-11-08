# Twitter API Integration - Debug & Setup Guide

## ✅ Changes Made

### Enhanced Error Logging & Diagnostics

I've added comprehensive logging to help diagnose Twitter API issues:

1. **Token Validation** - Checks if token exists and is properly formatted
2. **Request Logging** - Shows exactly what's being sent to Twitter
3. **Response Logging** - Detailed response status, headers, and data
4. **Error Details** - Specific error messages for common issues (401, 403, 429)
5. **URL Decoding** - Automatically decodes URL-encoded characters in token

### New Console Logs You'll See:

When you click "Scan for New Leads", open your browser console (F12) and you'll see:

```
🔍 Validating Twitter API Configuration...
📍 Environment: development
🔑 Token exists: true
📏 Token length: 108
🔤 Token preview: AAAAAAAAAAAAAAAAAAAA...
✅ Twitter API configuration looks valid

🐦 Starting Twitter scan...
🔍 Search query: "need groceries" OR "buy vegetables" OR ...
🌐 API URL: https://api.twitter.com/2/tweets/search/recent?...
🔐 Using Bearer Token: AAAAAAAAAAAAAAAAAAAA...
📡 Making Twitter API request...
⏱️ Request completed in 1234ms
📊 Response status: 200 OK
📋 Response headers: {...}
✅ Twitter API response received
📦 Response data structure: ["data", "includes", "meta"]
📊 Results count: 25
🎯 Found 25 tweets
📝 Sample tweet: "Looking for fresh groceries delivered to..."
✨ Transformed 25 leads
📝 Sample lead: {author: "John Doe", platform: "twitter", ...}
💾 Saving 25 leads to database...
✅ Successfully saved 25 leads
```

## 🔍 How to Test Your Twitter API Token

### Step 1: Open Browser Console

1. Go to `/admin/social-leads`
2. Press `F12` to open Developer Tools
3. Click on the **Console** tab
4. Clear any existing logs (trash icon)

### Step 2: Click "Scan for New Leads"

Watch the console logs carefully:

#### ✅ If Token is Valid:

You should see:
```
✅ Twitter API configuration looks valid
📊 Response status: 200 OK
🎯 Found X tweets
✅ Successfully saved X leads
```

#### ❌ If Token is Invalid (401 Error):

You'll see:
```
❌ Twitter API error response:
Status: 401
❌ Authentication failed: Invalid or expired Twitter Bearer Token
```

**Solution**: Your token is incorrect or expired. Get a new one from Twitter Developer Portal.

#### ❌ If App Lacks Permissions (403 Error):

You'll see:
```
❌ Twitter API error response:
Status: 403
❌ Access forbidden: Your Twitter app may not have access to this endpoint
```

**Solution**: Check your Twitter app settings and enable "Read" permissions.

#### ❌ If Rate Limited (429 Error):

You'll see:
```
❌ Twitter API error response:
Status: 429
❌ Rate limit exceeded: Too many requests
```

**Solution**: Wait 15 minutes and try again.

## 🔑 Verify Your Twitter Token

### Current Token in .env:

```
REACT_APP_TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAALEP4wEAA...
```

### Check Token Format:

1. Should be ~100-150 characters long
2. Usually starts with "AAAAAAAA"
3. Contains letters, numbers, and special characters
4. May have URL-encoded characters (%2B, %3D) - **Now automatically decoded!**

### Test Token Manually:

You can test your token with curl:

```bash
curl "https://api.twitter.com/2/tweets/search/recent?query=groceries&max_results=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Expected response:
- **200 OK** = Token works! ✅
- **401 Unauthorized** = Token invalid ❌
- **403 Forbidden** = App lacks permissions ❌

## 🛠️ Get a New Twitter Bearer Token

If your token isn't working:

### Step 1: Go to Twitter Developer Portal

https://developer.twitter.com/en/portal/dashboard

### Step 2: Select Your App

Or create a new one if you don't have one.

### Step 3: Navigate to "Keys and Tokens"

### Step 4: Generate Bearer Token

1. Click "Generate" under "Bearer Token"
2. **Copy the token immediately** (you can't view it again)
3. It should look like: `AAAAAAAAAAAAAAAAAAAA...`

### Step 5: Update .env File

Replace the token in your `.env` file:

```env
REACT_APP_TWITTER_BEARER_TOKEN=YOUR_NEW_TOKEN_HERE
```

### Step 6: Restart Development Server

**Important**: You must restart the server for .env changes to take effect!

```bash
# Stop the server (Ctrl+C)
# Start it again
npm start
```

## 📋 Twitter App Requirements

Your Twitter app needs:

### Required Access Level:
- ✅ **"Read"** access (minimum)
- ✅ **"Tweet.read"** permission
- ✅ **"users.read"** permission

### API Products:
- ✅ Must have **Twitter API v2** access
- ✅ **Free tier** is sufficient for testing (500,000 tweets/month)

### App Settings:
1. Go to your app in Developer Portal
2. Click "Set up" under "User authentication settings"
3. Enable "Read" permissions
4. Save changes
5. Regenerate Bearer Token

## 🎯 Search Keywords Being Used

The scan searches for these keywords:

```javascript
'need groceries'
'buy vegetables'
'fresh fruits'
'grocery delivery'
'need food'
'supermarket near me'
'bulk buying'
'corporate catering'
'office supplies food'
```

### Modify Keywords:

Edit `src/services/socialMediaService.ts`:

```typescript
const KEYWORDS = [
  'your custom keyword',
  'another keyword',
  // ... add more
];
```

## 🔍 Common Issues & Solutions

### Issue 1: "No new leads found"

**Possible causes:**
- No recent tweets match your keywords (last 7 days only)
- Keywords too specific
- Time of day (less activity at certain times)

**Solution:**
- Try broader keywords
- Scan multiple times per day
- Check console logs to see if tweets were found but filtered out

### Issue 2: "Token not configured"

**Console shows:**
```
❌ Twitter Bearer Token is not configured
```

**Solution:**
1. Check `.env` file has the token
2. Token variable name is exactly: `REACT_APP_TWITTER_BEARER_TOKEN`
3. Restart development server
4. Check console log shows: `🔑 Token exists: true`

### Issue 3: "Token seems too short"

**Console shows:**
```
⚠️ Token seems too short (50 characters). Expected 100+ characters.
```

**Solution:**
- Your token is incomplete
- Copy the entire token from Twitter Developer Portal
- Ensure no spaces or line breaks

### Issue 4: No console logs appearing

**Solution:**
1. Open Console tab in DevTools (F12)
2. Check "Preserve log" option
3. Clear console and try again
4. Make sure you're on the Social Leads page

## 📊 Expected Results

### With Valid Token:

- **200 response** from Twitter API
- **10-50 tweets** found (depends on activity)
- **Leads saved** to database
- **Toast notification**: "Found X new leads!"
- **Page refreshes** automatically showing new leads

### First Time Running:

Don't expect too many results initially:
- Twitter search only shows last 7 days
- Keywords might not match recent tweets
- Try different times of day
- Run multiple scans

## 🚀 Production Deployment

### Environment Variables:

Make sure to set in your production environment:

```env
REACT_APP_TWITTER_BEARER_TOKEN=your_production_token
```

### Rate Limits:

- **Free tier**: 500,000 tweets/month
- **Basic tier**: 2,000,000 tweets/month
- **Requests**: ~450 requests per 15-minute window

## 📞 Support

If issues persist after following this guide:

1. Check all console logs
2. Copy the error messages
3. Test token with curl command
4. Verify app permissions in Twitter Developer Portal
5. Try regenerating the Bearer Token

---

**The logging system will tell you exactly what's wrong! Check your console! 🔍**
