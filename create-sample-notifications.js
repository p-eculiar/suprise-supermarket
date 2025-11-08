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

async function createSampleNotifications() {
  console.log('Creating sample notifications for testing...');
  
  try {
    // Get admin users to send notifications to
    const { data: admins, error: adminsError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
      
    if (adminsError) {
      console.log('Error fetching admins:', adminsError.message);
      return;
    }
    
    if (!admins || admins.length === 0) {
      console.log('No admin users found. Creating sample notifications for a test user.');
      
      // Get any user as a test recipient
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
        
      if (usersError) {
        console.log('Error fetching users:', usersError.message);
        return;
      }
      
      if (!users || users.length === 0) {
        console.log('No users found in the database.');
        return;
      }
      
      admins.push(users[0]);
    }
    
    const adminId = admins[0].id;
    console.log('Sending notifications to user ID:', adminId);
    
    // Create sample notifications with different dates
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const notifications = [
      {
        user_id: adminId,
        title: 'New Order Received!',
        message: 'Your order #ORD-001 has been received and is being processed.',
        type: 'order',
        read: false,
        created_at: now.toISOString()
      },
      {
        user_id: adminId,
        title: 'Low Stock Alert',
        message: 'Organic Tomatoes are running low (5 units remaining).',
        type: 'product',
        read: false,
        created_at: yesterday.toISOString()
      },
      {
        user_id: adminId,
        title: 'Special Promotion',
        message: 'Get 20% off on all fruits this week!',
        type: 'promotion',
        read: true,
        created_at: lastWeek.toISOString()
      },
      {
        user_id: adminId,
        title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday at 2 AM.',
        type: 'system',
        read: false,
        created_at: lastMonth.toISOString()
      }
    ];
    
    // Insert notifications
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications);
      
    if (error) {
      console.log('Error creating notifications:', error.message);
    } else {
      console.log('Successfully created sample notifications');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createSampleNotifications();