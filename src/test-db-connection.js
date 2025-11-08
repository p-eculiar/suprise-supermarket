// Simple database connection test
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('Supabase Anon Key:', supabaseAnonKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('ERROR: Supabase environment variables are not set!');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test a simple query
    const { data, error } = await supabase.from('platform_settings').select('id').limit(1);
    
    if (error) {
      console.log('Query Error:', error);
      console.log('Error Code:', error.code);
      console.log('Error Message:', error.message);
    } else {
      console.log('Query Success! Found', data?.length || 0, 'records');
    }
    
    // Test if we can insert a record
    console.log('Testing insert capability...');
    const testRecord = {
      id: '00000000-0000-0000-0000-000000000001',
      platform_fee_percentage: 2.5,
      tax_rate: 7.5,
      minimum_order: 10.00,
      shipping_fee: 5.00,
      free_shipping_threshold: 50.00,
      site_name: 'Test Supermarket',
      support_email: 'test@suprisesuper.com',
      currency: 'USD',
      timezone: 'Africa/Lagos'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('platform_settings')
      .upsert(testRecord, { onConflict: 'id' })
      .select();
    
    if (insertError) {
      console.log('Insert Error:', insertError);
    } else {
      console.log('Insert Success!');
    }
    
  } catch (err) {
    console.log('Unexpected Error:', err);
  }
}

testConnection();