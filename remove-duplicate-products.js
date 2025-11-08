// Script to identify and remove duplicate products from Supabase with enhanced detection
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAndRemoveDuplicateProducts() {
  try {
    console.log('🔍 Searching for duplicate products with enhanced detection...');
    
    // First, get all products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock, rating, featured, active, created_at, discount')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Found ${products.length} products in database`);

    // Enhanced grouping strategy with normalized names
    const productGroups = {};
    
    products.forEach(product => {
      // Create a more robust key based on normalized important fields
      const normalizedName = product.name.trim().toLowerCase();
      const normalizedCategory = (product.category || '').trim().toLowerCase();
      const roundedPrice = Math.round(product.price * 100) / 100; // Round to 2 decimal places
      
      // Use normalized name as primary key for grouping
      const key = normalizedName;
      
      if (!productGroups[key]) {
        productGroups[key] = [];
      }
      productGroups[key].push({
        ...product,
        normalizedKey: key,
        normalizedCategory,
        roundedPrice
      });
    });

    // Find duplicates (groups with more than one product)
    const duplicates = Object.values(productGroups).filter(group => group.length > 1);
    
    console.log(`📊 Found ${duplicates.length} groups of duplicate products by name`);
    
    let totalDuplicatesRemoved = 0;
    
    // Process each group of duplicates
    for (const group of duplicates) {
      console.log(`\n📝 Processing duplicate group: ${group[0].name}`);
      console.log(`   Found ${group.length} duplicates`);
      
      // Sort by created_at to keep the oldest one (first created)
      group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Keep the first one (oldest) and remove the rest
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
    
    // Second pass: Check for similar names that might have been missed
    console.log('\n🔍 Performing second pass for similar name duplicates...');
    const similarDuplicates = [];
    const processedNames = new Set();
    
    // Get all products again after first pass
    const { data: remainingProducts, error: remainingError } = await supabase
      .from('products')
      .select('id, name, description, price, category, image_url, stock, rating, featured, active, created_at, discount')
      .order('name');

    if (!remainingError) {
      for (let i = 0; i < remainingProducts.length; i++) {
        const productA = remainingProducts[i];
        const normalizedNameA = productA.name.trim().toLowerCase();
        
        // Skip if we've already processed this name
        if (processedNames.has(normalizedNameA)) continue;
        processedNames.add(normalizedNameA);
        
        // Look for similar names
        for (let j = i + 1; j < remainingProducts.length; j++) {
          const productB = remainingProducts[j];
          const normalizedNameB = productB.name.trim().toLowerCase();
          
          // Check if one name is a substring of another
          if ((normalizedNameA.includes(normalizedNameB) && normalizedNameB.length > 3) || 
              (normalizedNameB.includes(normalizedNameA) && normalizedNameA.length > 3)) {
            
            // Check if they're in the same category and have similar prices
            const categoryA = (productA.category || '').trim().toLowerCase();
            const categoryB = (productB.category || '').trim().toLowerCase();
            const priceDiff = Math.abs(productA.price - productB.price);
            
            if (categoryA === categoryB && priceDiff <= 5.0) {
              // Found a similar pair
              similarDuplicates.push([productA, productB]);
              processedNames.add(normalizedNameB);
              break; // Move to next productA
            }
          }
        }
      }
      
      console.log(`📊 Found ${similarDuplicates.length} similar name pairs in second pass`);
      
      // Remove similar duplicates (keep the one with earlier created_at)
      for (const [productA, productB] of similarDuplicates) {
        // Determine which one to keep (earlier created_at)
        const keepProduct = new Date(productA.created_at) < new Date(productB.created_at) ? productA : productB;
        const removeProduct = keepProduct.id === productA.id ? productB : productA;
        
        console.log(`\n📝 Processing similar pair:`);
        console.log(`   Keeping: ${keepProduct.name} (ID: ${keepProduct.id})`);
        console.log(`   Removing: ${removeProduct.name} (ID: ${removeProduct.id})`);
        
        const { error: deleteError } = await supabase
          .from('products')
          .delete()
          .eq('id', removeProduct.id);
          
        if (deleteError) {
          console.error(`   ❌ Failed to remove product ${removeProduct.id}:`, deleteError);
        } else {
          console.log(`   ✅ Successfully removed similar duplicate product ${removeProduct.id}`);
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
      .select('id, name')
      .order('name');

    if (!finalError) {
      const nameCounts = {};
      finalProducts.forEach(product => {
        const normalizedName = product.name.trim().toLowerCase();
        nameCounts[normalizedName] = (nameCounts[normalizedName] || 0) + 1;
      });
      
      const remainingDuplicates = Object.entries(nameCounts).filter(([name, count]) => count > 1);
      console.log(`📊 Found ${remainingDuplicates.length} remaining name duplicates:`);
      remainingDuplicates.slice(0, 10).forEach(([name, count]) => {
        console.log(`   - "${name}" appears ${count} times`);
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
findAndRemoveDuplicateProducts();