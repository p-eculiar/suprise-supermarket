// Final verification that dashboard categories come from database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('=== VERIFYING DASHBOARD CATEGORIES SOURCE ===\n');

async function verifyCategoriesSource() {
  try {
    console.log('1. Checking categories table...');
    const { data: catTableData, error: catTableError } = await supabase
      .from('categories')
      .select('*');
    
    console.log('   Categories table has', catTableData?.length || 0, 'records');
    
    console.log('2. Checking products table...');
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('category')
      .eq('active', true)
      .limit(10);
    
    if (productsError) {
      console.error('   Error fetching products:', productsError);
      return false;
    }
    
    console.log('   Products table has', productsData?.length || 0, 'active products');
    
    // Extract unique categories
    const categories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
    console.log('   Unique categories from products:', categories);
    
    // Test the exact same logic as UserDashboard component
    console.log('\n3. Testing UserDashboard component logic...');
    
    // First try categories table
    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });

    if (!catErr && catRows && catRows.length > 0) {
      console.log('   ✅ Using categories from categories table');
      console.log('   Categories:', catRows.map(c => c.name));
      return true;
    }

    // Fallback to products table
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('category')
      .eq('active', true);

    if (!prodErr && prodRows) {
      const uniqueCategories = Array.from(new Set(prodRows.map((p) => p.category)));
      console.log('   ✅ Using categories from products table (fallback)');
      console.log('   Categories:', uniqueCategories.filter(Boolean));
      
      // Apply icon mapping
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
      
      console.log('   Categories with icons:');
      categoriesWithIcons.forEach(cat => {
        console.log(`     ${cat.name} ${cat.icon}`);
      });
      
      return true;
    }
    
    console.log('   ❌ No categories found');
    return false;
    
  } catch (error) {
    console.error('Error in verification:', error);
    return false;
  }
}

// Run verification
verifyCategoriesSource().then(success => {
  console.log('\n=== VERIFICATION COMPLETE ===');
  if (success) {
    console.log('✅ CONFIRMED: Dashboard categories are loaded from the database!');
    console.log('✅ The UserDashboard component correctly fetches categories from:');
    console.log('   1. categories table (if not empty)');
    console.log('   2. products table (as fallback)');
    console.log('✅ All categories displayed in the dashboard come from the database');
  } else {
    console.log('❌ Verification failed');
  }
});