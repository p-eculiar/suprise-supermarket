// This script would typically query the information_schema to get column info
// but since we can't access that directly, let's try to infer the structure

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

async function getColumnNames() {
  console.log('Attempting to determine table structures...');
  
  try {
    // Try common column names for profiles table
    const profileColumns = [
      'id', 'email', 'name', 'role', 'created_at', 'updated_at',
      'first_name', 'last_name', 'username', 'avatar_url'
    ];
    
    console.log('\n--- PROFILES TABLE COLUMNS ---');
    for (const column of profileColumns) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(column)
          .limit(1);
          
        if (!error) {
          console.log(`✓ ${column}`);
        } else if (!error.message.includes('column')) {
          console.log(`? ${column} - ${error.message}`);
        }
      } catch (e) {
        // Ignore errors for individual columns
      }
    }
    
    // Try common column names for notifications table
    const notificationColumns = [
      'id', 'user_id', 'title', 'message', 'type', 'read', 
      'data', 'created_at', 'updated_at'
    ];
    
    console.log('\n--- NOTIFICATIONS TABLE COLUMNS ---');
    for (const column of notificationColumns) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select(column)
          .limit(1);
          
        if (!error) {
          console.log(`✓ ${column}`);
        } else if (!error.message.includes('column')) {
          console.log(`? ${column} - ${error.message}`);
        }
      } catch (e) {
        // Ignore errors for individual columns
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

getColumnNames();