const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('Checking table structures...');
  
  try {
    // Check profiles table structure
    console.log('\n--- PROFILES TABLE ---');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
      
    if (profilesError) {
      console.log('Error accessing profiles:', profilesError.message);
    } else {
      console.log('Profiles sample row:', profilesData[0]);
    }
    
    // Check notifications table structure
    console.log('\n--- NOTIFICATIONS TABLE ---');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
      
    if (notificationsError) {
      console.log('Error accessing notifications:', notificationsError.message);
    } else if (notificationsData && notificationsData.length > 0) {
      console.log('Notifications sample row:', notificationsData[0]);
    } else {
      console.log('No notifications found');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTableStructure();