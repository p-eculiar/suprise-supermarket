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

async function testNotificationDashboard() {
  console.log('Testing notification dashboard functionality...');
  
  try {
    // Test 1: Check if notifications table exists and has data
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(5);
      
    console.log('Notifications table accessible:', !notificationsError);
    if (notificationsError) {
      console.log('Notifications error:', notificationsError.message);
    } else {
      console.log('Number of notifications found:', notifications.length);
      if (notifications.length > 0) {
        console.log('Sample notification:', {
          id: notifications[0].id,
          title: notifications[0].title,
          read: notifications[0].read,
          created_at: notifications[0].created_at
        });
      }
    }
    
    // Test 2: Test date filtering for "today"
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const { data: todayNotifications, error: todayError } = await supabase
      .from('notifications')
      .select('*')
      .gte('created_at', todayStart.toISOString())
      .limit(5);
      
    console.log('Today notifications query successful:', !todayError);
    if (todayError) {
      console.log('Today notifications error:', todayError.message);
    } else {
      console.log('Today notifications count:', todayNotifications.length);
    }
    
    // Test 3: Test date filtering for "this week"
    const day = now.getDay();
    const diff = now.getDate() - day;
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);
    
    const { data: weekNotifications, error: weekError } = await supabase
      .from('notifications')
      .select('*')
      .gte('created_at', weekStart.toISOString())
      .limit(5);
      
    console.log('Week notifications query successful:', !weekError);
    if (weekError) {
      console.log('Week notifications error:', weekError.message);
    } else {
      console.log('Week notifications count:', weekNotifications.length);
    }
    
    // Test 4: Test date filtering for "this month"
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const { data: monthNotifications, error: monthError } = await supabase
      .from('notifications')
      .select('*')
      .gte('created_at', monthStart.toISOString())
      .limit(5);
      
    console.log('Month notifications query successful:', !monthError);
    if (monthError) {
      console.log('Month notifications error:', monthError.message);
    } else {
      console.log('Month notifications count:', monthNotifications.length);
    }
    
    // Test 5: Test marking a notification as read
    if (notifications && notifications.length > 0) {
      const notificationId = notifications[0].id;
      console.log('Testing mark as read for notification:', notificationId);
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      console.log('Mark as read successful:', !updateError);
      if (updateError) {
        console.log('Mark as read error:', updateError.message);
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testNotificationDashboard();