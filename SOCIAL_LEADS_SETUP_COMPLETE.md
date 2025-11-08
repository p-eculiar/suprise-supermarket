# ✅ Social Leads Setup Complete!

## 🎉 What's Working

Your Social Leads feature is now **fully functional** with **real Twitter API integration**!

### ✅ Features Verified

1. **Real-Time Twitter Scanning**
   - Scans Twitter API for keywords like "need groceries", "bulk order", etc.
   - Returns up to 50 real tweets per scan
   - No CORS errors
   - Uses Supabase Edge Function (production-ready)

2. **Lead Display**
   - Shows all leads in a clean, organized list
   - Platform badges (Twitter, Facebook, Instagram, WhatsApp)
   - Author name and handle
   - Full tweet content
   - Matched keywords highlighting
   - Date created

3. **Filtering System**
   - Filter by Platform: All, Twitter, Facebook, Instagram, WhatsApp
   - Filter by Status: All, New, Contacted, Converted, Ignored
   - Real-time updates when filters change

4. **Lead Management**
   - Update status dropdown for each lead
   - Statuses: New → Contacted → Converted / Ignored
   - Status changes save to database automatically
   - Toast notifications on success/error

5. **Contact Features**
   - "View Post" button - Opens original Twitter post in new tab
   - "Contact on WhatsApp" button - Opens WhatsApp chat (only shows if contact info available)
   - Direct link to author's social media profile

6. **Statistics Dashboard**
   - Total Leads count
   - New Leads count
   - Contacted count
   - Converted count
   - Updates in real-time

7. **Real-Time Updates**
   - Automatically refreshes when new leads added
   - No need to manually refresh page
   - Uses Supabase Realtime subscriptions

---

## 🗑️ Remove Sample Data

You currently have **50 real Twitter leads** + **8 sample leads** in the database.

To remove the sample data and keep only real API leads:

### **Method 1: Supabase Dashboard (Easiest)**

1. Go to: https://supabase.com/dashboard/project/awepkphahdheqomgucby/editor
2. Open SQL Editor
3. Copy and paste this query:

```sql
DELETE FROM social_leads
WHERE author_handle IN (
  'sarahj_biz',
  'corporate_buyer', 
  'maryfoods',
  'jane_organics',
  'bulk_buyer_ng',
  'cateringpro',
  'officemgr_lagos',
  'restaurant_supply'
);
```

4. Click "Run"
5. Refresh your Social Leads page in the browser

### **Method 2: Run SQL File**

Open the file: `REMOVE_SAMPLE_DATA_SIMPLE.sql`

Run it in Supabase SQL Editor.

---

## 📊 How Everything Works

### **Scan Flow**

```
1. User clicks "Scan for New Leads"
   ↓
2. Frontend calls: SocialLeadsApi.scanSocialLeads()
   ↓
3. API calls: Supabase Edge Function at /functions/v1/scan-twitter
   ↓
4. Edge Function calls: Twitter API v2 search endpoint
   ↓
5. Twitter returns: Up to 50 tweets matching keywords
   ↓
6. Edge Function transforms: Raw tweets → SocialPost format
   ↓
7. Edge Function saves: Leads to social_leads table
   ↓
8. Frontend receives: Success response with lead count
   ↓
9. Table updates: Shows new leads automatically
   ↓
10. Toast notification: "Found X new leads!"
```

### **Contact Flow**

```
1. Admin sees interesting lead
   ↓
2. Clicks "View Post" → Opens Twitter post
   ↓
3. Reads full context and profile
   ↓
4. If lead has phone number in bio → "Contact on WhatsApp" button appears
   ↓
5. Clicks button → Opens WhatsApp chat
   ↓
6. Sends message to potential customer
   ↓
7. Updates status to "Contacted"
   ↓
8. After sale → Updates to "Converted"
```

---

## 🔑 Keywords Being Searched

The system searches Twitter for these phrases:

- "need groceries"
- "buy vegetables"
- "fresh fruits"
- "grocery delivery"
- "need food"
- "supermarket near me"
- "bulk buying"
- "corporate catering"
- "office supplies food"

**To modify keywords:** Edit `supabase/functions/scan-twitter/index.ts` line 17-25

---

## 📱 Contact Button Logic

