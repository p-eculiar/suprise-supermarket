const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  console.log('REACT_APP_SUPABASE_URL:', !!process.env.REACT_APP_SUPABASE_URL);
  console.log('REACT_APP_SUPABASE_ANON_KEY:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking if required tables exist...');
  
  try {
    // Check if orders table exists
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
      
    console.log('Orders table exists:', !ordersError);
    if (ordersError) console.log('Orders error:', ordersError.message);
    
    // Check if products table exists
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id')
      .limit(1);
      
    console.log('Products table exists:', !productsError);
    if (productsError) console.log('Products error:', productsError.message);
    
    // Check if users table exists
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
      
    console.log('Users table exists:', !usersError);
    if (usersError) console.log('Users error:', usersError.message);
    
    // Check if inventory_alerts table exists
    const { data: alertsData, error: alertsError } = await supabase
      .from('inventory_alerts')
      .select('id')
      .limit(1);
      
    console.log('Inventory alerts table exists:', !alertsError);
    if (alertsError) console.log('Inventory alerts error:', alertsError.message);
    
    // Check if dashboard_stats view exists
    const { data: statsData, error: statsError } = await supabase
      .from('dashboard_stats')
      .select('*')
      .limit(1);
      
    console.log('Dashboard stats view exists:', !statsError);
    if (statsError) console.log('Dashboard stats error:', statsError.message);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkTables();