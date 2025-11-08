# 🎯 VISUAL GUIDE: Install Supabase CLI in 5 Minutes

## 📋 Overview

```
Download ZIP → Extract → Move to Program Files → Add to PATH → Restart PowerShell → DONE!
```

---

## STEP 1️⃣: Download

**Go to:** https://github.com/supabase/cli/releases

**Look for:**
```
┌─────────────────────────────────────┐
│  Assets                             │
├─────────────────────────────────────┤
│  📄 supabase_windows_amd64.zip      │  ← CLICK THIS
│  📄 supabase_linux_amd64.tar.gz     │
│  📄 supabase_darwin_amd64.tar.gz    │
└─────────────────────────────────────┘
```

**Result:** File downloads to `C:\Users\pchik\Downloads\`

---

## STEP 2️⃣: Extract

**Right-click the ZIP file:**
```
┌─────────────────────────────────┐
│  Open                           │
│  Extract All...                 │  ← CLICK THIS
│  Extract to...                  │
│  Copy                           │
└─────────────────────────────────┘
```

**Inside you'll find:**
```
📁 supabase_windows_amd64
   └── 📄 supabase.exe  ← THIS IS WHAT YOU NEED
```

---

## STEP 3️⃣: Create Folder & Move File

### 3A: Open File Explorer

Press: `Windows Key + E`

### 3B: Go to Program Files

Type in address bar:
```
C:\Program Files
```

### 3C: Create New Folder

Right-click empty space → New → Folder → Name it: `Supabase`

```
C:\Program Files\
   ├── 📁 Common Files
   ├── 📁 Internet Explorer
   ├── 📁 Supabase          ← NEW FOLDER YOU CREATED
   └── 📁 Windows Defender
```

### 3D: Move supabase.exe

Copy `supabase.exe` from Downloads and paste into `C:\Program Files\Supabase\`

**Final location:**
```
C:\Program Files\Supabase\supabase.exe  ✅
```

---

## STEP 4️⃣: Add to PATH

### 4A: Open Run Dialog

Press: `Windows Key + R`

Type: `sysdm.cpl`

Press: `Enter`

```
┌──────────────────────────┐
│  Open: sysdm.cpl         │
├──────────────────────────┤
│  [ OK ]  [ Cancel ]      │
└──────────────────────────┘
```

### 4B: System Properties Opens

```
┌─────────────────────────────────────┐
│  System Properties                  │
├─────────────────────────────────────┤
│  [Computer Name] [Hardware] ...     │
│                                     │
│  [  Advanced  ]  ← YOU'RE HERE      │
│                                     │
│  Performance: [Settings...]         │
│  User Profiles: [Settings...]       │
│  Startup and Recovery: [Settings...]│
│                                     │
│  Environment Variables...  ← CLICK  │
│                                     │
│       [ OK ]  [ Cancel ]            │
└─────────────────────────────────────┘
```

### 4C: Environment Variables Opens

```
┌─────────────────────────────────────────────┐
│  Environment Variables                      │
├─────────────────────────────────────────────┤
│  User variables for pchik                   │
│  ┌─────────────────────────────────────┐   │
│  │ Variable      Value                 │   │
│  ├─────────────────────────────────────┤   │
│  │ TEMP          C:\Users\...\Temp     │   │
│  │ Path          C:\Users\...\bin      │ ← FIND THIS
│  │ OneDrive      C:\Users\...\OneDrive │   │
│  └─────────────────────────────────────┘   │
│     [ New ]  [ Edit... ]  [ Delete ]  ← CLICK EDIT
│                                             │
│  System variables                           │
│  ┌─────────────────────────────────────┐   │
│  │ ...                                 │   │
│  └─────────────────────────────────────┘   │
│                                             │
│       [ OK ]  [ Cancel ]                    │
└─────────────────────────────────────────────┘
```

### 4D: Edit Path Variable

Click on "Path" → Click "Edit..."

```
┌─────────────────────────────────────────────┐
│  Edit environment variable                  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ C:\Users\pchik\AppData\Local\...    │   │
│  │ C:\Program Files\nodejs\            │   │
│  │ C:\Users\pchik\.npm-packages\       │   │
│  │ [                                   ] ← NEW LINE APPEARS
│  └─────────────────────────────────────┘   │
│                                             │
│  [ New ]  [ Edit ]  [ Delete ] ← CLICK NEW │
│  [ Browse... ]  [ Move Up ]  [ Move Down ] │
│                                             │
│       [ OK ]  [ Cancel ]                    │
└─────────────────────────────────────────────┘
```

### 4E: Add Supabase Path

After clicking "New", a blank line appears. Type:
```
C:\Program Files\Supabase\
```

**Important:** Include the backslash `\` at the end!

```
┌─────────────────────────────────────────────┐
│  Edit environment variable                  │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ C:\Users\pchik\AppData\Local\...    │   │
│  │ C:\Program Files\nodejs\            │   │
│  │ C:\Program Files\Supabase\          │ ← YOUR NEW LINE
│  └─────────────────────────────────────┘   │
│                                             │
│       [ OK ]  [ Cancel ]     ← CLICK OK     │
└─────────────────────────────────────────────┘
```

### 4F: Save Everything

Click **OK** three times:
1. OK on "Edit environment variable"
2. OK on "Environment Variables"
3. OK on "System Properties"

---

## STEP 5️⃣: Restart PowerShell & Test

### 5A: Close ALL PowerShell Windows

**Critical:** Close every PowerShell/Command Prompt window you have open.

```
[X] ← CLOSE ALL OF THESE
```

### 5B: Open NEW PowerShell

Press `Windows Key` → Type `powershell` → Press Enter

### 5C: Test Installation

Type:
```powershell
supabase --version
```

**✅ SUCCESS:**
```
1.200.3
```

**❌ ERROR:**
```
supabase : The term 'supabase' is not recognized...
```

If you get an error:
1. Double-check file exists: `C:\Program Files\Supabase\supabase.exe`
2. Double-check PATH includes: `C:\Program Files\Supabase\`
3. Try restarting your computer

---

## STEP 6️⃣: Deploy Edge Function

Now the fun part! Deploy your Twitter scanner:

```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
.\deploy-edge-function.ps1
```

**What happens:**

```
1. Login to Supabase → Browser opens → Login → Close browser
2. Link project → Enter database password
3. Set Twitter token → Done
4. Deploy function → Uploading... → ✅ Success!
```

---

## STEP 7️⃣: Test Your App

```powershell
# Stop dev server (if running)
Ctrl + C

