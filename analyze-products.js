// Script to analyze product database structure and filter options
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyzeProducts() {
  try {
    console.log('🔍 Analyzing product database...');
    
    // Get all distinct categories and counts
    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('category');

    if (categoriesError) {
      console.error('❌ Error fetching categories:', categoriesError);
      return;
    }

    // Count products per category
    const categoryCounts = {};
    categories.forEach(product => {
      const category = product.category ? product.category.trim() : 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    console.log('\n📊 Categories and counts:');
    Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`${category}: ${count}`);
      });
    
    // Get price range
    const { data: priceData, error: priceError } = await supabase
      .from('products')
      .select('price');

    if (priceError) {
      console.error('❌ Error fetching price data:', priceError);
      return;
    }

    const prices = priceData.map(p => p.price);
    console.log(`\n💰 Price range: $${Math.min(...prices)} - $${Math.max(...prices)}`);
    
    // Get rating distribution
    const { data: ratingData, error: ratingError } = await supabase
      .from('products')
      .select('rating');

    if (ratingError) {
      console.error('❌ Error fetching rating data:', ratingError);
      return;
    }

    const ratings = ratingData.map(p => Math.floor(p.rating));
    const ratingCounts = {};
    ratings.forEach(rating => {
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    console.log('\n⭐ Rating distribution:');
    Object.entries(ratingCounts)
      .sort(([a], [b]) => b - a)
      .forEach(([rating, count]) => {
        console.log(`${rating} stars: ${count}`);
      });
    
    console.log('\n📦 Stock status and other filters would need additional database fields');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the analysis
analyzeProducts();