// Script to test real-time filtering functionality
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRealtimeFilters() {
  console.log('🔍 Testing real-time filtering functionality...');
  
  // Test 1: Category filtering
  console.log('\n1. Testing category filtering...');
  const { data: categoryData, error: categoryError } = await supabase
    .from('products')
    .select('category')
    .eq('category', 'Fruits')
    .limit(5);
    
  if (categoryError) {
    console.error('❌ Category filter test failed:', categoryError);
  } else {
    console.log(`✅ Category filter test passed: Found ${categoryData.length} Fruits products`);
  }
  
  // Test 2: Price range filtering
  console.log('\n2. Testing price range filtering...');
  const { data: priceData, error: priceError } = await supabase
    .from('products')
    .select('name, price')
    .gte('price', 5)
    .lte('price', 20)
    .limit(5);
    
  if (priceError) {
    console.error('❌ Price range filter test failed:', priceError);
  } else {
    console.log(`✅ Price range filter test passed: Found ${priceData.length} products between $5-$20`);
    priceData.forEach(p => console.log(`   - ${p.name}: $${p.price}`));
  }
  
  // Test 3: Rating filtering
  console.log('\n3. Testing rating filtering...');
  const { data: ratingData, error: ratingError } = await supabase
    .from('products')
    .select('name, rating')
    .gte('rating', 4)
    .limit(5);
    
  if (ratingError) {
    console.error('❌ Rating filter test failed:', ratingError);
  } else {
    console.log(`✅ Rating filter test passed: Found ${ratingData.length} products with 4+ stars`);
    ratingData.forEach(p => console.log(`   - ${p.name}: ${p.rating} stars`));
  }
  
  // Test 4: Availability filtering
  console.log('\n4. Testing availability filtering...');
  const { data: stockData, error: stockError } = await supabase
    .from('products')
    .select('name, stock')
    .gt('stock', 0)
    .limit(5);
    
  if (stockError) {
    console.error('❌ Availability filter test failed:', stockError);
  } else {
    console.log(`✅ Availability filter test passed: Found ${stockData.length} in-stock products`);
    stockData.forEach(p => console.log(`   - ${p.name}: ${p.stock} in stock`));
  }
  
  // Test 5: Real-time subscription
  console.log('\n5. Testing real-time subscription...');
  const channel = supabase
    .channel('test-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'products',
      },
      (payload) => {
        console.log('✅ Real-time INSERT event received:', payload.new.name);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('✅ Real-time subscription successful');
      }
    });
  
  // Keep the script running for a few seconds to test real-time
  setTimeout(() => {
    console.log('✅ Real-time testing completed');
    supabase.removeChannel(channel);
  }, 5000);
  
  console.log('\n🎉 All filter tests completed!');
}

// Run the tests
testRealtimeFilters();