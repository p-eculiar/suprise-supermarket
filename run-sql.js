const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Supabase credentials from .env file
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function runSqlFile() {
  try {
    // Read the SQL file
    const sql = fs.readFileSync('./ADD_MISSING_COLUMNS.sql', 'utf8');
    
    console.log('Running SQL file...');
    console.log('Supabase URL:', supabaseUrl);
    
    // Note: Supabase.js doesn't have a direct method to run raw SQL
    // You'll need to run this SQL file in your Supabase SQL Editor
    console.log('\nPlease run the following SQL in your Supabase SQL Editor:\n');
    console.log(sql);
    
  } catch (error) {
    console.error('Error reading SQL file:', error);
  }
}

runSqlFile();