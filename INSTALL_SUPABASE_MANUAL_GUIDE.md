# 📦 Install Supabase CLI - Manual Download Method (Step-by-Step)

This is the most reliable method for Windows when other installers don't work.

---

## 📥 STEP 1: Download Supabase CLI

### 1.1 Open the Releases Page

Open your browser and go to:
```
https://github.com/supabase/cli/releases
```

### 1.2 Find the Latest Release

- Look for the **latest version** at the top (e.g., `v1.200.3`)
- Scroll down to the "Assets" section

### 1.3 Download Windows Version

Look for a file named something like:
```
supabase_windows_amd64.zip
```

**Example file names (version number may vary):**
- `supabase_1.200.3_windows_amd64.zip`
- `supabase_windows_x64.zip`

Click on it to download. It should be around **20-30 MB**.

**⚠️ Important:** Make sure you download the **Windows AMD64** version (works on all modern Windows PCs, both Intel and AMD processors).

---

## 📂 STEP 2: Extract the ZIP File

### 2.1 Locate the Downloaded File

The file should be in your `Downloads` folder:
```
C:\Users\pchik\Downloads\supabase_windows_amd64.zip
```

### 2.2 Extract the ZIP

**Method 1 (Right-click):**
1. Right-click the ZIP file
2. Select "Extract All..."
3. Click "Extract"

**Method 2 (Double-click):**
1. Double-click the ZIP file to open it
2. You'll see a file called `supabase.exe` inside
3. Copy this file (Ctrl+C)

### 2.3 What You Should See

After extraction, you should have a file called:
```
supabase.exe
```

This is the Supabase CLI program. It's a single executable file, no installation needed!

---

## 📁 STEP 3: Create Supabase Folder and Move the File

### 3.1 Open File Explorer

Press `Windows Key + E` to open File Explorer

### 3.2 Navigate to Program Files

In the address bar, type or paste:
```
C:\Program Files
```

Press Enter.

### 3.3 Create "Supabase" Folder

1. Right-click in the empty space
2. Select **New → Folder**
3. Name it: `Supabase` (capital S)

**Full path should be:**
```
C:\Program Files\Supabase\
```

**⚠️ Note:** You might see a UAC prompt asking for Administrator permission. Click **"Yes"** or **"Continue"**.

### 3.4 Move supabase.exe into the Folder

1. Go back to where you extracted the file (probably `Downloads`)
2. Find `supabase.exe`
3. Right-click → **Cut** (or press Ctrl+X)
4. Navigate to `C:\Program Files\Supabase\`
5. Right-click → **Paste** (or press Ctrl+V)

**Final result:**
```
C:\Program Files\Supabase\supabase.exe
```

---

## 🔧 STEP 4: Add to PATH Environment Variable

This step tells Windows where to find the `supabase` command.

### 4.1 Open System Properties

**Method 1 (Fastest):**
1. Press `Windows Key + R` (opens Run dialog)
2. Type: `sysdm.cpl`
3. Press Enter

**Method 2 (Using Settings):**
1. Press `Windows Key`
2. Type: "environment variables"
3. Click "Edit the system environment variables"

### 4.2 Open Environment Variables

1. You should see "System Properties" window
2. Click the **"Environment Variables..."** button at the bottom

### 4.3 Edit the PATH Variable

**In the "Environment Variables" window:**

1. Look at the **top section** called "User variables for pchik"
2. Find the variable named **"Path"** (might be just "PATH" or "Path")
3. Click on it to select it
4. Click the **"Edit..."** button

### 4.4 Add Supabase Directory

**In the "Edit environment variable" window:**

1. Click the **"New"** button (top right)
2. A new line will appear
3. Type or paste: `C:\Program Files\Supabase\`
4. Press Enter

**⚠️ Important Notes:**
- Include the backslash `\` at the end
- Do NOT include `supabase.exe` in the path
- Just the folder: `C:\Program Files\Supabase\`

### 4.5 Save Everything

1. Click **"OK"** on the "Edit environment variable" window
2. Click **"OK"** on the "Environment Variables" window
3. Click **"OK"** on the "System Properties" window

**All done!** You've added Supabase to your PATH.

---

## ✅ STEP 5: Verify Installation

### 5.1 Close ALL PowerShell Windows

**⚠️ CRITICAL:** You MUST close all existing PowerShell/Command Prompt windows for PATH changes to take effect.

### 5.2 Open a NEW PowerShell

1. Press `Windows Key`
2. Type: `powershell`
3. Press Enter (or click Windows PowerShell)

### 5.3 Test the Installation

In the new PowerShell window, type:

```powershell
supabase --version
```

Press Enter.

**✅ SUCCESS:** You should see something like:
```
1.200.3
```

**❌ ERROR:** If you see `supabase : The term 'supabase' is not recognized...`:
- Make sure you **closed and reopened** PowerShell
- Verify `supabase.exe` exists at: `C:\Program Files\Supabase\supabase.exe`
- Check PATH includes: `C:\Program Files\Supabase\` (open Environment Variables again)
- Restart your computer if still not working

### 5.4 Additional Test

Try this command:

```powershell
supabase help
```

You should see a list of available commands like:
```
Supabase CLI

Usage:
  supabase [command]

Available Commands:
  db          Manage database
  functions   Manage Supabase Edge Functions
  login       Log in to Supabase
  ...
