# Test Twitter Bearer Token
Write-Host "Testing Twitter API Bearer Token..." -ForegroundColor Cyan
Write-Host ""

# Decoded token
$token = "AAAAAAAAAAAAAAAAAAAAALEP4wEAAAAArAkb+BYtalxh2F2MGJoeCf22RPs=0OvwOeKisQEE6emT2PfB81y57HJovjTmK2vShWX6z24i2VXsFD"

Write-Host "Token being tested:" -ForegroundColor Yellow
Write-Host "$token" -ForegroundColor Gray
Write-Host ""

# Test endpoint - Twitter API v2 user lookup (simple test)
$testUrl = "https://api.twitter.com/2/users/me"

Write-Host "Calling Twitter API..." -ForegroundColor Yellow

try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get -ErrorAction Stop
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Token is VALID!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response from Twitter:" -ForegroundColor Cyan
    Write-Host ($response | ConvertTo-Json) -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = ""
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   ❌ Token is INVALID!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
    Write-Host "Error Response:" -ForegroundColor Yellow
    Write-Host $errorBody -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Cyan
    Write-Host "1. Go to: https://developer.twitter.com/en/portal/dashboard" -ForegroundColor White
    Write-Host "2. Select your app/project" -ForegroundColor White
    Write-Host "3. Go to 'Keys and tokens' tab" -ForegroundColor White
    Write-Host "4. Regenerate 'Bearer Token'" -ForegroundColor White
    Write-Host "5. Copy the new token" -ForegroundColor White
    Write-Host "6. Update .env file with new token" -ForegroundColor White
    Write-Host "7. Run: supabase secrets set TWITTER_BEARER_TOKEN=`"new-token`"" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
