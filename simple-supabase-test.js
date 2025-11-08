// Simple test to verify Supabase client is working
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Simple test query
    const { data, error } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
      
    console.log('Connection test result:');
    console.log('Success:', !error);
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Data:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabase();