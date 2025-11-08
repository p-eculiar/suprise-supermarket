# Fix Twitter Bearer Token in Supabase Secrets
# The token in .env is URL-encoded, we need to decode it

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Twitter API Token" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# URL-encoded token from .env
$encodedToken = "AAAAAAAAAAAAAAAAAAAAALEP4wEAAAAArAkb%2BBYtalxh2F2MGJoeCf22RPs%3D0OvwOeKisQEE6emT2PfB81y57HJovjTmK2vShWX6z24i2VXsFD"

# Decode the token
$decodedToken = [System.Web.HttpUtility]::UrlDecode($encodedToken)

Write-Host "Original (URL-encoded):" -ForegroundColor Yellow
Write-Host $encodedToken -ForegroundColor Gray
Write-Host ""
Write-Host "Decoded (correct format):" -ForegroundColor Yellow
Write-Host $decodedToken -ForegroundColor Gray
Write-Host ""

Write-Host "Setting correct token in Supabase secrets..." -ForegroundColor Yellow

# Set the decoded token
supabase secrets set TWITTER_BEARER_TOKEN="$decodedToken"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Token Updated Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Go back to your browser" -ForegroundColor White
    Write-Host "2. Click 'Scan for New Leads' again" -ForegroundColor White
    Write-Host "3. You should now see real Twitter data! 🎉" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Failed to set token" -ForegroundColor Red
    Write-Host "Make sure you're logged in: supabase login" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
