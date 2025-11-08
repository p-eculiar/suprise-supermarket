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

async function testRLSPolicies() {
  console.log('Testing RLS policies for notifications table...');
  
  try {
    // Test 1: Check if we can read notifications
    console.log('\n--- Testing READ access ---');
    const { data: readData, error: readError } = await supabase
      .from('notifications')
      .select('*')
      .limit(3);
      
    console.log('Read access:', !readError);
    if (readError) {
      console.log('Read error:', readError.message);
    } else {
      console.log('Number of notifications found:', readData.length);
      if (readData.length > 0) {
        console.log('Sample notification ID:', readData[0].id);
      }
    }
    
    // Test 2: Check if we can update a notification (if any exist)
    if (readData && readData.length > 0) {
      console.log('\n--- Testing UPDATE access ---');
      const notificationId = readData[0].id;
      console.log('Attempting to update notification:', notificationId);
      
      const { data: updateData, error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .select();
        
      console.log('Update access:', !updateError);
      if (updateError) {
        console.log('Update error:', updateError.message);
        console.log('Error code:', updateError.code);
        console.log('Error details:', updateError.details);
        console.log('Error hint:', updateError.hint);
      } else {
        console.log('Update successful');
      }
    }
    
    // Test 3: Check if we can do bulk update
    console.log('\n--- Testing BULK UPDATE access ---');
    const { data: bulkUpdateData, error: bulkUpdateError } = await supabase
      .from('notifications')
      .update({ read: true })
      .neq('read', true)
      .select();
      
    console.log('Bulk update access:', !bulkUpdateError);
    if (bulkUpdateError) {
      console.log('Bulk update error:', bulkUpdateError.message);
      console.log('Error code:', bulkUpdateError.code);
      console.log('Error details:', bulkUpdateError.details);
      console.log('Error hint:', bulkUpdateError.hint);
    } else {
      console.log('Bulk update successful');
    }
    
    // Test 4: Check current user
    console.log('\n--- Testing current user ---');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.id : 'Not logged in');
    if (user) {
      console.log('User role:', user.role);
    }
    if (authError) {
      console.log('Auth error:', authError.message);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testRLSPolicies();