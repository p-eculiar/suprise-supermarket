# Social Leads Page - Complete Setup Guide

## Current Issue
The Social Leads page shows "No leads found" because the database table is empty.

## ✅ Solution - Follow These Steps:

### Step 1: Run the SQL Script

Open Supabase SQL Editor and run: **`SETUP_SOCIAL_LEADS_WITH_DATA.sql`**

This script will:
1. ✅ Create the `social_leads` table if it doesn't exist
2. ✅ Set up proper indexes for performance
3. ✅ Configure Row Level Security (RLS) policies
4. ✅ **Insert 8 sample leads for testing**
5. ✅ Show you a summary of the inserted data

### Step 2: Verify the Data

After running the script, you should see:
- Table created successfully
- Sample leads inserted
- Count by platform and status displayed

Check with this query:
```sql
SELECT COUNT(*) as total_leads FROM social_leads;
```

You should see **8 total leads**.

### Step 3: Test the Page

1. Go to `/admin/social-leads` in your admin dashboard
2. You should now see:
   - **Total Leads**: 8
   - **New Leads**: 5
   - **Contacted**: 2
   - **Converted**: 1
3. The leads will display in cards with:
   - Platform badges (Twitter, Facebook, Instagram, WhatsApp)
   - Author information
   - Post content
   - Matched keywords
   - Contact info (phone/email)
   - Actions (View Post, Update Status, Contact via WhatsApp)

## 🎯 Features Now Working:

### 1. Real-Time Data
- ✅ Uses React Query for efficient data fetching
- ✅ Real-time updates with Supabase subscriptions
- ✅ Automatic refresh when data changes
- ✅ Proper caching and invalidation

### 2. Filtering
- **By Platform**: All, Twitter, Facebook, Instagram, WhatsApp
- **By Status**: All, New, Contacted, Converted

### 3. Statistics Dashboard
- Total Leads count
- New Leads count
- Contacted count
- Converted count

### 4. Lead Management
- View full post content
- See matched keywords
- Access contact information
- Update lead status (New → Contacted → Converted)
- Open post in new tab
- Contact via WhatsApp (if phone number available)

### 5. Toast Notifications (NEW!)
- ✅ Success toast when status updated
- ✅ Error toast if update fails
- ✅ Info toast when scanning starts
- ✅ Success toast when scan completes
- ✅ All alerts replaced with professional toasts

## 📊 Sample Data Included:

The script inserts 8 diverse leads:

1. **John Doe** (Twitter) - Looking for grocery delivery, Status: New
2. **Sarah Johnson** (Twitter) - URGENT bulk order, Status: New
3. **Mike Peters** (Facebook) - Office pantry stocking, Status: Contacted
4. **Grace Okafor** (Twitter) - Send groceries to Nigeria, Status: New
5. **David Chen** (WhatsApp) - Restaurant wholesale supplier, Status: New
6. **FoodieNaija** (Instagram) - Positive review, Status: Converted
7. **Emma Wilson** (Twitter) - New area, daily produce, Status: Contacted
8. **Corporate Solutions** (Facebook) - Monthly bulk orders, Status: New

## 🔄 How the Scan Feature Works:

When you click "Scan for New Leads":

1. Calls `SocialLeadsApi.scanSocialLeads()`
2. Uses `SocialMediaService.scanAllPlatforms()`
3. Currently scans:
   - **Twitter** (if API token configured)
   - Facebook (placeholder - needs Graph API)
   - Instagram (placeholder - needs Display API)
4. Searches for keywords like:
   - "need groceries"
   - "bulk order"
   - "grocery delivery"
   - "corporate catering"
   - "send groceries to Nigeria"
5. Saves new leads to database
6. Refreshes the page automatically

## ⚙️ Twitter API Setup (Optional - For Real Scanning):

To enable real Twitter scanning:

1. Get Twitter API Bearer Token from [Twitter Developer Portal](https://developer.twitter.com/)
2. Add to your `.env` file:
   ```
   REACT_APP_TWITTER_BEARER_TOKEN=your_bearer_token_here
   ```
3. Restart your development server

**Note**: The page works perfectly with sample data even without Twitter API!

## 🎨 UI Improvements Made:

### Before:
- Alert popups for all messages
- No feedback during scanning
- Generic error messages

### After:
- ✅ Professional toast notifications
- ✅ Loading state during scan
- ✅ Detailed success/error messages
- ✅ Better empty state messages
- ✅ Filter-aware empty state

## 🧪 Testing Checklist:

- [ ] Run SQL script successfully
- [ ] Verify 8 leads inserted
- [ ] Page shows statistics correctly
- [ ] Filter by platform works
- [ ] Filter by status works
- [ ] Click "View Post" opens link
- [ ] Update status shows success toast
- [ ] WhatsApp contact button works
- [ ] Real-time updates work (try updating in another tab)
- [ ] Refresh button works

## 📁 Files Modified:

1. **`src/pages/admin/SocialLeads.tsx`**
   - Added toast notifications
   - Improved error handling
   - Better empty state messages
   - Added loading feedback

2. **`SETUP_SOCIAL_LEADS_WITH_DATA.sql`** (NEW)
   - Creates table with proper structure
   - Inserts 8 sample leads
   - Sets up RLS policies
   - Creates indexes

## 🚀 Next Steps (Optional Enhancements):

1. **Enable Real Twitter Scanning**:
   - Add Twitter Bearer Token to environment
   - Test with live Twitter data

2. **Add More Platforms**:
   - Implement Facebook Graph API
   - Implement Instagram Basic Display API
   - Add LinkedIn integration

3. **Enhanced Features**:
   - Email templates for contacting leads
   - Automated follow-up reminders
   - Lead scoring system
   - Export to CSV
   - Analytics dashboard

## 🐛 Troubleshooting:

### "No leads found" after running SQL:
- Check if script ran successfully
- Verify with: `SELECT COUNT(*) FROM social_leads;`
- Check RLS policies allow you to read data
- Ensure you're logged in as admin user

### Toast not showing:
- Check browser console for errors
- Verify ToastProvider is in App.tsx
- Refresh the page

### Filters not working:
- Clear browser cache
- Check console for errors
- Verify data has different platforms/statuses

---

**That's it!** Your Social Leads page should now be fully functional with real-time data! 🎉
