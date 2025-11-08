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

async function createTestUser() {
  console.log('Creating test user...');
  
  try {
    // Create a test user in the profiles table
    const testUser = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'test@example.com',
      role: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(testUser, { onConflict: 'id' });
      
    if (error) {
      console.log('Error creating test user:', error.message);
    } else {
      console.log('Successfully created test user');
    }
    
    // Now create sample notifications
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const notifications = [
      {
        id: '22222222-2222-2222-2222-222222222222',
        user_id: testUser.id,
        title: 'New Order Received!',
        message: 'Your order #ORD-001 has been received and is being processed.',
        type: 'order',
        read: false,
        data: null,
        created_at: now.toISOString()
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        user_id: testUser.id,
        title: 'Low Stock Alert',
        message: 'Organic Tomatoes are running low (5 units remaining).',
        type: 'product',
        read: false,
        data: null,
        created_at: yesterday.toISOString()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        user_id: testUser.id,
        title: 'Special Promotion',
        message: 'Get 20% off on all fruits this week!',
        type: 'promotion',
        read: true,
        data: null,
        created_at: lastWeek.toISOString()
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        user_id: testUser.id,
        title: 'System Maintenance',
        message: 'Scheduled maintenance on Sunday at 2 AM.',
        type: 'system',
        read: false,
        data: null,
        created_at: lastMonth.toISOString()
      }
    ];
    
    // Insert notifications
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .upsert(notifications, { onConflict: 'id' });
      
    if (notifError) {
      console.log('Error creating notifications:', notifError.message);
    } else {
      console.log('Successfully created sample notifications');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestUser();