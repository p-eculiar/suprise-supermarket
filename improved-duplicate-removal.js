// Script to identify and remove duplicate products from Supabase with improved detection
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAndRemoveDuplicateProducts() {
  try {
    console.log('🔍 Searching for duplicate products with improved detection...');
    
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

    // Multiple strategies for identifying duplicates
    const duplicateGroups = [];
    const processedIds = new Set();

    // Strategy 1: Exact name matches (most common case)
    console.log('\n🔍 Checking for exact name duplicates...');
    const nameGroups = {};
    products.forEach(product => {
      const normalizedName = product.name.trim().toLowerCase();
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(product);
    });

    // Add name-based duplicates to groups
    Object.values(nameGroups).forEach(group => {
      if (group.length > 1) {
        duplicateGroups.push({
          type: 'name',
          products: group,
          key: group[0].name.trim().toLowerCase()
        });
      }
    });

    // Strategy 2: Similar name matches (fuzzy matching)
    console.log('\n🔍 Checking for similar name duplicates...');
    const checkedPairs = new Set();
    
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const productA = products[i];
        const productB = products[j];
        
        // Create a unique pair key to avoid checking the same pair twice
        const pairKey = [productA.id, productB.id].sort().join('|');
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);
        
        // Check for similar names (Levenshtein distance or substring matching)
        const nameA = productA.name.trim().toLowerCase();
        const nameB = productB.name.trim().toLowerCase();
        
        // If one name is a substring of another and they're very similar in other fields
        if ((nameA.includes(nameB) || nameB.includes(nameA)) && nameA.length > 0 && nameB.length > 0) {
          // Check if other key fields are also similar
          const priceDiff = Math.abs(productA.price - productB.price);
          const categoryA = (productA.category || '').trim().toLowerCase();
          const categoryB = (productB.category || '').trim().toLowerCase();
          const categoryMatch = categoryA === categoryB;
          
          if (priceDiff <= 5.0 && categoryMatch) { // Allow $5 price difference
            // Check if this pair is already in a group
            let foundGroup = false;
            for (const group of duplicateGroups) {
              if (group.products.some(p => p.id === productA.id || p.id === productB.id)) {
                // Add to existing group if not already there
                if (!group.products.some(p => p.id === productB.id)) {
                  group.products.push(productB);
                }
                foundGroup = true;
                break;
              }
            }
            
            if (!foundGroup) {
              duplicateGroups.push({
                type: 'similar',
                products: [productA, productB],
                key: `${nameA} ~ ${nameB}`
              });
            }
          }
        }
      }
    }

    console.log(`📊 Found ${duplicateGroups.length} groups of potentially duplicate products`);
    
    let totalDuplicatesRemoved = 0;
    let totalGroupsProcessed = 0;
    
    // Process each group of duplicates
    for (const group of duplicateGroups) {
      // Skip if all products in this group have already been processed
      if (group.products.every(p => processedIds.has(p.id))) {
        continue;
      }
      
      totalGroupsProcessed++;
      console.log(`\n📝 Processing ${group.type} duplicate group: ${group.key}`);
      console.log(`   Found ${group.products.length} potential duplicates`);
      
      // Mark all products in this group as processed
      group.products.forEach(p => processedIds.add(p.id));
      
      // Sort by created_at to keep the oldest one (first created)
      group.products.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      // Keep the first one (oldest) and remove the rest
      const duplicatesToRemove = group.products.slice(1);
      
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
    
    console.log(`\n🎉 Process completed!`);
    console.log(`   Processed ${totalGroupsProcessed} duplicate groups`);
    console.log(`   Removed ${totalDuplicatesRemoved} duplicate products.`);
    
    // Verify the cleanup by checking total count
    const { count: finalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('❌ Error getting final product count:', countError);
    } else {
      console.log(`✅ Final product count: ${finalCount}`);
    }
    
    // Additional verification - check for remaining obvious duplicates by name
    console.log('\n🔍 Final verification - checking for remaining name duplicates...');
    const { data: remainingProducts, error: remainingError } = await supabase
      .from('products')
      .select('id, name')
      .order('name');

    if (!remainingError) {
      const nameCounts = {};
      remainingProducts.forEach(product => {
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
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
findAndRemoveDuplicateProducts();