The "Contact on WhatsApp" button appears **only when**:
- Lead has `contact_info` field populated
- Contact info is not empty
- Number is extracted and formatted for WhatsApp

If contact info is missing, only "View Post" button shows.

---

## 🎨 Platform Colors

- **Twitter**: #1DA1F2 (Blue)
- **Facebook**: #4267B2 (Dark Blue)
- **Instagram**: #E4405F (Pink/Red)
- **WhatsApp**: #25D366 (Green)

---

## 🔄 Status Workflow

```
New → Just discovered, not contacted yet
  ↓
Contacted → Admin reached out to customer
  ↓
Converted → Customer made a purchase! 🎉
  or
Ignored → Not relevant/spam/duplicate
```

---

## ⚠️ Rate Limits

**Twitter API Free Tier:**
- 50 tweets per request
- ~450 requests per 15-minute window
- If you hit limit: Wait 15 minutes, then scan again

**Signs you hit rate limit:**
- Error 429 "Too Many Requests"
- Solution: Wait 15 min or upgrade Twitter API plan

---

## 🚀 Best Practices

### **Daily Usage:**
1. Scan once in the morning (8-10 AM)
2. Scan once in the afternoon (2-4 PM)
3. Review new leads
4. Contact high-quality leads immediately
5. Update statuses as you progress

### **Lead Quality:**
- **Urgent sentiment** = Respond ASAP!
- **Positive sentiment** = Good prospect
- **Neutral sentiment** = Standard lead

### **Contact Strategy:**
1. Click "View Post" first
2. Read their full tweet and bio
3. Check if they're in Nigeria (location)
4. If good match → Contact on WhatsApp
5. Personalize message: "Hi [Name], I saw your tweet about..."

---

## 📈 Future Enhancements (Optional)

### **Could Add:**
- Email notifications when urgent leads found
- Auto-assign leads to sales team members
- Lead scoring based on keywords + sentiment
- Export leads to CSV
- Facebook/Instagram API integration
- Scheduled auto-scans (every hour)
- Analytics dashboard (conversion rate, response time)
- CRM integration

---

## 🐛 Troubleshooting

### "No leads found after scan"

**Possible causes:**
1. No new tweets in last 7 days matching keywords
2. Twitter rate limit hit
3. Keywords too specific

**Solutions:**
- Wait and try again later
- Check Twitter manually for those keywords
- Broaden keyword list

### "Contact button not appearing"

**Cause:** Lead doesn't have contact info (phone number)

**Solution:** Click "View Post" and check their Twitter bio/description manually

### "WhatsApp link doesn't work"

**Cause:** Invalid phone number format

**Solution:** Copy number from lead and manually open WhatsApp

### "Scan takes long time"

**Normal:** Scans can take 2-5 seconds (calling Twitter API)

**Too long (>10 sec):** Check your internet connection

---

## 📁 Important Files

### **Frontend:**
- `src/pages/admin/SocialLeads.tsx` - Main page
- `src/services/socialMediaService.ts` - Calls Edge Function
- `src/services/socialLeadsApi.ts` - API wrapper

### **Backend:**
- `supabase/functions/scan-twitter/index.ts` - Edge Function code

### **Database:**
- Table: `social_leads`
- Columns: platform, author_name, author_handle, post_content, post_url, contact_info, keywords_matched, sentiment, status

### **SQL Scripts:**
- `REMOVE_SAMPLE_DATA_SIMPLE.sql` - Remove sample leads
- `REMOVE_SAMPLE_LEADS.sql` - Detailed cleanup

---

## ✅ Checklist

- [x] Supabase CLI installed
- [x] Edge Function deployed
- [x] Twitter Bearer Token set
- [x] CORS error fixed
- [x] Real Twitter API working
- [x] 50 real leads loaded
- [x] All features working:
  - [x] Scan button
  - [x] Platform filter
  - [x] Status filter
  - [x] Status update
  - [x] View Post button
  - [x] Contact button
  - [x] Statistics
  - [x] Real-time updates
- [ ] Sample data removed (run SQL script)

---

## 🎉 You're Done!

Your Social Leads system is **production-ready** and working with **real data from Twitter**!

**Next step:** Remove sample data using the SQL script, then start converting those leads into customers! 💰

---

**Questions? Issues?** Check the troubleshooting section above or review the detailed setup guides.
