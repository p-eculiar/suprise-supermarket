const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

async function diagnoseSocialLeads() {
  console.log('=== Social Leads Diagnostics ===\n');
  
  // Get Supabase config
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('   ✗ Supabase configuration missing');
    console.log('     Please ensure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // 1. Check if .env file has Twitter token
  console.log('1. Checking Twitter API token...');
  try {
    if (process.env.REACT_APP_TWITTER_BEARER_TOKEN) {
      console.log('   ✓ Twitter API token found in .env file');
    } else {
      console.log('   ✗ Twitter API token NOT found in .env file');
      console.log('     Please add: REACT_APP_TWITTER_BEARER_TOKEN=your_token_here');
    }
  } catch (error) {
    console.log('   ✗ Error checking .env file:', error.message);
  }
  
  // 2. Check if social_leads table exists
  console.log('\n2. Checking social_leads table...');
  try {
    const { data, error } = await supabase
      .from('social_leads')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('   ✗ Error accessing social_leads table:', error.message);
      console.log('     The social_leads table may not exist in your database');
    } else {
      console.log('   ✓ social_leads table exists and is accessible');
    }
  } catch (error) {
    console.log('   ✗ Unexpected error checking social_leads table:', error.message);
  }
  
  // 3. Try to insert a test record
  console.log('\n3. Testing data insertion...');
  try {
    const testLead = {
      platform: 'twitter',
      author_name: 'Test User',
      author_handle: '@testuser',
      post_content: 'This is a test post for diagnostics',
      post_url: 'https://twitter.com/testuser/status/123456789',
      contact_info: 'test@example.com',
      keywords_matched: ['test'],
      sentiment: 'neutral',
      status: 'new'
    };
    
    const { data, error } = await supabase
      .from('social_leads')
      .insert([testLead]);
    
    if (error) {
      console.log('   ✗ Error inserting test record:', error.message);
    } else {
      console.log('   ✓ Successfully inserted test record');
      
      // Clean up the test record
      const { error: deleteError } = await supabase
        .from('social_leads')
        .delete()
        .eq('author_name', 'Test User');
      
      if (deleteError) {
        console.log('   ! Warning: Could not clean up test record:', deleteError.message);
      }
    }
  } catch (error) {
    console.log('   ✗ Unexpected error during insertion test:', error.message);
  }
  
  // 4. Try to fetch records
  console.log('\n4. Testing data retrieval...');
  try {
    const { data, error } = await supabase
      .from('social_leads')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('   ✗ Error fetching records:', error.message);
    } else {
      console.log(`   ✓ Successfully fetched ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log('   ✗ Unexpected error during fetch test:', error.message);
  }
  
  console.log('\n=== Diagnostics Complete ===');
  console.log('\nNext steps:');
  console.log('1. Check browser console for any JavaScript errors');
  console.log('2. Verify your Supabase connection settings in src/lib/supabase.ts');
  console.log('3. Ensure your Twitter API token is valid');
  console.log('4. Make sure the social_leads table exists in your database');
}

diagnoseSocialLeads();