# 🐦 TWITTER API SETUP GUIDE
## Complete Step-by-Step Instructions

---

## 📋 WHAT YOU'LL GET

The Twitter API allows your **Social Leads** feature to:
- Monitor Twitter for potential customers
- Find people asking for groceries/supermarket services
- Automatically capture leads
- Track sentiment and urgency
- Store leads in your database

---

## 🎯 QUICK OVERVIEW

**What You Need:**
1. Twitter/X Account (free)
2. Twitter Developer Account (free)
3. Bearer Token (free tier available)

**Time Required:** 10-15 minutes

**Cost:** FREE (with limitations) or $100/month (Pro)

---

## 📝 STEP-BY-STEP INSTRUCTIONS

### **STEP 1: Create/Login to Twitter Account**

1. **Go to:** https://twitter.com
2. **Sign up** if you don't have an account
3. **Verify your email** and **phone number**
   - ⚠️ Phone verification is REQUIRED for API access

---

### **STEP 2: Apply for Developer Account**

1. **Go to:** https://developer.twitter.com/

2. **Click** "Sign up" or "Apply"

3. **Choose Account Type:**
   - Select **"Making a bot"** or **"Building a product"**
   - For your use case: **"Building a business tool"**

4. **Fill Out Application Form:**

   **Basic Information:**
   - Name: Your name
   - Country: Your country
   - Use case: "Lead generation for grocery business"

   **Intended Use:**
   ```
   I am building a supermarket/grocery delivery platform called 
   "Surprise Supermarket" in Nigeria. I need the Twitter API to 
   monitor mentions of grocery shopping, supermarket services, 
   and food delivery to identify potential customers who are 
   looking for these services. The app will scan for keywords 
   like "supermarket," "groceries," "delivery," and "food" to 
   capture leads and provide them to our sales team.
   ```

   **Will you make Twitter data available to government?**
   - Select: **"No"**

   **Will you display Twitter data?**
   - Select: **"Yes"**
   - Explain: "Only internally in admin dashboard for lead tracking"

5. **Review Terms** and **Submit Application**

6. **Wait for Approval** (usually instant to 24 hours)
   - You'll receive an email when approved

---

### **STEP 3: Create a Twitter App**

Once approved:

1. **Go to:** https://developer.twitter.com/en/portal/dashboard

2. **Click:** "Create App" or "Create Project"

3. **Project Setup:**
   - **Project Name:** Surprise Supermarket
   - **Use case:** Select "Business" or "Making a bot"
   - **Description:** 
     ```
     Lead generation tool for grocery delivery service
     ```

4. **App Setup:**
   - **App Name:** surprise-supermarket-leads
   - **Description:** 
     ```
     Monitors Twitter for potential grocery delivery customers
     ```

5. **Click:** "Create"

---

### **STEP 4: Get Your Bearer Token**

This is what you need for your `.env` file!

1. **After creating app**, you'll see a screen with keys

2. **Copy the Bearer Token:**
   ```
   Bearer Token: AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA...
   ```
   
3. **⚠️ SAVE THIS IMMEDIATELY!**
   - You can only see it once
   - If you lose it, you'll need to regenerate

4. **Store Securely:**
   - Don't share it
   - Don't commit to Git
   - Keep in `.env` file

---

### **STEP 5: Add to Your Application**

1. **Open your `.env` file**

2. **Find line 22:**
   ```env
   REACT_APP_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   ```

3. **Replace with your actual token:**
   ```env
   REACT_APP_TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid...
   ```

4. **Save the file**

