import { supabase } from './lib/supabase';

async function testSettings() {
  console.log('Testing platform settings functionality...');
  
  // Check if platform_settings table exists and has data
  const { data: settingsData, error: settingsError } = await supabase
    .from('platform_settings')
    .select('*')
    .single();
  
  console.log('Platform settings data:', settingsData);
  if (settingsError) {
    console.error('Platform settings error:', settingsError);
  }
  
  // Test real-time subscription for platform_settings
  const channel = supabase.channel('test-platform-settings');
  
  channel.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'platform_settings',
    },
    (payload) => {
      console.log('Real-time platform settings update:', payload);
    }
  );
  
  channel.subscribe((status) => {
    console.log('Platform settings subscription status:', status);
  });
  
  console.log('Settings test completed. Listening for real-time updates...');
}

testSettings();