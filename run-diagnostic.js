// Script to run diagnostic queries against your Supabase database
// Save this as run-diagnostic.js and run with: node run-diagnostic.js

const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL === 'YOUR_SUPABASE_URL' || SUPABASE_KEY === 'YOUR_SUPABASE_ANON_KEY') {
  console.error('Please set your Supabase credentials in the environment variables or edit this file directly.');
  console.error('Set SUPABASE_URL and SUPABASE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function runDiagnostic() {
  console.log('🔍 Running diagnostic checks on your Supabase database...\n');

  try {
    // 1. Check categories table
    console.log('1. Checking categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('name, image_url')
      .order('name');
    
    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError.message);
    } else {
      console.log(`✅ Found ${categories.length} categories in categories table:`);
      categories.forEach(cat => {
        console.log(`   - ${cat.name}${cat.image_url ? ` (${cat.image_url})` : ''}`);
      });
    }

    // 2. Check product categories
    console.log('\n2. Checking product categories...');
    const { data: productCategories, error: productCategoriesError } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null)
      .neq('category', '')
      .neq('category', ' ');

    if (productCategoriesError) {
      console.error('❌ Error fetching product categories:', productCategoriesError.message);
    } else {
      // Count unique categories
      const categoryCounts = {};
      productCategories.forEach(p => {
        const cat = p.category.trim();
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      console.log(`✅ Found ${Object.keys(categoryCounts).length} unique categories in products:`);
      Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`   - ${category} (${count} products)`);
        });
    }

    // 3. Check products without categories
    console.log('\n3. Checking products without categories...');
    const { data: uncategorizedProducts, error: uncategorizedError } = await supabase
      .from('products')
      .select('id, name, category, active')
      .or('category.is.null,category.eq.,category.eq. ');

    if (uncategorizedError) {
      console.error('❌ Error fetching uncategorized products:', uncategorizedError.message);
    } else {
      console.log(`✅ Found ${uncategorizedProducts.length} products without categories:`);
      uncategorizedProducts.slice(0, 10).forEach(p => {
        console.log(`   - ${p.name} (ID: ${p.id}, Active: ${p.active})`);
      });
      if (uncategorizedProducts.length > 10) {
        console.log(`   ... and ${uncategorizedProducts.length - 10} more`);
      }
    }

    // 4. Overall product statistics
    console.log('\n4. Overall product statistics...');
    const { count: totalProducts, error: totalError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    const { count: categorizedProducts, error: categorizedError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .not('category', 'is', null)
      .neq('category', '')
      .neq('category', ' ');

    const { count: activeProducts, error: activeError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    if (totalError || categorizedError || activeError) {
      console.error('❌ Error fetching product statistics:');
      if (totalError) console.error('   Total products error:', totalError.message);
      if (categorizedError) console.error('   Categorized products error:', categorizedError.message);
      if (activeError) console.error('   Active products error:', activeError.message);
    } else {
      const uncategorizedCount = totalProducts - categorizedProducts;
      console.log(`📊 Product Statistics:`);
      console.log(`   Total products: ${totalProducts}`);
      console.log(`   Products with categories: ${categorizedProducts}`);
      console.log(`   Products without categories: ${uncategorizedCount}`);
      console.log(`   Active products: ${activeProducts}`);
      console.log(`   Inactive products: ${totalProducts - activeProducts}`);
    }

    console.log('\n✅ Diagnostic complete!');
  } catch (error) {
    console.error('❌ Unexpected error during diagnostic:', error.message);
    process.exit(1);
  }
}

// Run the diagnostic
runDiagnostic();