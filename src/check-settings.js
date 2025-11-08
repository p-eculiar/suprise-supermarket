const { supabase } = require('./lib/supabase');

async function checkSettings() {
  console.log('Checking platform settings...');
  
  try {
    const { data, error } = await supabase.from('platform_settings').select('*').single();
    
    if (error) {
      console.log('Error fetching settings:', error);
      console.log('Error code:', error.code);
      console.log('Error message:', error.message);
      
      // If no rows found, insert default settings
      if (error.code === 'PGRST116') {
        console.log('No settings found, inserting default settings...');
        const defaultSettings = {
          id: '00000000-0000-0000-0000-000000000001',
          platform_fee_percentage: 2.5,
          tax_rate: 7.5,
          minimum_order: 10.00,
          shipping_fee: 5.00,
          free_shipping_threshold: 50.00,
          site_name: 'Suprise Supermarket',
          support_email: 'support@suprisesuper.com',
          currency: 'USD',
          timezone: 'Africa/Lagos'
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from('platform_settings')
          .insert([defaultSettings])
          .select()
          .single();
          
        if (insertError) {
          console.log('Error inserting default settings:', insertError);
        } else {
          console.log('Default settings inserted:', insertedData);
        }
      }
    } else {
      console.log('Settings found:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkSettings();