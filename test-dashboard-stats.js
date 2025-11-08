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

async function testDashboardStats() {
  console.log('Testing dashboard stats view...');
  
  try {
    // Try to query the dashboard_stats view
    const { data, error } = await supabase
      .from('dashboard_stats')
      .select('*');
      
    if (error) {
      console.log('Dashboard stats view not available:', error.message);
      
      // Fallback: calculate stats directly
      console.log('Calculating stats directly...');
      
      const [
        { count: totalOrders },
        { data: completedOrders },
        { count: totalProducts },
        { count: totalUsers }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'completed'),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true })
      ]);
      
      const totalRevenue = completedOrders 
        ? completedOrders.reduce((sum, order) => sum + (order.total || 0), 0) 
        : 0;
        
      console.log('Direct stats calculation result:');
      console.log({
        total_orders: totalOrders || 0,
        total_revenue: totalRevenue,
        total_products: totalProducts || 0,
        total_users: totalUsers || 0
      });
    } else {
      console.log('Dashboard stats view result:', data);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDashboardStats();