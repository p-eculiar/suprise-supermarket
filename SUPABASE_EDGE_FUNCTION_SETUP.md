# Supabase Edge Function Setup - Twitter API Integration

## 🎯 Problem Solved

**CORS Error Fixed!** Twitter API cannot be called directly from the browser. The solution is to use a Supabase Edge Function (serverless backend) that runs on Supabase's servers.

## ✅ Complete Setup Guide

### Step 1: Install Supabase CLI

Open PowerShell and run:

```powershell
# Install via npm
npm install -g supabase

# Or via scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

Verify installation:
```powershell
supabase --version
```

### Step 2: Login to Supabase CLI

```powershell
supabase login
```

This will open your browser to authenticate.

### Step 3: Link Your Project

Navigate to your project directory:

```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
```

Link to your Supabase project:

```powershell
supabase link --project-ref awepkphahdheqomgucby
```

### Step 4: Set Edge Function Secrets

Set your Twitter Bearer Token as a secret:

```powershell
supabase secrets set TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAALEP4wEAAAAArAkb+BYtalxh2F2MGJoeCf22RPs=0OvwOeKisQEE6emT2PfB81y57HJovjTmK2vShWX6z24i2VXsFD"
```

**Note**: Use the decoded token (the one from your .env file)

### Step 5: Deploy the Edge Function

The function file is already created at:
`supabase/functions/scan-twitter/index.ts`

Deploy it:

```powershell
supabase functions deploy scan-twitter
```

You should see:
```
✅ Deployed Function scan-twitter
Function URL: https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter
```

### Step 6: Test the Edge Function

Test it manually first:

```powershell
curl -X POST https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter `
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY"
```

Expected response:
```json
{
  "success": true,
  "total": 25,
  "message": "Found and saved 25 new leads from Twitter"
}
```

### Step 7: Update Frontend to Call Edge Function

The frontend code needs to be updated to call the Edge Function instead of Twitter API directly.

I'll create the updated service file next.

## 🔐 Security Notes

### Edge Function Secrets:

- `TWITTER_BEARER_TOKEN` - Stored securely in Supabase
- Never exposed to the browser
- Only accessible by the Edge Function

### Environment Variables Already Set:

Supabase automatically provides:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### CORS Headers:

The Edge Function includes proper CORS headers to allow your frontend to call it.

## 📊 How It Works

```
Browser (React)
    ↓
    Calls Edge Function (Supabase)
        ↓
        Calls Twitter API (with Bearer Token)
            ↓
            Returns Tweets
        ↓
        Transforms Data
        ↓
        Saves to Supabase Database
    ↓
    Returns Results to Browser
```

## 🎯 Advantages

✅ **No CORS Issues** - Edge Function runs on server-side
✅ **Secure** - Twitter token never exposed to browser
✅ **Fast** - Runs on Supabase's global edge network
✅ **Scalable** - Automatically scales with demand
✅ **Free Tier** - Generous free tier (500K function invocations/month)

## 📝 Edge Function Commands

### View Logs:
```powershell
supabase functions logs scan-twitter
```

### Update Function:
```powershell
supabase functions deploy scan-twitter
```

### List All Functions:
```powershell
supabase functions list
```

### Delete Function:
```powershell
supabase functions delete scan-twitter
```

## 🧪 Testing

### Test from Browser Console:

```javascript
const response = await fetch('https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### Expected Success Response:

```json
{
  "success": true,
  "total": 25,
  "leads": [...],
  "message": "Found and saved 25 new leads from Twitter"
}
```

### Expected Error Response:

```json
{
  "success": false,
  "error": "Twitter API error (401): Unauthorized"
}
```

## 🔄 Next Steps

After deploying the Edge Function:

1. Update the frontend service to call the Edge Function
2. Test the scan button
3. Verify leads are saved to database
4. Monitor Edge Function logs

## 📚 Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Twitter API v2 Docs](https://developer.twitter.com/en/docs/twitter-api)
- [Deno Deploy](https://deno.com/deploy/docs)

---

**Ready to deploy? Run the commands above!** 🚀
