// Script to identify duplicate products without removing them
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkForDuplicateProducts() {
  try {
    console.log('🔍 Analyzing products for duplicates...');
    
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

    // Strategy 1: Exact name matches
    console.log('\n🔍 Checking for exact name duplicates...');
    const nameGroups = {};
    products.forEach(product => {
      const normalizedName = product.name.trim().toLowerCase();
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(product);
    });

    // Find and display name-based duplicates
    const nameDuplicates = Object.entries(nameGroups).filter(([name, group]) => group.length > 1);
    
    console.log(`📊 Found ${nameDuplicates.length} exact name duplicate groups:`);
    
    nameDuplicates.forEach(([name, group]) => {
      console.log(`\n📝 Duplicate group for: "${name}" (${group.length} items)`);
      group.forEach((product, index) => {
        console.log(`   ${index + 1}. ID: ${product.id} | Price: $${product.price} | Category: ${product.category || 'null'} | Created: ${product.created_at}`);
      });
    });
    
    // Strategy 2: Similar names (fuzzy matching)
    console.log('\n🔍 Checking for similar name duplicates...');
    const similarGroups = [];
    const checkedPairs = new Set();
    
    for (let i = 0; i < products.length; i++) {
      for (let j = i + 1; j < products.length; j++) {
        const productA = products[i];
        const productB = products[j];
        
        // Create a unique pair key to avoid checking the same pair twice
        const pairKey = [productA.id, productB.id].sort().join('|');
        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);
        
        // Check for similar names
        const nameA = productA.name.trim().toLowerCase();
        const nameB = productB.name.trim().toLowerCase();
        
        // If one name is a substring of another
        if ((nameA.includes(nameB) || nameB.includes(nameA)) && nameA.length > 0 && nameB.length > 0) {
          // Check if other key fields are also similar
          const priceDiff = Math.abs(productA.price - productB.price);
          const categoryA = (productA.category || '').trim().toLowerCase();
          const categoryB = (productB.category || '').trim().toLowerCase();
          const categoryMatch = categoryA === categoryB;
          
          if (priceDiff <= 5.0 && categoryMatch) {
            similarGroups.push({
              productA,
              productB,
              similarity: 'substring match with similar price/category'
            });
          }
        }
      }
    }
    
    console.log(`📊 Found ${similarGroups.length} similar name pairs:`);
    
    similarGroups.slice(0, 20).forEach((pair, index) => {
      console.log(`\n📝 Similar pair ${index + 1}:`);
      console.log(`   A: "${pair.productA.name}" (ID: ${pair.productA.id}) - $${pair.productA.price} | ${pair.productA.category || 'null'}`);
      console.log(`   B: "${pair.productB.name}" (ID: ${pair.productB.id}) - $${pair.productB.price} | ${pair.productB.category || 'null'}`);
      console.log(`   Reason: ${pair.similarity}`);
    });
    
    if (similarGroups.length > 20) {
      console.log(`\n... and ${similarGroups.length - 20} more similar pairs`);
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   - Total products: ${products.length}`);
    console.log(`   - Exact name duplicates: ${nameDuplicates.length} groups`);
    console.log(`   - Similar name pairs: ${similarGroups.length} pairs`);
    
    // Show some sample duplicates for review
    if (nameDuplicates.length > 0) {
      console.log('\n📋 SAMPLE EXACT DUPLICATES (first 5 groups):');
      nameDuplicates.slice(0, 5).forEach(([name, group]) => {
        console.log(`   "${name}" (${group.length} copies)`);
      });
    }
    
    if (similarGroups.length > 0) {
      console.log('\n📋 SAMPLE SIMILAR PRODUCTS (first 5 pairs):');
      similarGroups.slice(0, 5).forEach(pair => {
        console.log(`   "${pair.productA.name}" ↔ "${pair.productB.name}"`);
      });
    }
    
    console.log('\n💡 To remove these duplicates, run the improved-duplicate-removal.js script');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
checkForDuplicateProducts();