import { SocialMediaService } from './src/services/socialMediaService';

async function testSocialLeads() {
  console.log('Testing Social Media Service...');
  
  try {
    // Test Twitter scanning
    console.log('Scanning Twitter for leads...');
    const twitterLeads = await SocialMediaService.scanTwitterLeads();
    console.log(`Found ${twitterLeads.length} Twitter leads`);
    
    if (twitterLeads.length > 0) {
      console.log('Sample lead:', twitterLeads[0]);
    } else {
      console.log('No Twitter leads found. This might be the issue.');
    }
    
    // Test scanning all platforms
    console.log('Scanning all platforms...');
    const allResults = await SocialMediaService.scanAllPlatforms();
    console.log('All platforms results:', allResults);
    
  } catch (error) {
    console.error('Error testing social leads:', error);
  }
}

testSocialLeads();