5. **Restart your development server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then start again
   npm start
   ```

---

## 🎛️ API ACCESS LEVELS

### **Free Tier (Default):**
- ✅ 500,000 tweets/month
- ✅ 1 app
- ✅ Read-only access
- ✅ Perfect for lead monitoring
- ❌ Limited to 7 days of tweet history

**💡 This is enough for your use case!**

### **Basic Tier ($100/month):**
- ✅ 10,000 tweets/month
- ✅ 2 apps
- ✅ 30 days history
- ✅ Full archive search

### **Pro Tier ($5,000/month):**
- ✅ 1,000,000 tweets/month
- ✅ Multiple apps
- ✅ Full historical access

---

## 🧪 TESTING YOUR API KEY

### **Quick Test:**

1. **Open Terminal/PowerShell**

2. **Run this command** (replace with your token):
   ```bash
   curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=supermarket&max_results=10" -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

3. **You should see JSON response** with tweets

### **Test in Your App:**

1. **Go to Admin Dashboard** → **Social Leads**

2. **Click** "Scan for Leads"

3. **Should see:**
   - "Scanning Twitter..."
   - Results appear
   - Leads saved to database

---

## 🔧 TROUBLESHOOTING

### **Problem: Application Not Approved**

**Solution:**
- Make application more detailed
- Explain business use case clearly
- Mention it's for internal use only
- Reapply after 24 hours

### **Problem: "401 Unauthorized" Error**

**Causes:**
1. Bearer token is incorrect
2. Token not properly formatted
3. App doesn't have correct permissions

**Solutions:**
- Regenerate token in Developer Portal
- Check for extra spaces in `.env`
- Ensure token starts with `AAAA`
- Restart development server

### **Problem: "403 Forbidden" Error**

**Causes:**
- App doesn't have search permission
- Free tier limits exceeded

**Solutions:**
- Check app permissions in Developer Portal
- Enable "Read" permissions
- Wait if rate limit exceeded (resets every 15 min)

### **Problem: "429 Too Many Requests"**

**Cause:** Rate limit exceeded

**Solutions:**
- Free tier: 500k tweets/month
- Each search query counts
- Wait 15 minutes
- Reduce search frequency

### **Problem: Token Not Found in .env**

**Solution:**
```bash
# Make sure .env is in root directory
# Restart development server
# Check environment variables loaded:

# In React component:
console.log(process.env.REACT_APP_TWITTER_BEARER_TOKEN);
```

---

## 🔐 SECURITY BEST PRACTICES

### **DO:**
✅ Store token in `.env` file
✅ Add `.env` to `.gitignore`
✅ Use environment variables
✅ Regenerate token if exposed
✅ Use separate tokens for dev/production

### **DON'T:**
❌ Commit token to Git
❌ Share token publicly
❌ Hardcode in source files
❌ Use same token across projects
❌ Expose in client-side code

---

## 📊 MONITORING USAGE

### **Check Rate Limits:**

1. **Go to:** https://developer.twitter.com/en/portal/dashboard

2. **Click:** Your app name

3. **View:** Usage statistics
   - Requests made
   - Requests remaining
   - Reset time

### **In Your Code:**

```typescript
// Headers include rate limit info
const response = await fetch('https://api.twitter.com/2/...');
console.log(response.headers.get('x-rate-limit-remaining'));
console.log(response.headers.get('x-rate-limit-reset'));
```

---

## 🎯 KEYWORDS FOR YOUR SUPERMARKET

Your `socialMediaService.ts` is pre-configured with these keywords:

```typescript
const keywords = [
  'supermarket', 'grocery', 'groceries',
  'food delivery', 'fresh produce',
  'vegetables', 'fruits', 'meat',
  'need groceries', 'buy groceries',
  'grocery shopping', 'food shopping',
  'home delivery', 'deliver groceries'
];
```

### **Customize Keywords:**

Edit `src/services/socialMediaService.ts`:

```typescript
private static readonly TWITTER_SEARCH_KEYWORDS = [
  // Add your city/region
  'supermarket Lagos',
  'groceries Abuja',
  
  // Add your brand
  'Surprise Supermarket',
  
  // Add specific needs
  'urgent groceries',
  'same day delivery food',
];
```

---

## 📈 EXPECTED RESULTS

### **What You'll Capture:**

