// Simple test script to verify the API bridge is working
import { SocialLeadsApi } from './src/services/socialLeadsApi';

async function testApiBridge() {
  console.log('Testing Social Leads API bridge...');
  
  try {
    // Test the scanSocialLeads method
    console.log('Calling scanSocialLeads...');
    const result = await SocialLeadsApi.scanSocialLeads();
    
    console.log('API Response:', result);
    
    if (result.success) {
      console.log('✅ API bridge is working correctly!');
      console.log(`✅ Message: ${result.message}`);
      if (result.data) {
        console.log(`✅ Data:`, result.data);
      }
    } else {
      console.log('❌ API bridge returned an error:');
      console.log(`❌ Message: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Error testing API bridge:', error);
  }
}

// Run the test
testApiBridge();