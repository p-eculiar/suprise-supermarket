// Script to verify current state and clean up duplicates
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyAndClean() {
  try {
    console.log('🔍 Verifying current state and cleaning duplicates...');
    
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, category, created_at')
      .order('name, price, category');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Found ${products.length} products in database`);

    // Group products by name, price, and category
    const productGroups = {};
    
    products.forEach(product => {
      // Create a key based on name, price, and category
      const normalizedName = (product.name || '').trim().toLowerCase();
      const normalizedCategory = (product.category || '').trim().toLowerCase();
      const roundedPrice = Math.round(product.price * 100) / 100;
      
      // Use name, price, and category as the key
      const key = `${normalizedName}|${roundedPrice}|${normalizedCategory}`;
      
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      productGroups[key].push(product);
    });

    // Find duplicates (groups with more than one product)
    const duplicates = Object.entries(productGroups).filter(([key, group]) => group.length > 1);
    
    console.log(`📊 Found ${duplicates.length} groups of duplicate products`);
    
    // Show some duplicates for verification
    console.log('\n📝 Sample duplicate groups:');
    duplicates.slice(0, 10).forEach(([key, group]) => {
      const [name, price, category] = key.split('|');
      console.log(`   - "${name}" ($${price}, ${category}) - ${group.length} copies`);
      group.slice(0, 3).forEach(product => {
        console.log(`     ID: ${product.id} - Created: ${product.created_at}`);
      });
      if (group.length > 3) {
        console.log(`     ... and ${group.length - 3} more`);
      }
    });
    
    if (duplicates.length > 10) {
      console.log(`   ... and ${duplicates.length - 10} more duplicate groups`);
    }
    
    // Count total duplicates
    let totalDuplicates = 0;
    duplicates.forEach(([key, group]) => {
      totalDuplicates += group.length - 1; // -1 to keep one copy
    });
    
    console.log(`\n🗑️ Total duplicate products that could be removed: ${totalDuplicates}`);
    
    // Ask for confirmation before removing
    console.log('\n💡 To remove these duplicates, run the removal script');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
verifyAndClean();