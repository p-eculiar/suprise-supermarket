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

async function listTables() {
  console.log('Testing access to common tables...');
  
  const tablesToCheck = [
    'orders',
    'products',
    'users',
    'profiles',
    'inventory_alerts',
    'notifications',
    'invoices',
    'receipts'
  ];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
        
      console.log(`${table}: ${error ? 'NO' : 'YES'} ${error ? `(${error.message})` : ''}`);
    } catch (error) {
      console.log(`${table}: ERROR (${error.message})`);
    }
  }
}

listTables();