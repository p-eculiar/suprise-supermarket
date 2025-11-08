const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase config
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function insertSampleSocialLeads() {
  console.log('Inserting sample social leads...');
  
  try {
    // Sample social leads data
    const sampleLeads = [
      {
        platform: 'twitter',
        author_name: 'John Doe',
        author_handle: '@johndoe',
        post_content: 'Need groceries for my family. Any supermarket near me?',
        post_url: 'https://twitter.com/johndoe/status/123456789',
        contact_info: 'johndoe@email.com',
        keywords_matched: ['need groceries', 'supermarket near me'],
        sentiment: 'neutral',
        status: 'new'
      },
      {
        platform: 'twitter',
        author_name: 'Jane Smith',
        author_handle: '@janesmith',
        post_content: 'Looking for fresh vegetables delivery in Port Harcourt',
        post_url: 'https://twitter.com/janesmith/status/987654321',
        contact_info: 'janesmith@email.com',
        keywords_matched: ['fresh vegetables', 'delivery'],
        sentiment: 'positive',
        status: 'new'
      },
      {
        platform: 'facebook',
        author_name: 'Mike Johnson',
        author_handle: 'Mike Johnson',
        post_content: 'Bulk buying groceries for office supplies. Need a reliable supplier.',
        post_url: 'https://facebook.com/mikejohnson/post/123456789',
        contact_info: 'mike@company.com',
        keywords_matched: ['bulk buying', 'office supplies'],
        sentiment: 'urgent',
        status: 'new'
      },
      {
        platform: 'twitter',
        author_name: 'Sarah Wilson',
        author_handle: '@sarahw',
        post_content: 'Supermarket near me with fresh fruits and vegetables?',
        post_url: 'https://twitter.com/sarahw/status/111111111',
        contact_info: 'sarahw@email.com',
        keywords_matched: ['supermarket near me', 'fresh fruits'],
        sentiment: 'neutral',
        status: 'contacted'
      }
    ];
    
    // Insert the sample data
    const { data, error } = await supabase
      .from('social_leads')
      .insert(sampleLeads);
    
    if (error) {
      console.error('Error inserting sample social leads:', error);
      return;
    }
    
    console.log('Successfully inserted sample social leads!');
    console.log('Inserted', sampleLeads.length, 'records');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertSampleSocialLeads();