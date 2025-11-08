// Script to count the number of products in the database
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function countProducts() {
  try {
    console.log('🔍 Counting products in database...');
    
    // Get total count of products
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error counting products:', error);
      return;
    }

    console.log(`✅ Total products in database: ${count}`);
    
    // Also get a sample of products to see what's there
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('id, name, price, category')
      .limit(10);
      
    if (!sampleError) {
      console.log('\n📝 Sample products:');
      sampleProducts.forEach(product => {
        console.log(`   - ${product.name} ($${product.price}, ${product.category || 'null'}) - ID: ${product.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
countProducts();