# Suprise Supermarket - Complete Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- Git

## Step 1: Clone and Install

```bash
cd "c:\Users\pchik\OneDrive\Desktop\suprise supermarket\suprise-supermarket"
npm install
```

## Step 2: Install Additional Dependencies

The admin dashboard requires these packages:

```bash
npm install @supabase/supabase-js
npm install framer-motion
npm install react-query
npm install @hookform/resolvers zod
```

## Step 3: Supabase Setup

### 3.1 Create Supabase Project

1. Go to https://supabase.com
2. Click "New Project"
3. Fill in project details:
   - Name: Suprise Supermarket
   - Database Password: (save this securely)
   - Region: Choose closest to Nigeria (e.g., eu-west-1)

### 3.2 Run Database Schema

1. In Supabase dashboard, go to SQL Editor
2. Copy the entire content from `/supabase/schema.sql`
3. Paste and click "Run"
4. Verify tables are created in Table Editor

### 3.3 Create Storage Bucket

1. Go to Storage in Supabase dashboard
2. Create new bucket: `product-images`
3. Make it public
4. Set up CORS if needed

### 3.4 Get API Keys

1. Go to Settings > API
2. Copy your:
   - Project URL
   - anon/public key

## Step 4: Environment Configuration

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=Suprise Supermarket
```

## Step 5: Create Admin User

### Option A: Through Supabase Dashboard

1. Go to Authentication > Users
2. Click "Add user"
3. Enter:
   - Email: admin@suprisesuper.com
   - Password: your-secure-password
   - Auto Confirm: ✓

4. Go to Table Editor > users
5. Find the user you just created
6. Edit the row and set:
   - `role`: admin
   - `status`: active
   - `name`: Admin User

### Option B: Through SQL

```sql
-- Insert admin user (after creating through Authentication)
INSERT INTO users (id, email, name, role, status)
VALUES (
  'auth-user-id-from-auth-users-table',
  'admin@suprisesuper.com',
  'Admin User',
  'admin',
  'active'
);
```

## Step 6: Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Step 7: Access Admin Dashboard

1. Open browser to `http://localhost:5173`
2. Click "Sign In"
3. Use admin credentials:
   - Email: admin@suprisesuper.com
   - Password: (password you set)
4. Navigate to `/admin` or click admin link

## Step 8: Verify Features

### Test Dashboard:
- ✓ Dashboard displays statistics
- ✓ Recent orders shown
- ✓ Top products visible

### Test Products:
- ✓ Navigate to Products
- ✓ Click "Add New Product"
- ✓ Fill form and upload image
- ✓ Save product

### Test Nigeria Analytics:
- ✓ Navigate to "Nigeria Analytics"
- ✓ View state-by-state data
- ✓ Check product recommendations
- ✓ Verify insights display

## Troubleshooting

### Issue: "Invalid API Key"
**Solution:** Double-check `.env` file has correct Supabase credentials

### Issue: "RLS policy error"
**Solution:** Ensure Row Level Security policies are created (check schema.sql)

### Issue: Admin user can't access admin pages
**Solution:** Verify user role is set to 'admin' in users table

### Issue: Images not uploading
**Solution:** Check storage bucket is public and CORS is configured

### Issue: Data not loading
**Solution:** 
1. Check browser console for errors
2. Verify Supabase tables exist
3. Check RLS policies allow access

## Development Tips

### Hot Module Replacement
The dev server supports HMR, so changes appear instantly.

### Database Inspection
Use Supabase Table Editor to view and edit data directly.

### API Testing
Test Supabase queries in the SQL Editor before implementing.

### Styling
All admin pages use styled-components with the green color scheme (#6C9A7F).

## Production Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

Add environment variables in Netlify dashboard.

## Security Checklist

- [ ] Change default admin password
- [ ] Enable 2FA for admin accounts
- [ ] Review RLS policies
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable HTTPS in production
- [ ] Rotate API keys regularly
- [ ] Monitor suspicious activities

## Performance Optimization

- [ ] Enable caching
- [ ] Optimize images
- [ ] Lazy load components
- [ ] Use React Query for data fetching
- [ ] Implement pagination
- [ ] Add loading states
- [ ] Compress assets

## Next Steps

1. **Customize branding** - Update logo and colors
2. **Add real products** - Populate product catalog
3. **Configure payment** - Set up Stripe/PayPal
4. **Test user flows** - Register customers and place orders
5. **Enable analytics** - Connect Google Analytics
6. **Set up monitoring** - Add error tracking (Sentry)

## Getting Help

- Check README_ADMIN.md for feature documentation
- Review Supabase docs: https://supabase.com/docs
- React Router docs: https://reactrouter.com
- Styled Components: https://styled-components.com

## Backup Strategy

### Database Backups
Supabase automatically backs up your database. For manual backups:

1. Go to Database > Backups
2. Download backup
3. Store securely

### Code Backups
Push to Git regularly:

```bash
git add .
git commit -m "Update"
git push origin main
```

## Monitoring

### Check Application Health:
- Supabase Dashboard > Reports
- Monitor API usage
- Check error logs
- Review slow queries

### Analytics:
- Track user engagement
- Monitor conversion rates
- Analyze product performance
- Review state analytics trends

## Success! 🎉

Your admin dashboard is now ready. You can:
- ✅ Manage products
- ✅ Track orders
- ✅ Monitor users
- ✅ View Nigeria analytics
- ✅ Configure settings
- ✅ Generate insights

Happy administrating! 🚀
