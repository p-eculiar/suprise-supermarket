const { supabase } = require('./src/lib/supabase');

async function insertTestSocialLeads() {
  console.log('Inserting test social leads...');
  
  try {
    // Insert some test data
    const testLeads = [
      {
        platform: 'twitter',
        author_name: 'John Doe',
        author_handle: '@johndoe',
        post_content: 'Need groceries for my family. Any supermarket near me?',
        post_url: 'https://twitter.com/johndoe/status/123456789',
        contact_info: 'johndoe@email.com',
        keywords_matched: ['need groceries', 'supermarket near me'],
        sentiment: 'neutral',
        status: 'new'
      },
      {
        platform: 'twitter',
        author_name: 'Jane Smith',
        author_handle: '@janesmith',
        post_content: 'Looking for fresh vegetables delivery in Port Harcourt',
        post_url: 'https://twitter.com/janesmith/status/987654321',
        contact_info: 'janesmith@email.com',
        keywords_matched: ['fresh vegetables', 'delivery'],
        sentiment: 'positive',
        status: 'new'
      }
    ];
    
    const { data, error } = await supabase
      .from('social_leads')
      .insert(testLeads);
    
    if (error) {
      console.error('Error inserting test social leads:', error);
      return;
    }
    
    console.log('Successfully inserted test social leads:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

insertTestSocialLeads();