# Restart it
npm start
```

**In browser:**
1. Go to **Social Leads** page
2. Click **"Scan for New Leads"**
3. Open Console (F12)

**You should see:**
```
🐦 Starting Twitter scan via Edge Function...
🌐 Edge Function URL: https://...
📡 Calling Edge Function...
📊 Response status: 200 OK
🎯 Found 15 leads from Edge Function
✅ Twitter scan complete: 15 leads
```

**And real tweets appear in your table!** 🎉

---

## 🎯 Quick Troubleshooting

### Problem: "supabase not recognized"
**Solution:** Close PowerShell, open new one, try again

### Problem: "Access denied" creating folder
**Solution:** Use `C:\Users\pchik\Supabase\` instead, update PATH accordingly

### Problem: Still getting CORS errors
**Solution:** 
1. Make sure function deployed: `supabase functions list`
2. Hard refresh browser: `Ctrl+Shift+R`
3. Restart dev server

---

## 📁 File Structure Check

After everything is done, verify these exist:

```
✅ C:\Program Files\Supabase\supabase.exe
✅ PATH includes: C:\Program Files\Supabase\

✅ Project files:
   c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket\
   ├── supabase\
   │   └── functions\
   │       └── scan-twitter\
   │           └── index.ts  ← Edge Function code
   ├── src\
   │   └── services\
   │       └── socialMediaService.ts  ← Updated to call Edge Function
   └── deploy-edge-function.ps1  ← Deployment script
```

---

## 🎉 You're Done!

```
✅ Supabase CLI installed manually
✅ Added to PATH
✅ Edge Function deployed
✅ CORS error fixed
✅ Real Twitter data working
✅ Production-ready app!
```

**Need help with a specific step?** Check the detailed guide: `INSTALL_SUPABASE_MANUAL_GUIDE.md`

---

**Remember:** The only reason we're doing this is because `npm install -g supabase` doesn't work anymore. This manual method is 100% reliable and takes about 5 minutes! 🚀
