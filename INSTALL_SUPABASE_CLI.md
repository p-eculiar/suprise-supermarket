# 📦 Install Supabase CLI on Windows

## ⚠️ Important Note

**NPM installation is NOT supported!** The error you saw is because Supabase CLI can no longer be installed via `npm install -g supabase`.

You must use one of these methods instead:

---

## ✅ Option 1: Using Scoop (Easiest - Recommended)

### Step 1: Run the Installation Script

**Right-click PowerShell → Run as Administrator**, then:

```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
.\install-supabase-cli.ps1
```

This will:
1. Install Scoop (if not installed)
2. Add Supabase bucket to Scoop
3. Install Supabase CLI
4. Verify installation

### Step 2: Close and Reopen PowerShell

After installation, **close PowerShell completely** and open a new window to refresh environment variables.

### Step 3: Verify Installation

```powershell
supabase --version
```

You should see something like: `1.x.x`

---

## ✅ Option 2: Direct Download (If Scoop Fails)

### Step 1: Download Supabase CLI

1. Go to: https://github.com/supabase/cli/releases
2. Download the **latest Windows version**: `supabase_windows_amd64.zip`
3. Extract the ZIP file

### Step 2: Move to Program Files

1. Create folder: `C:\Program Files\Supabase\`
2. Move `supabase.exe` into that folder

### Step 3: Add to PATH

1. Press `Windows + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Environment Variables"
4. Under "User variables", select "Path" and click "Edit"
5. Click "New"
6. Add: `C:\Program Files\Supabase\`
7. Click "OK" on all dialogs

### Step 4: Verify Installation

**Open a NEW PowerShell window** and run:

```powershell
supabase --version
```

---

## ✅ Option 3: Using Winget (Windows 11)

If you have Windows 11 with Winget:

```powershell
winget install Supabase.cli
```

Then restart PowerShell and verify:

```powershell
supabase --version
```

---

## 🚀 After Installation

Once Supabase CLI is installed, run the deployment script:

```powershell
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
.\deploy-edge-function.ps1
```

This will:
1. Login to Supabase
2. Link your project
3. Set Twitter API token
4. Deploy the Edge Function
5. Fix the CORS error!

---

## 🔍 Troubleshooting

### "scoop: command not found" after running install script

**Solution:** Close PowerShell completely and open a new window as Administrator.

### Scoop installation fails with "Execution Policy" error

**Solution:** Run this first:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

Then try again.

### Direct download: "supabase: command not found" after adding to PATH

**Solution:** 
1. Make sure you opened a **NEW** PowerShell window after editing PATH
2. Verify the path is correct: `C:\Program Files\Supabase\supabase.exe` should exist
3. Check PATH contains: `C:\Program Files\Supabase\` (no `supabase.exe` at the end)

### Permission errors during installation

**Solution:** Run PowerShell **as Administrator**:
1. Right-click PowerShell
2. Select "Run as Administrator"
3. Try installation again

---

## 📋 Quick Reference

### After CLI is installed, these are the deployment commands:

```powershell
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref awepkphahdheqomgucby

# Set Twitter token
supabase secrets set TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAALEPW4AEAAAA%2FqCizbMg%2FgDW7Xez25IZVuBqBqOg%3D6YUWJjcQdQWa1g3PNQlFRYr1BZJgcEWQnwGI54DvQO96LzrBLQ"

# Deploy Edge Function
supabase functions deploy scan-twitter

# View logs
supabase functions logs scan-twitter
```

Or just run the automated script:

```powershell
.\deploy-edge-function.ps1
```

---

## 🎯 Success Checklist

- [ ] Supabase CLI installed (any method)
- [ ] PowerShell restarted after installation
- [ ] `supabase --version` works
- [ ] Ready to run `.\deploy-edge-function.ps1`

---

**Why the change?**

Supabase CLI is written in Go (not JavaScript), so they moved away from npm to native installers for better performance and reliability.
