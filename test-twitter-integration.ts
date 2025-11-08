// Simple test script to verify Twitter API integration
import { SocialMediaService } from './src/services/socialMediaService';

async function testTwitterIntegration() {
  console.log('Testing Twitter API integration...');
  
  try {
    // Test Twitter scanning
    console.log('Scanning Twitter for leads...');
    const twitterLeads = await SocialMediaService.scanTwitterLeads();
    console.log(`Found ${twitterLeads.length} Twitter leads`);
    
    if (twitterLeads.length > 0) {
      console.log('Sample lead:', twitterLeads[0]);
    }
    
    // Test saving to database (this would normally happen in scanAllPlatforms)
    if (twitterLeads.length > 0) {
      console.log('Saving leads to database...');
      const savedCount = await SocialMediaService.saveLeadsToDatabase(twitterLeads);
      console.log(`Saved ${savedCount} leads to database`);
    }
    
    console.log('Twitter API integration test completed successfully!');
  } catch (error) {
    console.error('Error testing Twitter API integration:', error);
  }
}

// Run the test
testTwitterIntegration();