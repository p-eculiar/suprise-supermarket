const { supabase } = require('./src/lib/supabase');

async function testSocialLeadsFetch() {
  console.log('Testing social_leads table fetch...');
  
  try {
    // Try to fetch data from the social_leads table
    const { data, error } = await supabase
      .from('social_leads')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching social leads:', error);
      return;
    }
    
    console.log('Successfully fetched social leads:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} social leads in the database.`);
    } else {
      console.log('No social leads found in the database.');
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSocialLeadsFetch();