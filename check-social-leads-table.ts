import { supabase } from './src/lib/supabase';

async function checkSocialLeadsTable() {
  console.log('Checking social_leads table...');
  
  try {
    // Check if the table exists and get its structure
    const { data, error } = await supabase
      .from('social_leads')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing social_leads table:', error);
      console.log('The social_leads table might not exist in your database.');
      console.log('Please run the CREATE_MISSING_TABLES.sql script to create it.');
      return;
    }
    
    console.log('social_leads table exists and is accessible.');
    console.log('Sample data:', data);
    
    // Check table structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('social_leads')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('Error getting table structure:', tableError);
    } else {
      console.log('Table structure check passed.');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSocialLeadsTable();