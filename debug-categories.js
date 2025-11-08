const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugCategories() {
  console.log('=== DEBUGGING CATEGORIES ===');
  
  try {
    // Get all products to see what categories we have
    console.log('\n1. Getting all products with categories...');
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select('id, name, category, active')
      .limit(20);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return;
    }

    console.log('Sample products:', allProducts.slice(0, 5));
    
    // Extract unique categories
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
    console.log('\n2. Unique categories found:', categories);
    
    // Test the icon mapping logic
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
    
    console.log('\n3. Testing icon mapping...');
    const categoriesWithIcons = categories.map(cat => {
      const icon = iconMap[cat.toLowerCase()] || '🛍️';
      console.log(`  ${cat} -> ${icon}`);
      return { name: cat, icon };
    });
    
    console.log('\n4. Final categories with icons:', categoriesWithIcons);
    
    // Check if categories table exists and has data
    console.log('\n5. Checking categories table...');
    const { data: catTableData, error: catTableError } = await supabase
      .from('categories')
      .select('*');
    
    console.log('Categories table data:', catTableData);
    console.log('Categories table error:', catTableError);
    
  } catch (error) {
    console.error('Error in debug:', error);
  }
}

debugCategories();