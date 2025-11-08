# Install Supabase CLI on Windows
# This script will install Scoop (if needed) and then install Supabase CLI

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Supabase CLI Installer for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Scoop is installed
Write-Host "Checking if Scoop is installed..." -ForegroundColor Yellow
try {
    $scoopVersion = scoop --version
    Write-Host "✅ Scoop is already installed: $scoopVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Scoop not found. Installing Scoop first..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This requires Administrator privileges." -ForegroundColor Red
    Write-Host "Please run this script as Administrator if it fails." -ForegroundColor Red
    Write-Host ""
    
    try {
        # Set execution policy
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        
        # Install Scoop
        Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
        
        Write-Host "✅ Scoop installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install Scoop" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please try Option 2: Direct Download" -ForegroundColor Yellow
        Write-Host "See: INSTALL_SUPABASE_CLI.md" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "Installing Supabase CLI via Scoop..." -ForegroundColor Yellow

try {
    # Add Supabase bucket
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    
    # Install Supabase CLI
    scoop install supabase
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ✅ Installation Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Verify installation
    $supabaseVersion = supabase --version
    Write-Host "Supabase CLI Version: $supabaseVersion" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Close and reopen PowerShell (to refresh environment)" -ForegroundColor White
    Write-Host "2. Run: .\deploy-edge-function.ps1" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Installation failed" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Download directly from GitHub" -ForegroundColor Yellow
    Write-Host "URL: https://github.com/supabase/cli/releases" -ForegroundColor White
    Write-Host "See INSTALL_SUPABASE_CLI.md for instructions" -ForegroundColor White
    exit 1
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
