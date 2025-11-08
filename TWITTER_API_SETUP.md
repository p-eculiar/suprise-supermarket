# Twitter API Setup for Social Leads Feature

This document explains how to set up the Twitter API integration for the Social Leads feature in the admin dashboard.

## Current Implementation

The Social Leads page ([src/pages/admin/SocialLeads.tsx](file:///c%3A/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/src/pages/admin/SocialLeads.tsx)) is already implemented and working for displaying social leads. However, the actual scanning functionality that would connect to Twitter API is currently simulated.

## Twitter API Integration

### 1. Current State

The application already has a Twitter Bearer Token in the [.env](file:///c%3A/Users/pchik/OneDrive/Desktop/suprise%20supermarket/suprise-supermarket/.env) file:
```
REACT_APP_TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAALEP4wEAAAAArAkb%2BBYtalxh2F2MGJoeCf22RPs%3D0OvwOeKisQEE6emT2PfB81y57HJovjTmK2vShWX6z24i2VXsFD
```

### 2. How Social Leads Feature Works

The Social Leads feature is designed to:
1. Scan social media platforms (Twitter, Facebook, Instagram, WhatsApp) for posts containing keywords related to groceries
2. Store these leads in the `social_leads` database table
3. Allow admins to view, categorize, and contact potential customers

### 3. Current Limitations

The "Scan for New Leads" button currently simulates the scanning process:
```typescript
// In SocialLeads.tsx
const handleScanLeads = async () => {
  setIsScanning(true);
  
  try {
    // This would typically call a backend API that scrapes social media
    // For now, we'll simulate it
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, you would call:
    // const response = await fetch('/api/scan-social-leads', { method: 'POST' });
    // const newLeads = await response.json();
    
    queryClient.invalidateQueries({ queryKey: ['social-leads'] });
    alert('Scan completed! Check for new leads.');
  } catch (error) {
    console.error('Error scanning leads:', error);
    alert('Failed to scan for leads');
  } finally {
    setIsScanning(false);
  }
};
```

### 4. How to Implement Real Twitter API Integration

To implement real Twitter API integration, you would need to:

#### Step 1: Create a Backend API Endpoint

Create a backend endpoint (e.g., in a Node.js/Express server) that uses the Twitter API:

```javascript
// Example backend endpoint
app.post('/api/scan-social-leads', async (req, res) => {
  try {
    // Use Twitter API v2 with the Bearer Token
    const twitterClient = new TwitterApi(process.env.REACT_APP_TWITTER_BEARER_TOKEN);
    
    // Search for tweets with grocery-related keywords
    const keywords = ['need groceries', 'bulk order', 'foodstuff supplier', 'office pantry', 'send groceries to Nigeria'];
    const query = keywords.join(' OR ');
    
    const tweets = await twitterClient.v2.search(query, {
      max_results: 100,
      'tweet.fields': ['created_at', 'author_id', 'public_metrics'],
      'user.fields': ['name', 'username', 'public_metrics']
    });
    
    // Process and store tweets in the database
    for (const tweet of tweets.data) {
      const author = await twitterClient.v2.user(tweet.author_id);
      
      // Insert into social_leads table
      const { error } = await supabase.from('social_leads').upsert({
        platform: 'twitter',
        author_name: author.data.name,
        author_handle: author.data.username,
        post_content: tweet.text,
        post_url: `https://twitter.com/${author.data.username}/status/${tweet.id}`,
        keywords_matched: keywords.filter(kw => tweet.text.toLowerCase().includes(kw.toLowerCase())),
        sentiment: 'neutral', // Would need NLP analysis for real sentiment
        status: 'new',
        created_at: tweet.created_at
      });
      
      if (error) {
        console.error('Error inserting tweet:', error);
      }
    }
    
    res.json({ success: true, count: tweets.data.length });
  } catch (error) {
    console.error('Error scanning social leads:', error);
    res.status(500).json({ error: 'Failed to scan social leads' });
  }
});
```

#### Step 2: Update the Frontend

Update the SocialLeads.tsx to call the real backend API:

```typescript
const handleScanLeads = async () => {
  setIsScanning(true);
  
  try {
    // Call the real backend API
    const response = await fetch('/api/scan-social-leads', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    
    if (response.ok) {
      queryClient.invalidateQueries({ queryKey: ['social-leads'] });
      alert(`Scan completed! Found ${result.count} new leads.`);
    } else {
      throw new Error(result.error || 'Failed to scan for leads');
    }
  } catch (error) {
    console.error('Error scanning leads:', error);
    alert('Failed to scan for leads: ' + error.message);
  } finally {
    setIsScanning(false);
  }
};
```

### 5. Required Dependencies

To implement the real Twitter API integration, you would need to install:

```bash
npm install twitter-api-v2
```

### 6. Environment Variables

Ensure these environment variables are set in your backend:

```
REACT_APP_TWITTER_BEARER_TOKEN=your_twitter_bearer_token
```

### 7. Database Schema

The `social_leads` table is already created with the following structure:

```sql
CREATE TABLE IF NOT EXISTS social_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'whatsapp')),
  author_name TEXT NOT NULL,
  author_handle TEXT NOT NULL,
  post_content TEXT NOT NULL,
  post_url TEXT NOT NULL,
  contact_info TEXT,
  keywords_matched TEXT[] DEFAULT '{}',
  sentiment TEXT DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'urgent')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. Security Considerations

1. Never expose the Twitter Bearer Token in client-side code
2. Always use backend APIs to interact with social media platforms
3. Implement rate limiting to avoid exceeding Twitter API quotas
4. Store sensitive data securely

### 9. Testing

To test the Twitter API integration:

1. Create a simple test script to verify the Bearer Token works:
```javascript
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi(process.env.REACT_APP_TWITTER_BEARER_TOKEN);

async function testTwitterAPI() {
  try {
    const tweets = await client.v2.search('groceries', { max_results: 10 });
    console.log('Twitter API is working. Found', tweets.data.length, 'tweets');
  } catch (error) {
    console.error('Twitter API error:', error);
  }
}

testTwitterAPI();
```

2. Run the test script to verify connectivity

### 10. Monitoring and Maintenance

1. Monitor API usage to stay within rate limits
2. Regularly check for Twitter API changes
3. Update the integration as needed
4. Monitor the social_leads table for data quality

## Conclusion

The Social Leads feature is ready to be connected to the Twitter API. The current implementation provides a solid foundation that only requires adding the backend API endpoint to fetch real data from Twitter. The frontend is already fully functional for displaying and managing the leads.