// Simple test script to verify email fetching is working correctly
// This script should be run in the browser console or as a Node.js script with Supabase client

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEmailFetching() {
  try {
    console.log('Testing email fetching from profiles table...');
    
    // Fetch profiles data
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.error('Profiles query error:', profilesError);
      return;
    }
    
    console.log('Profiles data:', profilesData);
    
    // Check if emails are present in the profiles data
    if (profilesData && profilesData.length > 0) {
      console.log('\nEmail verification:');
      profilesData.forEach((profile, index) => {
        console.log(`${index + 1}. User: ${profile.full_name || 'No name'} (${profile.id})`);
        console.log(`   Email from profiles table: ${profile.email || 'MISSING'}`);
        
        // Check if email looks valid
        if (profile.email && profile.email.includes('@')) {
          console.log(`   ✅ Valid email format`);
        } else {
          console.log(`   ❌ Invalid or missing email`);
        }
        console.log('');
      });
    } else {
      console.log('No profiles found in the database');
    }
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testEmailFetching();