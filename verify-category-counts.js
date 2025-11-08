const { createClient } = require('@supabase/supabase-js');

// Supabase credentials from .env file
const supabaseUrl = 'https://awepkphahdheqomgucby.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyCategoryCounts() {
  console.log('Verifying category counts...');
  
  try {
    // Get all products and count by category
    console.log('\n1. Getting all products and counting by category:');
    const { data: prodRows, error: prodErr } = await supabase
      .from('products')
      .select('category, id')
      .eq('active', true);
    
    if (prodErr) {
      console.error('Error fetching products:', prodErr);
      return;
    }
    
    const counts = new Map();
    prodRows?.forEach(p => {
      const category = p.category;
      counts.set(category, (counts.get(category) || 0) + 1);
    });
    
    console.log('Product counts by category:', Object.fromEntries(counts));
    
    // Get categories from categories table
    console.log('\n2. Getting categories from categories table:');
    const { data: catRows, error: catErr } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });
    
    if (catErr) {
      console.error('Error fetching categories:', catErr);
      return;
    }
    
    console.log('Categories from table:', catRows.map(c => c.name));
    
    // Combine and show what would be displayed
    console.log('\n3. Categories that would be displayed with counts:');
    const displayCategories = catRows
      .filter(cat => counts.get(cat.name) && counts.get(cat.name) > 0)
      .map(cat => ({
        name: cat.name,
        count: counts.get(cat.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    displayCategories.forEach(cat => {
      console.log(`  ${cat.name}: ${cat.count} products`);
    });
    
    console.log(`\nTotal displayable categories: ${displayCategories.length}`);
    
    // Show categories without products
    console.log('\n4. Categories without products (filtered out):');
    const emptyCategories = catRows
      .filter(cat => !counts.get(cat.name) || counts.get(cat.name) === 0)
      .map(cat => cat.name);
    
    if (emptyCategories.length > 0) {
      emptyCategories.forEach(cat => {
        console.log(`  ${cat}: 0 products`);
      });
    } else {
      console.log('  None');
    }
    
    console.log('\nVerification completed successfully!');
  } catch (error) {
    console.error('Error during verification:', error);
  }
}

verifyCategoryCounts();