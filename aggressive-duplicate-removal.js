// Script to aggressively remove duplicate products from Supabase
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function aggressiveDuplicateRemoval() {
  try {
    console.log('🔍 Aggressively searching for duplicate products...');
    
    // First, get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock, rating, featured, active, created_at, discount')
      .order('name');

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Found ${products.length} products in database`);

    // Group products by name, price, and category
    const productGroups = {};
    
    products.forEach(product => {
      // Create a key based on name, price, and category
      const normalizedName = product.name.trim().toLowerCase();
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
    const duplicates = Object.values(productGroups).filter(group => group.length > 1);
    
    console.log(`📊 Found ${duplicates.length} groups of duplicate products`);
    
    let totalDuplicatesRemoved = 0;
    
    // Process each group of duplicates
    for (const group of duplicates) {
      console.log(`\n📝 Processing duplicate group: ${group[0].name} ($${group[0].price}, ${group[0].category || 'null'})`);
      console.log(`   Found ${group.length} duplicates`);
      
      // Sort by created_at and then by ID to ensure consistent ordering
      group.sort((a, b) => {
        const dateDiff = new Date(a.created_at) - new Date(b.created_at);
        if (dateDiff !== 0) {
          return dateDiff;
        }
        // If created_at is the same, sort by ID
        return a.id.localeCompare(b.id);
      });
      
      // Keep the first one and remove the rest
      const duplicatesToRemove = group.slice(1);
      
      console.log(`   Keeping 1 product, removing ${duplicatesToRemove.length} duplicates`);
      
      // Remove duplicates
      for (const duplicate of duplicatesToRemove) {
        console.log(`   🗑️ Removing duplicate product ID: ${duplicate.id} - ${duplicate.name}`);
        
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', duplicate.id);
          
        if (deleteError) {
          console.error(`   ❌ Failed to remove product ${duplicate.id}:`, deleteError);
        } else {
          console.log(`   ✅ Successfully removed duplicate product ${duplicate.id}`);
          totalDuplicatesRemoved++;
        }
      }
    }
    
    console.log(`\n🎉 Process completed! Removed ${totalDuplicatesRemoved} duplicate products.`);
    
    // Verify the cleanup by checking total count
    const { count: finalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ Error getting final product count:', countError);
    } else {
      console.log(`✅ Final product count: ${finalCount}`);
    }
    
    // Final verification - check for remaining obvious duplicates by name
    console.log('\n🔍 Final verification - checking for remaining name duplicates...');
    const { data: finalProducts, error: finalError } = await supabase
      .from('products')
      .select('id, name, price, category')
      .order('name');

    if (!finalError) {
      const nameCategoryPriceCounts = {};
      finalProducts.forEach(product => {
        const normalizedName = product.name.trim().toLowerCase();
        const normalizedCategory = (product.category || '').trim().toLowerCase();
        const roundedPrice = Math.round(product.price * 100) / 100;
        const key = `${normalizedName}|${roundedPrice}|${normalizedCategory}`;
        nameCategoryPriceCounts[key] = (nameCategoryPriceCounts[key] || 0) + 1;
      });
      
      const remainingDuplicates = Object.entries(nameCategoryPriceCounts).filter(([key, count]) => count > 1);
      console.log(`📊 Found ${remainingDuplicates.length} remaining duplicates by name/price/category:`);
      remainingDuplicates.slice(0, 10).forEach(([key, count]) => {
        const [name, price, category] = key.split('|');
        console.log(`   - "${name}" ($${price}, ${category}) appears ${count} times`);
      });
      
      if (remainingDuplicates.length > 10) {
        console.log(`   ... and ${remainingDuplicates.length - 10} more`);
      }
      
      if (remainingDuplicates.length === 0) {
        console.log('✅ No remaining duplicates found!');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
aggressiveDuplicateRemoval();