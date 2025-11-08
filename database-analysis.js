const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from your .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function comprehensiveAnalysis() {
  console.log('=== COMPREHENSIVE DATABASE ANALYSIS ===\n');
  
  try {
    // 1. Check total products count
    console.log('1. TOTAL PRODUCTS COUNT:');
    const { count: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting products:', countError);
    } else {
      console.log(`   Total products: ${totalCount}`);
    }
    
    // 2. Check products structure
    console.log('\n2. PRODUCT STRUCTURE ANALYSIS:');
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('products')
      .select('*')
      .limit(3);
    
    if (sampleError) {
      console.error('Error fetching sample products:', sampleError);
    } else {
      if (sampleProducts && sampleProducts.length > 0) {
        console.log('   Sample product structure:');
        Object.keys(sampleProducts[0]).forEach(key => {
          console.log(`     ${key}: ${typeof sampleProducts[0][key]} = ${JSON.stringify(sampleProducts[0][key]).substring(0, 50)}${JSON.stringify(sampleProducts[0][key]).length > 50 ? '...' : ''}`);
        });
      }
    }
    
    // 3. Check categories
    console.log('\n3. CATEGORY ANALYSIS:');
    const { data: allCategories, error: categoriesError } = await supabase
      .from('products')
      .select('category');
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    } else {
      if (allCategories && allCategories.length > 0) {
        const categories = allCategories.map(p => p.category);
        const uniqueCategories = [...new Set(categories.filter(cat => cat && cat.trim() !== ''))];
        console.log(`   Total category entries: ${categories.length}`);
        console.log(`   Unique categories: ${uniqueCategories.length}`);
        console.log('   Categories list:', uniqueCategories.sort());
        
        // Check for case sensitivity issues
        const lowerCaseCategories = uniqueCategories.map(c => c.toLowerCase());
        const uniqueLowerCase = [...new Set(lowerCaseCategories)];
        if (uniqueLowerCase.length !== uniqueCategories.length) {
          console.log('   ⚠️  WARNING: Case sensitivity issues detected in categories');
        }
      }
    }
    
    // 4. Check featured products
    console.log('\n4. FEATURED PRODUCTS ANALYSIS:');
    const { count: featuredCount, error: featuredCountError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('featured', true);
    
    if (featuredCountError) {
      console.error('Error counting featured products:', featuredCountError);
    } else {
      console.log(`   Featured products count: ${featuredCount}`);
    }
    
    const { data: featuredProducts, error: featuredError } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(3);
    
    if (featuredError) {
      console.error('Error fetching featured products:', featuredError);
    } else {
      console.log(`   Sample featured products: ${featuredProducts ? featuredProducts.length : 0}`);
      if (featuredProducts && featuredProducts.length > 0) {
        featuredProducts.forEach((p, i) => {
          console.log(`     ${i+1}. ${p.name} (Category: ${p.category}, Featured: ${p.featured})`);
        });
      }
    }
    
    // 5. Check bestsellers
    console.log('\n5. BESTSELLER ANALYSIS:');
    const { data: bestsellers, error: bestsellerError } = await supabase
      .from('products')
      .select('*')
      .order('rating', { ascending: false })
      .limit(3);
    
    if (bestsellerError) {
      console.error('Error fetching bestsellers:', bestsellerError);
    } else {
      console.log(`   Sample bestsellers: ${bestsellers ? bestsellers.length : 0}`);
      if (bestsellers && bestsellers.length > 0) {
        bestsellers.forEach((p, i) => {
          console.log(`     ${i+1}. ${p.name} (Rating: ${p.rating}, Category: ${p.category})`);
        });
      }
    }
    
    // 6. Check popular products
    console.log('\n6. POPULAR PRODUCTS ANALYSIS:');
    const { data: popular, error: popularError } = await supabase
      .from('products')
      .select('*')
      .order('stock', { ascending: false })
      .limit(3);
    
    if (popularError) {
      console.error('Error fetching popular products:', popularError);
    } else {
      console.log(`   Sample popular products: ${popular ? popular.length : 0}`);
      if (popular && popular.length > 0) {
        popular.forEach((p, i) => {
          console.log(`     ${i+1}. ${p.name} (Stock: ${p.stock}, Category: ${p.category})`);
        });
      }
    }
    
    // 7. Check specific issues
    console.log('\n7. SPECIFIC ISSUE CHECKS:');
    
    // Check if products have image_url field
    if (sampleProducts && sampleProducts.length > 0) {
      const hasImageUrl = 'image_url' in sampleProducts[0];
      const hasImages = 'images' in sampleProducts[0];
      console.log(`   Has image_url field: ${hasImageUrl}`);
      console.log(`   Has images field: ${hasImages}`);
      
      if (hasImageUrl) {
        console.log(`   Sample image_url: ${sampleProducts[0].image_url.substring(0, 50)}...`);
      }
    }
    
    // Check featured field type
    if (sampleProducts && sampleProducts.length > 0) {
      console.log(`   Featured field type: ${typeof sampleProducts[0].featured}`);
      console.log(`   Sample featured value: ${sampleProducts[0].featured}`);
    }
    
  } catch (error) {
    console.error('Database analysis error:', error);
  }
  
  console.log('\n=== ANALYSIS COMPLETE ===');
}

comprehensiveAnalysis();