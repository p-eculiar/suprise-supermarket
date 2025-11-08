// Simple test to verify categories are loaded from database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDashboardCategories() {
  console.log('=== TESTING DASHBOARD CATEGORIES LOADING ===\n');
  
  // Simulate the exact logic from UserDashboard component
  console.log('1. Trying categories table...');
  const { data: catRows, error: catErr } = await supabase
    .from('categories')
    .select('name')
    .order('name', { ascending: true });

  if (!catErr && catRows && catRows.length > 0) {
    console.log('✅ Found categories in categories table');
    console.log('   Categories:', catRows.map(c => c.name));
    return;
  }

  console.log('2. Falling back to products table...');
  const { data: prodRows, error: prodErr } = await supabase
    .from('products')
    .select('category')
    .eq('active', true);

  if (!prodErr && prodRows) {
    const uniqueCategories = Array.from(new Set(prodRows.map((p) => p.category)));
    console.log('✅ Found categories in products table');
    console.log('   Unique categories:', uniqueCategories.filter(Boolean));
    
    // Apply the same icon mapping as in the component
    const iconMap = {
      'vegetables': '🥬',
      'fruits': '🍎',
      'dairy': '🥛',
      'meat': '🍖',
      'bakery': '🍞',
      'beverages': '🥤',
      'snacks': '🍿',
      'frozen': '❄️',
      'organic': '🌿',
      'pantry': '🥫',
      'seafood': '🐟',
      'personal care': '🧴',
      'cleaning': '🧼',
      'pet supplies': '🐾',
      'health foods': '💪',
      'international foods': '🌍',
      'condiments': '🧂',
      'canned goods': '🥫'
    };

    const categoriesWithIcons = uniqueCategories.map(cat => ({
      name: cat,
      icon: iconMap[cat ? cat.toLowerCase() : ''] || '🛍️'
    })).filter(cat => cat.name);
    
    console.log('✅ Final categories with icons:');
    categoriesWithIcons.forEach(cat => {
      console.log(`   ${cat.name} ${cat.icon}`);
    });
    
    return categoriesWithIcons;
  }
  
  console.log('❌ No categories found in either table');
  return [];
}

// Run the test
testDashboardCategories().then(result => {
  console.log('\n=== TEST COMPLETE ===');
  if (result && result.length > 0) {
    console.log('✅ Categories are successfully loaded from the database!');
    console.log('📋 This confirms that the dashboard categories are coming from the database.');
  } else {
    console.log('❌ Failed to load categories from database.');
  }
});