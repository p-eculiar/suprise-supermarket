@echo off
echo ========================================
echo   Twitter Scan Edge Function Deployer
echo ========================================
echo.

echo Step 1: Setting Twitter API Token as Secret...
echo.
supabase secrets set TWITTER_BEARER_TOKEN="AAAAAAAAAAAAAAAAAAAAALEPW4AEAAAA%%2FqCizbMg%%2FgDW7Xez25IZVuBqBqOg%%3D6YUWJjcQdQWa1g3PNQlFRYr1BZJgcEWQnwGI54DvQO96LzrBLQ"

echo.
echo Step 2: Deploying Edge Function...
echo.
supabase functions deploy scan-twitter

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Stop your dev server (Ctrl+C)
echo 2. Clear browser cache (Ctrl+Shift+R)
echo 3. Restart dev server: npm start
echo 4. Test the scan on Social Leads page
echo.
pause
