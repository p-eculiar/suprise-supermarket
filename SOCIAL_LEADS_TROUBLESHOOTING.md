# Social Leads Feature Troubleshooting Guide

## Common Issues and Solutions

### 1. "No leads found" Message

This is the most common issue and can have several causes:

#### a) Twitter API Token Not Configured
- Check that `REACT_APP_TWITTER_BEARER_TOKEN` is set in your `.env` file
- Verify the token is valid and has the correct permissions
- Restart your development server after adding the token

#### b) No Matching Social Media Posts
- The keywords being searched might not have any recent matches
- Try searching for the keywords manually on Twitter to verify they return results
- Consider adjusting the keywords in `socialMediaService.ts`

#### c) Database Issues
- Ensure the `social_leads` table exists in your database
- Run the `CREATE_MISSING_TABLES.sql` script to create the table
- Check that your Supabase connection is working correctly

#### d) Rate Limiting
- Twitter API has rate limits that might prevent results
- Wait before trying again if you've made many requests recently

### 2. Checking the Twitter API Integration

#### a) Verify Environment Variables
Check your `.env` file for:
```
REACT_APP_TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
```

#### b) Test the API Directly
You can test the Twitter API integration by:
1. Opening your browser's developer tools
2. Going to the Network tab
3. Clicking "Scan for New Leads" on the Social Leads page
4. Checking for any error messages in the console

### 3. Database Setup

#### a) Create the Required Table
Run the `CREATE_MISSING_TABLES.sql` script to ensure the `social_leads` table exists:
```sql
create table if not exists social_leads (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  author_name text not null,
  author_handle text,
  post_content text not null,
  post_url text,
  contact_info text,
  keywords_matched text[],
  sentiment text not null default 'neutral',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### b) Verify Table Access
Ensure your Supabase RLS policies allow admin access to the table:
```sql
-- Only admins can read and manage social leads
create policy "social_leads read admin" on social_leads for select to authenticated using (true);
create policy "social_leads crud admin" on social_leads for all to authenticated using (true) with check (true);
```

### 4. Testing the Feature

#### a) Manual Test
1. Navigate to the Social Leads page in the admin dashboard
2. Click "Scan for New Leads"
3. Check for success or error messages
4. If successful but no leads found, check the troubleshooting tips above

#### b) Console Debugging
1. Open your browser's developer tools
2. Go to the Console tab
3. Click "Scan for New Leads"
4. Look for log messages that indicate what's happening

### 5. Keyword Optimization

The default keywords in `socialMediaService.ts` might not be finding relevant posts:
```typescript
const KEYWORDS = [
  'need groceries',
  'buy vegetables',
  'fresh fruits',
  'grocery delivery',
  'need food',
  'supermarket near me',
  'bulk buying',
  'corporate catering',
  'office supplies food',
];
```

Consider adding or modifying these keywords based on your target audience.

### 6. Error Handling

The system now provides better error messages:
- Check alert messages for specific error information
- Look in the browser console for detailed error logs
- Verify network requests in the Network tab

## Next Steps

If you're still experiencing issues:

1. Check the browser console for specific error messages
2. Verify your Twitter API token is valid
3. Ensure the `social_leads` table exists in your database
4. Try searching for the keywords manually on Twitter
5. Contact support if the issue persists