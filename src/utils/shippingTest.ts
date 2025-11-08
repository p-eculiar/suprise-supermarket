// Test script to demonstrate how the accurate shipping calculation works
import { calculateAccurateShippingFee } from './accurateShippingCalculator';

async function testShippingCalculation() {
  try {
    console.log('Testing shipping calculation for "40 Rumuola Road, Port Harcourt, Rivers"');
    
    // Test case 1: Low order value
    const address = "40 Rumuola Road, Port Harcourt, Rivers State, Nigeria";
    const subtotal = 5000; // ₦5,000 order
    const freeShippingThreshold = 50000; // ₦50,000 for free shipping
    
    console.log(`Order subtotal: ₦${subtotal}`);
    console.log(`Free shipping threshold: ₦${freeShippingThreshold}`);
    
    const shippingFee = await calculateAccurateShippingFee(address, subtotal, freeShippingThreshold);
    console.log(`Calculated shipping fee: ₦${shippingFee}`);
    
    // Test case 2: High order value (should qualify for free shipping)
    const largeOrderSubtotal = 60000; // ₦60,000 order
    console.log(`\nLarge order subtotal: ₦${largeOrderSubtotal}`);
    
    const freeShippingFee = await calculateAccurateShippingFee(address, largeOrderSubtotal, freeShippingThreshold);
    console.log(`Calculated shipping fee: ₦${freeShippingFee} (Free shipping!)`);
    
  } catch (error) {
    console.error('Error calculating shipping:', error);
  }
}

// Run the test
testShippingCalculation();