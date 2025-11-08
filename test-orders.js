// Test if orders table exists and has data
const { supabase } = require('./suprise-supermarket/src/lib/supabase');

async function testOrders() {
  try {
    console.log('Testing orders table...');
    
    // Check if orders table exists by querying it
    const { data, error } = await supabase
      .from('orders')
      .select('id, user_id, status, total, created_at')
      .limit(5);
    
    if (error) {
      console.log('❌ Error querying orders table:', error.message);
      return;
    }
    
    console.log('✅ Successfully queried orders table');
    console.log('Found', data.length, 'orders');
    
    if (data.length > 0) {
      console.log('Sample order:', data[0]);
    } else {
      console.log('No orders found in the table');
    }
    
    // Check order_items table
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select('id, order_id, product_name, quantity, price')
      .limit(5);
    
    if (itemsError) {
      console.log('❌ Error querying order_items table:', itemsError.message);
    } else {
      console.log('✅ Successfully queried order_items table');
      console.log('Found', items.length, 'order items');
      
      if (items.length > 0) {
        console.log('Sample item:', items[0]);
      } else {
        console.log('No order items found in the table');
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testOrders();