# Twitter Scan Edge Function Deployment Script
# Run this in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Twitter Scan Edge Function Deployer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is installed
Write-Host "Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $version = supabase --version
    Write-Host "✅ Supabase CLI installed: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found!" -ForegroundColor Red
    Write-Host "Please install it first:" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host "Or see DEPLOY_EDGE_FUNCTION_NOW.md for full instructions" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Step 1: Checking if logged in to Supabase..." -ForegroundColor Yellow
try {
    supabase projects list
    Write-Host "✅ Logged in successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Not logged in. Running 'supabase login'..." -ForegroundColor Yellow
    supabase login
}

Write-Host ""
Write-Host "Step 2: Setting Twitter API Token as Secret..." -ForegroundColor Yellow
$token = "AAAAAAAAAAAAAAAAAAAAALEPW4AEAAAA%2FqCizbMg%2FgDW7Xez25IZVuBqBqOg%3D6YUWJjcQdQWa1g3PNQlFRYr1BZJgcEWQnwGI54DvQO96LzrBLQ"
supabase secrets set TWITTER_BEARER_TOKEN="$token"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Secret set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set secret" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Deploying Edge Function to Supabase..." -ForegroundColor Yellow
supabase functions deploy scan-twitter

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Edge Function is now live at:" -ForegroundColor Cyan
    Write-Host "https://awepkphahdheqomgucby.supabase.co/functions/v1/scan-twitter" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Stop your dev server (Ctrl+C in the terminal running npm start)" -ForegroundColor White
    Write-Host "2. Clear browser cache:" -ForegroundColor White
    Write-Host "   - Open DevTools (F12)" -ForegroundColor White
    Write-Host "   - Right-click refresh → 'Empty Cache and Hard Reload'" -ForegroundColor White
    Write-Host "3. Restart dev server: npm start" -ForegroundColor White
    Write-Host "4. Go to Social Leads page and click 'Scan for New Leads'" -ForegroundColor White
    Write-Host ""
    Write-Host "You should see real Twitter data with NO CORS errors! 🎉" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment Failed" -ForegroundColor Red
    Write-Host "Check the error message above and:" -ForegroundColor Yellow
    Write-Host "1. Make sure you're linked to the project: supabase link --project-ref awepkphahdheqomgucby" -ForegroundColor White
    Write-Host "2. Check DEPLOY_EDGE_FUNCTION_NOW.md for troubleshooting" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
