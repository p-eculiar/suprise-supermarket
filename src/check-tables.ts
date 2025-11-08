import { supabase } from './lib/supabase';

async function checkTables() {
  console.log('Checking database tables...');
  
  // Check if feedback table exists
  try {
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('feedback')
      .select('*, user:profiles(email, full_name)')
      .limit(1);
    
    console.log('Feedback table accessible:', !!feedbackData);
    if (feedbackError) {
      console.error('Feedback table error:', feedbackError);
    } else {
      console.log('Sample feedback data:', feedbackData);
    }
  } catch (error) {
    console.error('Error checking feedback table:', error);
  }
  
  // Check if messages table exists
  try {
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*, user:profiles(email, full_name)')
      .limit(1);
    
    console.log('Messages table accessible:', !!messagesData);
    if (messagesError) {
      console.error('Messages table error:', messagesError);
    } else {
      console.log('Sample messages data:', messagesData);
    }
  } catch (error) {
    console.error('Error checking messages table:', error);
  }
  
  // Check if profiles table exists
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('Profiles table accessible:', !!profilesData);
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
    } else {
      console.log('Sample profiles data:', profilesData);
    }
  } catch (error) {
    console.error('Error checking profiles table:', error);
  }
}

checkTables();