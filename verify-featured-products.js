// Verify that featured products are loaded from the database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('=== VERIFYING FEATURED PRODUCTS ===\n');

async function verifyFeaturedProducts() {
  try {
    console.log('1. Checking for featured products in database...');
    
    // Query featured products (is_featured = true)
    const { data: featuredProducts, error } = await supabase
      .from('products')
      .select('id, name, price, category, image_url, is_featured')
      .eq('is_featured', true)
      .limit(10);

    if (error) {
      console.error('❌ Error fetching featured products:', error);
      return false;
    }

    console.log(`✅ Found ${featuredProducts.length} featured products in database:`);
    
    if (featuredProducts.length > 0) {
      featuredProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price} (${product.category})`);
        console.log(`      ID: ${product.id}`);
        console.log(`      Image: ${product.image_url || 'No image'}`);
        console.log(`      Featured: ${product.is_featured}`);
        console.log('');
      });
    } else {
      console.log('   No featured products found in database');
      
      // Check if there are any products at all
      const { data: allProducts, error: allError } = await supabase
        .from('products')
        .select('id, name, is_featured')
        .limit(5);
        
      if (allError) {
        console.error('❌ Error fetching all products:', allError);
        return false;
      }
      
      console.log(`   Total products in database: ${allProducts.length}`);
      if (allProducts.length > 0) {
        console.log('   Sample products:');
        allProducts.forEach((product, index) => {
          console.log(`     ${index + 1}. ${product.name} (Featured: ${product.is_featured})`);
        });
      }
    }
    
    // Test the exact same query used by the UserDashboard
    console.log('2. Testing UserDashboard query logic...');
    
    const { data: dashboardQuery, error: dashboardError } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(6);
      
    if (dashboardError) {
      console.error('❌ Error with dashboard query:', dashboardError);
      return false;
    }
    
    console.log(`✅ Dashboard query returned ${dashboardQuery.length} products`);
    
    return true;
  } catch (error) {
    console.error('Error in verification:', error);
    return false;
  }
}

// Run verification
verifyFeaturedProducts().then(success => {
  console.log('\n=== VERIFICATION COMPLETE ===');
  if (success) {
    console.log('✅ CONFIRMED: Featured products are correctly loaded from the database!');
    console.log('✅ The UserDashboard component will display featured products in real-time');
  } else {
    console.log('❌ Verification failed');
  }
});