const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runCategoriesSetup() {
  try {
    // Read the SQL file
    const fs = require('fs');
    const path = require('path');
    const sqlFilePath = path.join(__dirname, 'CREATE_CATEGORIES_TABLE.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Running categories table setup...');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('execute_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error running categories setup:', error);
      process.exit(1);
    }
    
    console.log('Categories table setup completed successfully!');
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runCategoriesSetup();