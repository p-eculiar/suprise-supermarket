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

async function testNotificationFunctions() {
  console.log('Testing notification functions...');
  
  try {
    // Test 1: Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Current user:', user ? user.id : 'Not logged in');
    
    if (authError) {
      console.log('Auth error:', authError.message);
    }
    
    // Test 2: Check if notifications table exists and has data
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(3);
      
    console.log('Notifications accessible:', !notificationsError);
    if (notificationsError) {
      console.log('Notifications error:', notificationsError.message);
    } else {
      console.log('Number of notifications found:', notifications.length);
      if (notifications.length > 0) {
        console.log('Sample notification:', {
          id: notifications[0].id,
          title: notifications[0].title,
          read: notifications[0].read
        });
        
        // Test 3: Try to mark a notification as read
        console.log('\n--- Testing markAsRead ---');
        const notificationId = notifications[0].id;
        console.log('Attempting to mark notification as read:', notificationId);
        
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId);
          
        if (updateError) {
          console.log('Mark as read error:', updateError.message);
        } else {
          console.log('Mark as read successful');
          
          // Verify the update
          const { data: updatedNotification, error: verifyError } = await supabase
            .from('notifications')
            .select('read')
            .eq('id', notificationId)
            .single();
            
          if (verifyError) {
            console.log('Verification error:', verifyError.message);
          } else {
            console.log('Notification read status after update:', updatedNotification.read);
          }
        }
      }
    }
    
    // Test 4: Try to mark all notifications as read (only if user is logged in)
    if (user) {
      console.log('\n--- Testing markAllAsRead ---');
      console.log('Attempting to mark all notifications as read for user:', user.id);
      
      const { error: markAllError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);
        
      if (markAllError) {
        console.log('Mark all as read error:', markAllError.message);
      } else {
        console.log('Mark all as read successful');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testNotificationFunctions();