**Sample Tweets That Get Captured:**
- "Anyone know a good supermarket with home delivery in Lagos?"
- "Need groceries delivered ASAP!"
- "Looking for fresh vegetables and fruits delivery"
- "Best supermarket for organic products?"

### **Lead Information Stored:**

```typescript
{
  platform: 'twitter',
  author_name: 'John Doe',
  author_handle: '@johndoe',
  post_content: 'Need groceries delivered today...',
  post_url: 'https://twitter.com/...',
  sentiment: 'urgent',
  keywords_matched: ['groceries', 'delivered'],
  status: 'new',
  created_at: '2025-01-10T08:00:00Z'
}
```

---

## 🔄 ALTERNATIVE: Without Twitter API

If you can't get Twitter API access, your app still works!

### **Manual Lead Entry:**

You can manually add leads in the admin dashboard:

1. Go to **Admin** → **Social Leads**
2. Click **"Add Lead Manually"**
3. Enter lead information
4. Save

### **Use Other Sources:**

- Facebook (requires Facebook Graph API)
- Instagram (requires Instagram Basic Display API)
- WhatsApp Business inquiries
- Website contact form submissions
- Email inquiries

---

## 📚 ADDITIONAL RESOURCES

### **Official Documentation:**
- Twitter Developer Portal: https://developer.twitter.com/
- API Reference: https://developer.twitter.com/en/docs/twitter-api
- Rate Limits: https://developer.twitter.com/en/docs/rate-limits

### **Helpful Guides:**
- Twitter API v2 Guide: https://developer.twitter.com/en/docs/twitter-api/getting-started/guide
- Authentication: https://developer.twitter.com/en/docs/authentication/oauth-2-0

### **Community Support:**
- Twitter Developer Forum: https://twittercommunity.com/
- Stack Overflow: Tag `twitter-api`

---

## ✅ FINAL CHECKLIST

Before using Social Leads feature:

- [ ] Twitter account created
- [ ] Twitter Developer account approved
- [ ] App created in Developer Portal
- [ ] Bearer Token obtained
- [ ] Token added to `.env` file
- [ ] Development server restarted
- [ ] Test search in admin dashboard
- [ ] Verify leads are captured
- [ ] Check database for stored leads

---

## 🎉 YOU'RE DONE!

Once you have your Bearer Token:

1. ✅ Add to `.env` line 22
2. ✅ Restart server
3. ✅ Go to Admin → Social Leads
4. ✅ Click "Scan for Leads"
5. ✅ Watch leads appear!

### **Your Social Lead Generation is now LIVE! 🚀**

---

## 💡 PRO TIPS

### **Optimize Your Searches:**

1. **Use Location Filters:**
   ```typescript
   const query = `${keywords} (Lagos OR Abuja OR Nigeria)`;
   ```

2. **Exclude Retweets:**
   ```typescript
   const query = `${keywords} -is:retweet`;
   ```

3. **Only Recent Tweets:**
   ```typescript
   const query = `${keywords} -is:retweet`;
   // API automatically limits to 7 days on free tier
   ```

4. **Filter by Language:**
   ```typescript
   const query = `${keywords} lang:en`;
   ```

### **Automate Lead Scanning:**

Set up a cron job or schedule:

```typescript
// In your admin dashboard
setInterval(async () => {
  await SocialMediaService.scanTwitter();
}, 3600000); // Every hour
```

---

## 📞 NEED HELP?

**Twitter Support:**
- Developer Forum: https://twittercommunity.com/
- Support: https://developer.twitter.com/en/support

**Application Support:**
- Check your `socialMediaService.ts` logs
- Verify `.env` configuration
- Test API key independently

---

## 🎊 CONGRATULATIONS!

You now know how to:
- ✅ Get Twitter API access
- ✅ Create a Developer account
- ✅ Generate Bearer Token
- ✅ Configure your application
- ✅ Monitor and optimize usage
- ✅ Capture social media leads

**Your supermarket now has intelligent lead generation! 🛒📱**