```

---

## 🚀 STEP 6: Deploy the Edge Function

Now that Supabase CLI is installed, let's deploy your Twitter Edge Function!

### 6.1 Navigate to Your Project

```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
```

### 6.2 Run the Deployment Script

```powershell
.\deploy-edge-function.ps1
```

**What will happen:**

1. **Login Prompt:** A browser window will open
   - Login with your Supabase account (same email/password you use for the dashboard)
   - After login, you can close the browser
   - PowerShell will confirm: "Logged in successfully"

2. **Project Linking:** 
   - Script will link to your project: `awepkphahdheqomgucby`
   - You might be asked for your database password (the one you set when creating the Supabase project)

3. **Setting Secret:**
   - Your Twitter Bearer Token will be uploaded as a secret
   - You'll see: "Secret set successfully"

4. **Deploying Function:**
   - The Edge Function code will be uploaded
   - You'll see progress bars
   - Final message: "✅ Deployment Successful!"

5. **Success Message:**
   ```
   Edge Function is now live at:
   https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter
   ```

---

## 🎯 STEP 7: Test It Works

### 7.1 Stop Your Dev Server

If your React dev server is running, press `Ctrl+C` to stop it.

### 7.2 Clear Browser Cache

1. Open your browser with the app (http://localhost:3001)
2. Press `F12` to open DevTools
3. Right-click the **Refresh button** in your browser
4. Select **"Empty Cache and Hard Reload"**

Or just press `Ctrl+Shift+R` (hard refresh)

### 7.3 Restart Dev Server

```powershell
npm start
```

Wait for it to open in the browser.

### 7.4 Test the Scan

1. Go to **Admin Dashboard** → **Social Leads**
2. Click **"Scan for New Leads"** button
3. Open browser console (F12)

### 7.5 Check Console Output

**✅ SUCCESS - You should see:**
```
✨ SocialLeadsApi: Starting social media scan...
🚀 Starting scan of all platforms...
🐦 Starting Twitter scan via Edge Function...
🌐 Edge Function URL: https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter
📡 Calling Edge Function...
⏱️ Request completed in 3000ms
📊 Response status: 200 OK
✅ Edge Function response received
🎯 Found 15 leads from Edge Function
✅ Twitter scan complete: 15 leads
```

**❌ NO MORE CORS ERRORS!**

### 7.6 Check the Results

- Toast notification: **"Successfully scanned X new leads"**
- Social Leads table shows **real tweets** from Twitter
- Tweets about "need groceries", "bulk buying", "grocery delivery", etc.
- Each lead has:
  - Platform: Twitter
  - Author name and handle
  - Tweet content
  - Matched keywords
  - Sentiment (urgent/positive/neutral)
  - Status: new

---

## 🎉 SUCCESS!

You've successfully:
- ✅ Installed Supabase CLI manually
- ✅ Deployed the Edge Function to Supabase
- ✅ Fixed the CORS error
- ✅ Integrated real Twitter API data
- ✅ Your app now uses real-world data, not hardcoded samples!

---

## 🔍 Troubleshooting

### "supabase: command not found" after following all steps

**Possible causes:**

1. **PowerShell not restarted**
   - Close ALL PowerShell windows
   - Open a NEW one
   - Try again

2. **Wrong PATH**
   - Open Environment Variables again
   - Check if `C:\Program Files\Supabase\` is in the Path
   - Make sure there's a backslash `\` at the end
   - Save and restart PowerShell

3. **File in wrong location**
   - Check: `C:\Program Files\Supabase\supabase.exe` exists
   - If not, move the file there

4. **Need to restart computer**
   - Sometimes Windows needs a full restart for PATH changes
   - Restart and try again

### "Access Denied" when creating folder in Program Files

**Solution:**
- Use `C:\Users\pchik\Supabase\` instead
- Add `C:\Users\pchik\Supabase\` to PATH
- Everything else is the same

### Edge Function deployment fails with "Not logged in"

**Solution:**
```powershell
supabase login
```

Browser will open → Login → Close browser → Try again

### Edge Function deployment fails with "Project not found"

**Solution:**
```powershell
supabase link --project-ref awepkphahdheqomgucby
```

Enter your database password when asked.

### Still getting CORS errors after deployment

**Checklist:**
- [ ] Edge Function deployed successfully
- [ ] Dev server stopped and restarted
- [ ] Browser cache cleared (hard refresh)
- [ ] Check console shows "Edge Function URL" (not "api.twitter.com")

---

## 📞 Quick Reference Commands

After installation, useful commands:

```powershell
# Check version
supabase --version

# Login
supabase login

# Link project
supabase link --project-ref awepkphahdheqomgucby

# List functions
supabase functions list

# Deploy function
supabase functions deploy scan-twitter

# View logs (for debugging)
supabase functions logs scan-twitter

# List secrets
supabase secrets list

# Set secret
supabase secrets set SECRET_NAME="value"
```

---

## 🎯 Visual Checklist

**Installation:**
- [ ] Downloaded `supabase_windows_amd64.zip`
- [ ] Extracted `supabase.exe`
- [ ] Created `C:\Program Files\Supabase\` folder
- [ ] Moved `supabase.exe` to that folder
- [ ] Opened System Properties (`Windows+R` → `sysdm.cpl`)
- [ ] Clicked "Environment Variables"
- [ ] Edited "Path" under User variables
- [ ] Added `C:\Program Files\Supabase\` (with backslash)
- [ ] Clicked OK on all dialogs
- [ ] Closed ALL PowerShell windows
- [ ] Opened NEW PowerShell
- [ ] Ran `supabase --version` (works!)

**Deployment:**
- [ ] Ran `.\deploy-edge-function.ps1`
- [ ] Logged in to Supabase
- [ ] Function deployed successfully
- [ ] Stopped dev server
- [ ] Cleared browser cache
- [ ] Restarted dev server
- [ ] Tested scan
- [ ] Seeing real Twitter data
- [ ] No CORS errors!

---

**You got this! Follow each step carefully and it will work. Let me know which step you're on if you get stuck!** 🚀
