import { supabase } from './lib/supabase';

async function testRealtime() {
  console.log('Testing real-time functionality...');
  
  // Check if feedback table exists and has data
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('feedback')
    .select('*')
    .limit(5);
  
  console.log('Feedback data:', feedbackData);
  if (feedbackError) {
    console.error('Feedback error:', feedbackError);
  }
  
  // Check if messages table exists and has data
  const { data: messagesData, error: messagesError } = await supabase
    .from('messages')
    .select('*')
    .limit(5);
  
  console.log('Messages data:', messagesData);
  if (messagesError) {
    console.error('Messages error:', messagesError);
  }
  
  // Test real-time subscription
  const channel = supabase.channel('test-realtime');
  
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'feedback',
    },
    (payload) => {
      console.log('Real-time feedback insert:', payload);
    }
  );
  
  channel.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
    },
    (payload) => {
      console.log('Real-time message insert:', payload);
    }
  );
  
  channel.subscribe((status) => {
    console.log('Subscription status:', status);
  });
  
  console.log('Test completed. Listening for real-time updates...');
}

testRealtime();