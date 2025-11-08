const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function aggressiveDuplicateCleaner() {
  try {
    console.log('🔍 Aggressive duplicate cleaner starting...');
    
    // Get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }
    
    console.log(`📊 Found ${products.length} products`);
    
    // Group products by normalized name, price, and category
    const productGroups = new Map();
    
    products.forEach(product => {
      // Normalize the product data for comparison
      const normalizedName = (product.name || '').toLowerCase().trim();
      const normalizedPrice = parseFloat(product.price);
      const normalizedCategory = (product.category || 'uncategorized').toLowerCase().trim();
      
      // Create a unique key for grouping
      const groupKey = `${normalizedName}|${normalizedPrice}|${normalizedCategory}`;
      
      if (!productGroups.has(groupKey)) {
        productGroups.set(groupKey, []);
      }
      productGroups.get(groupKey).push(product);
    });
    
    console.log(`📁 Found ${productGroups.size} unique product groups`);
    
    let totalRemoved = 0;
    
    // Process each group
    for (const [groupKey, groupProducts] of productGroups.entries()) {
      if (groupProducts.length > 1) {
        console.log(`\n📝 Processing duplicate group: ${groupKey.split('|')[0]} ($${groupProducts[0].price}, ${groupProducts[0].category})`);
        console.log(`   Found ${groupProducts.length} duplicates`);
        
        // Sort by ID to ensure consistent selection
        groupProducts.sort((a, b) => a.id.localeCompare(b.id));
        
        // Keep the first product and remove the rest
        const productsToRemove = groupProducts.slice(1);
        console.log(`   Keeping 1 product (ID: ${groupProducts[0].id}), removing ${productsToRemove.length} duplicates`);
        
        // Remove duplicates
        for (const product of productsToRemove) {
          console.log(`   🗑️ Removing duplicate product ID: ${product.id} - ${product.name}`);
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .eq('id', product.id);
          
          if (deleteError) {
            console.error(`   ❌ Failed to remove product ${product.id}:`, deleteError);
          } else {
            console.log(`   ✅ Successfully removed duplicate product ${product.id}`);
            totalRemoved++;
          }
        }
      }
    }
    
    console.log(`\n🎉 Process completed! Removed ${totalRemoved} duplicate products.`);
    
    // Final verification
    const { data: finalProducts, error: finalError } = await supabase
      .from('products')
      .select('*');
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }
    
    console.log(`✅ Final product count: ${finalProducts.length}`);
    
    // Check for remaining duplicates
    const finalGroups = new Map();
    finalProducts.forEach(product => {
      const normalizedName = (product.name || '').toLowerCase().trim();
      const normalizedPrice = parseFloat(product.price);
      const normalizedCategory = (product.category || 'uncategorized').toLowerCase().trim();
      const groupKey = `${normalizedName}|${normalizedPrice}|${normalizedCategory}`;
      
      if (!finalGroups.has(groupKey)) {
        finalGroups.set(groupKey, []);
      }
      finalGroups.get(groupKey).push(product);
    });
    
    let remainingDuplicates = 0;
    const duplicateDetails = [];
    
    for (const [groupKey, groupProducts] of finalGroups.entries()) {
      if (groupProducts.length > 1) {
        remainingDuplicates++;
        const [name, price, category] = groupKey.split('|');
        duplicateDetails.push(`- "${name}" ($${price}, ${category}) appears ${groupProducts.length} times`);
      }
    }
    
    if (remainingDuplicates > 0) {
      console.log(`\n🔍 Final verification - checking for remaining name duplicates...`);
      console.log(`📊 Found ${remainingDuplicates} remaining duplicates by name/price/category:`);
      duplicateDetails.slice(0, 10).forEach(detail => console.log(`   ${detail}`));
      if (duplicateDetails.length > 10) {
        console.log(`   ... and ${duplicateDetails.length - 10} more`);
      }
    } else {
      console.log('\n✅ No remaining duplicates found!');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

aggressiveDuplicateCleaner();