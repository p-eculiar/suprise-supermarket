# Deployment Instructions

## Prerequisites
- Node.js (version 14 or higher)
- npm (version 6 or higher)

## Build Process
1. Navigate to the project root directory:
   ```
   cd suprise-supermarket
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the application:
   ```
   npm run build
   ```

4. The built files will be available in the `build` directory

## Deployment Options

### Option 1: Static Server
1. Install serve globally:
   ```
   npm install -g serve
   ```

2. Serve the build directory:
   ```
   serve -s build
   ```

### Option 2: Deploy to Hosting Platform
- Copy the contents of the `build` directory to your hosting platform
- Ensure the hosting platform is configured to serve `index.html` for all routes (client-side routing)

## Environment Variables
Make sure to set the following environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY
- REACT_APP_ADMIN_EMAIL_1 (optional)
- REACT_APP_ADMIN_EMAIL_2 (optional)

## Testing the Navigation Fix
1. Navigate to the home page
2. Go to either the admin dashboard or user dashboard
3. Navigate back to the home page
4. Verify that products load correctly
5. Repeat the process to ensure consistent behavior

## Troubleshooting
If products don't load properly:
1. Check browser console for errors
2. Verify Supabase connection
3. Ensure environment variables are set correctly
4. Clear browser cache and refresh