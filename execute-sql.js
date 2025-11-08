const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  try {
    // Create the dashboard_stats view
    const { error: viewError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE OR REPLACE VIEW dashboard_stats AS
        SELECT 
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS total_revenue,
          (SELECT COUNT(*) FROM products) AS total_products,
          (SELECT COUNT(*) FROM users) AS total_users;
      `
    });

    if (viewError) {
      console.error('Error creating dashboard_stats view:', viewError);
    } else {
      console.log('Successfully created dashboard_stats view');
    }

    // Test the view
    const { data, error } = await supabase.from('dashboard_stats').select('*');
    if (error) {
      console.error('Error querying dashboard_stats view:', error);
    } else {
      console.log('Dashboard stats:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

executeSQL();