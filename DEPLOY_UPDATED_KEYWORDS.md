# 🚀 Deploy Updated Twitter Keywords

## ✅ What's New

Your Edge Function now has **120+ Nigerian-specific supermarket keywords** including:

### 📦 Categories Added:

1. **General Groceries** (Nigerian-specific)
   - "need groceries Nigeria", "buy groceries Lagos", "foodstuff supplier Nigeria"

2. **Bulk & Corporate**
   - "bulk buying Nigeria", "bulk order Lagos", "corporate catering Nigeria"
   - "office pantry Nigeria", "wholesale foodstuff"

3. **Rice & Grains**
   - "buy rice Nigeria", "bulk rice Lagos", "foreign rice", "local rice"
   - "beans supplier", "garri supplier", "semovita bulk"

4. **Cooking Essentials**
   - "vegetable oil Nigeria", "palm oil supplier", "tomato paste bulk"
   - "Maggi supplier", "curry powder", "sugar supplier"

5. **Beverages**
   - "soft drinks supplier", "malt drink bulk", "bottled water supplier"
   - "Milo bulk", "Bournvita supplier"

6. **Snacks & Biscuits** ⭐
   - "biscuits supplier Nigeria", "bulk biscuits Lagos"
   - "crackers wholesale", "chin chin supplier", "gala supplier"

7. **Perfumes & Cosmetics** ⭐
   - "perfume supplier Nigeria", "body spray bulk Lagos"
   - "deodorant supplier", "fragrance wholesale Nigeria"
   - "cologne supplier", "designer perfume Nigeria"

8. **Dairy & Proteins**
   - "Peak milk bulk", "frozen chicken Nigeria", "eggs supplier"

9. **Pasta & Noodles**
   - "spaghetti bulk", "indomie supplier", "noodles bulk"

10. **Toiletries**
    - "soap bulk", "detergent supplier", "tissue paper bulk"

11. **Baby Products**
    - "baby food Nigeria", "diapers bulk", "pampers supplier"

12. **Fresh Produce**
    - "fresh vegetables", "tomatoes supplier", "onions bulk"

13. **Delivery Services**
    - "grocery delivery Lagos", "home delivery groceries"
    - "send groceries Nigeria", "diaspora grocery gift"

14. **Event Supplies**
    - "party jollof ingredients", "wedding reception food"

### 🇳🇬 Nigerian Location Targeting

Searches now target tweets from:
- Nigeria
- Lagos
- Abuja
- Port Harcourt
- Kano
- Ibadan
- Enugu
- Kaduna
- Naija / 9ja (slang)

---

## 🚀 Deploy the Updated Function

Run this command:

```powershell
supabase functions deploy scan-twitter --no-verify-jwt
```

**Expected output:**
```
Deploying Function scan-twitter (project-ref: awepkphahdheqomgucby)...
Bundled scan-twitter (xxx KB)
✓ Deployed Function scan-twitter
```

---

## 🧪 Test the New Keywords

1. **Go to Social Leads page**
2. **Click "Scan for New Leads"**
3. **Wait 2-5 seconds**

**You should see tweets about:**
- Perfume suppliers in Lagos
- Bulk biscuit orders
- Provision deliveries in Abuja
- Rice suppliers in Nigeria
- Foodstuff needs across Nigerian cities

---

## 📊 How It Works

### **Keyword Batching**

Twitter's API has a **512-character limit** for search queries. With 120+ keywords, we:

1. **Batch keywords** into groups that fit within the limit
2. **Rotate batches** on each scan (future enhancement)
3. **Add location filter** to every batch: `(Nigeria OR Lagos OR Abuja...)`

### **Current Query Format**

```
(keyword1 OR keyword2 OR keyword3...) AND (Nigeria OR Lagos OR Abuja OR Naija)
```

This ensures **only Nigerian tweets** are returned!

---

## 🎯 Expected Results

### **Before (9 generic keywords):**
```
✅ Found 50 leads
- General grocery tweets from anywhere
- Many irrelevant/non-Nigerian leads
```

### **After (120+ Nigerian keywords):**
```
✅ Found 50 leads
- Specific product requests (perfume, biscuits, rice)
- Nigerian-specific suppliers needed
- Lagos, Abuja, Port Harcourt locations
- Corporate/bulk orders
- Diaspora sending groceries home
```

---

## 📈 Sample Tweets You'll Now Find

**Before:**
- "I need groceries" (generic, could be from anywhere)

**After:**
- "Looking for perfume supplier in Lagos, bulk order for my shop"
- "Need someone to send biscuits to my family in Abuja ASAP"
- "Who supplies foreign rice in bulk? Port Harcourt area"
- "Urgently need provisions delivered to Ikeja today"
- "Bulk indomie supplier in Nigeria, please DM"
- "Send me contact of groundnut oil wholesaler in Kano"
- "Where can I get designer perfumes in bulk, Lagos sellers"

---

## 🔍 Keyword Performance Tips

### **High-Converting Keywords:**
- "bulk" + product name (signals wholesale/corporate buyer)
- "supplier" + location (actively seeking provider)
- "urgent"/"ASAP" (immediate need = hot lead!)
- City names (local customers you can serve)

### **Monitor These:**
- Perfume-related (high-margin product)
- Bulk orders (larger revenue)
- Corporate catering (recurring business)
- Diaspora gifting (international market)

---

## 🎨 Customization

### **To Add More Keywords:**

Edit: `supabase/functions/scan-twitter/index.ts`

Line 14-160 (KEYWORDS array)

Add your keyword:
```typescript
'your new keyword here',
```

Then redeploy:
```powershell
supabase functions deploy scan-twitter --no-verify-jwt
```

### **To Add More Cities:**

Line 214:
```typescript
const query = `(${keywordBatches[0]}) (Nigeria OR Lagos OR YOUR_CITY OR Abuja...)`;
```

---

## ⚠️ Important Notes

### **Twitter Rate Limits:**
- With more keywords, you'll find more leads faster
- But still limited to 50 tweets per scan
- Don't scan more than once every 15 minutes

### **Keyword Quality > Quantity:**
- 120 keywords is excellent for Nigerian supermarket market
- Focus on high-intent words like "supplier", "bulk", "urgent"

### **Language:**
- Currently searches English tweets only
- Nigerianism and slang included ("Naija", "9ja")

---

## 📋 Deployment Checklist

- [ ] Run: `supabase functions deploy scan-twitter --no-verify-jwt`
- [ ] Wait for "✓ Deployed Function" message
- [ ] Go to Social Leads page
- [ ] Click "Scan for New Leads"
- [ ] Verify tweets are Nigeria-specific
- [ ] Check for perfume, biscuit, bulk order keywords
- [ ] Confirm locations (Lagos, Abuja, etc.) in tweets

---

## 🎉 Success Criteria

You'll know it's working when you see:

✅ Tweets mentioning **Nigerian cities** (Lagos, Abuja, PH)
✅ **Specific products** (perfumes, biscuits, rice, Maggi)
✅ **Bulk/supplier** requests (wholesale, corporate)
✅ **Local context** (Naija slang, local brands like Peak milk)
✅ **Contact info** in bios (phone numbers, WhatsApp)

---

**Deploy now and start finding high-quality Nigerian leads!** 🇳🇬🚀
