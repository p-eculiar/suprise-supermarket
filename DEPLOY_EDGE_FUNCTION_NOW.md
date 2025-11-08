# 🚀 Deploy Twitter Scan Edge Function - COMPLETE GUIDE

## ⚠️ IMPORTANT: Why You're Still Getting CORS Error

Your frontend code has been updated to call the Supabase Edge Function, but:
1. The Edge Function hasn't been deployed to Supabase yet
2. Your dev server is running cached code

## 📋 Step-by-Step Deployment Instructions

### Step 1: Install Supabase CLI

Open PowerShell as Administrator and run:

```powershell
# Install Scoop (if not already installed)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Alternative (using npm):**
```powershell
npm install -g supabase
```

Verify installation:
```powershell
supabase --version
```

### Step 2: Login to Supabase

```powershell
supabase login
```

This will open your browser. Login with your Supabase account credentials.

### Step 3: Link Your Project

Navigate to your project directory:
```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
```

Link to your Supabase project:
```powershell
supabase link --project-ref awepkphahdheqomgucby
```

When prompted for the database password, use your Supabase database password.

### Step 4: Set Twitter API Token as Secret

```powershell
supabase secrets set TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAALEPW4AEAAAA%2FqCizbMg%2FgDW7Xez25IZVuBqBqOg%3D6YUWJjcQdQWa1g3PNQlFRYr1BZJgcEWQnwGI54DvQO96LzrBLQ"
```

### Step 5: Deploy the Edge Function

```powershell
supabase functions deploy scan-twitter
```

This will:
- Upload your Edge Function code to Supabase
- Make it available at: `https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter`

### Step 6: Verify Deployment

Test the Edge Function directly:
```powershell
curl -X POST https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA" -H "Content-Type: application/json"
```

You should get a JSON response with Twitter leads.

### Step 7: Restart Your Development Server

1. **Stop the current dev server** (press Ctrl+C in the terminal running `npm start`)

2. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click the refresh button
   - Select "Empty Cache and Hard Reload"

3. **Restart dev server:**
```powershell
npm start
```

4. **Test the scan:**
   - Go to Social Leads page
   - Click "Scan for New Leads"
   - Check console for success messages

## 🔍 Expected Console Output After Fix

When you click "Scan for New Leads", you should see:

```
✨ SocialLeadsApi: Starting social media scan...
🚀 Starting scan of all platforms...
📍 Scanning Twitter via Edge Function...
🐦 Starting Twitter scan via Edge Function...
🌐 Edge Function URL: https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter
📡 Calling Edge Function...
⏱️ Request completed in XXXms
📊 Response status: 200 OK
✅ Edge Function response received
🎯 Found X leads from Edge Function
✅ Twitter scan complete: X leads
```

## ❌ Troubleshooting

### Error: "supabase: command not found"
- Make sure you installed Supabase CLI correctly
- Restart PowerShell after installation
- Try the npm installation method instead

### Error: "Invalid project ref"
- Double-check your project ref is: `awepkphahdheqomgucby`
- Make sure you're logged in: `supabase login`

### Error: "Invalid JWT" or "Unauthorized"
- Your Supabase anon key might be wrong
- Check `.env` file has correct `REACT_APP_SUPABASE_ANON_KEY`

### Error: "Twitter API authentication failed"
- The Twitter token secret wasn't set correctly
- Re-run: `supabase secrets set TWITTER_BEARER_TOKEN="..."`
- Make sure there are NO spaces around the `=` sign

### Still Getting CORS Error
- Edge Function isn't deployed yet - complete Step 5
- Browser cache not cleared - do hard refresh (Ctrl+Shift+R)
- Dev server not restarted - restart it

## 📁 Files Updated

These files were already updated to use Edge Function:

1. ✅ `src/services/socialMediaService.ts` - Now calls Edge Function instead of Twitter API directly
2. ✅ `supabase/functions/scan-twitter/index.ts` - Edge Function code created
3. ✅ Project built successfully

## 🎯 What Happens After Deployment

1. **No More CORS Errors** - Edge Function runs on Supabase servers, not in browser
2. **Real Twitter Data** - Actual tweets matching your keywords will be scanned
3. **Automatic Database Saving** - Leads are saved directly by the Edge Function
4. **Better Security** - Twitter API token never exposed to browser
5. **Production Ready** - This solution works in production, not just development

## 📞 Quick Reference Commands

```powershell
# Check if logged in
supabase projects list

# Check deployed functions
supabase functions list

# View function logs (for debugging)
supabase functions logs scan-twitter

# Update function after changes
supabase functions deploy scan-twitter

# List secrets
supabase secrets list
```

## 🎉 Success Criteria

You'll know it's working when:
- ✅ No CORS errors in console
- ✅ Console shows "Edge Function URL: https://..."
- ✅ Response status is 200 OK
- ✅ Real tweets appear in Social Leads table
- ✅ Keywords like "need groceries", "bulk buying" are matched
- ✅ Toast notification: "Successfully scanned X new leads"

---

**Need Help?** 
- Check Edge Function logs: `supabase functions logs scan-twitter`
- Look for errors in browser console (F12)
- Verify Twitter token is valid on Twitter Developer Portal
