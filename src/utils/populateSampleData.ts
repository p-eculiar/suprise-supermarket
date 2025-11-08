import { supabase } from '../lib/supabase';

// Sample products data
const sampleProducts = [
  // Vegetables
  {
    name: 'Organic Tomatoes',
    description: 'Fresh, juicy organic tomatoes perfect for salads and cooking',
    category: 'vegetables',
    price: 5.99,
    compare_price: 6.99,
    stock: 150,
    sku: 'VEG-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=500&auto=format&fit=crop&q=80'],
    tags: ['organic', 'fresh', 'vegetables'],
    featured: true,
    active: false,
    rating: 4.8,
    discount: 0
  },
  {
    name: 'Fresh Lettuce',
    description: 'Crisp green lettuce, perfect for fresh salads',
    category: 'vegetables',
    price: 3.49,
    compare_price: 4.49,
    stock: 200,
    sku: 'VEG-002',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&auto=format&fit=crop&q=80'],
    tags: ['fresh', 'vegetables', 'salad'],
    featured: true,
    active: true,
    rating: 4.5,
    discount: 10
  },
  // Fruits
  {
    name: 'Fresh Strawberries',
    description: 'Sweet, juicy strawberries - perfect for desserts',
    category: 'fruits',
    price: 6.99,
    compare_price: 8.99,
    stock: 100,
    sku: 'FRU-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=500&auto=format&fit=crop&q=80'],
    tags: ['fresh', 'fruits', 'berries'],
    featured: true,
    active: true,
    rating: 5.0,
    discount: 20
  },
  {
    name: 'Organic Bananas',
    description: 'Ripe organic bananas, great source of potassium',
    category: 'fruits',
    price: 3.99,
    compare_price: 4.99,
    stock: 250,
    sku: 'FRU-002',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=80'],
    tags: ['organic', 'fruits', 'potassium'],
    featured: false,
    active: true,
    rating: 4.8,
    discount: 0
  },
  // Dairy
  {
    name: 'Fresh Whole Milk',
    description: 'Farm-fresh whole milk, vitamin D fortified',
    category: 'dairy',
    price: 4.99,
    compare_price: 5.99,
    stock: 200,
    sku: 'DAI-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500&auto=format&fit=crop&q=80'],
    tags: ['dairy', 'milk', 'farm-fresh'],
    featured: true,
    active: true,
    rating: 4.9,
    discount: 0
  },
  // Bakery
  {
    name: 'Whole Wheat Bread',
    description: 'Freshly baked whole wheat bread loaf',
    category: 'bakery',
    price: 4.49,
    compare_price: 5.49,
    stock: 80,
    sku: 'BAK-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'],
    tags: ['bakery', 'bread', 'whole-wheat'],
    featured: true,
    active: false,
    rating: 4.6,
    discount: 0
  },
  // Meat
  {
    name: 'Fresh Chicken Breast',
    description: 'Boneless, skinless chicken breast, per lb',
    category: 'meat',
    price: 12.99,
    compare_price: 14.99,
    stock: 80,
    sku: 'MEA-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500&auto=format&fit=crop&q=80'],
    tags: ['meat', 'chicken', 'protein'],
    featured: false,
    active: true,
    rating: 4.7,
    discount: 0
  },
  // Beverages
  {
    name: 'Orange Juice',
    description: 'Fresh-squeezed orange juice, no added sugar (1L)',
    category: 'beverages',
    price: 7.99,
    compare_price: 9.99,
    stock: 100,
    sku: 'BEV-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&auto=format&fit=crop&q=80'],
    tags: ['beverages', 'juice', 'orange'],
    featured: false,
    active: true,
    rating: 4.8,
    discount: 0
  },
  // Snacks
  {
    name: 'Organic Chips',
    description: 'Kettle-cooked organic potato chips',
    category: 'snacks',
    price: 5.49,
    compare_price: 6.49,
    stock: 150,
    sku: 'SNA-001',
    status: 'active',
    images: ['https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80'],
    tags: ['snacks', 'chips', 'organic'],
    featured: false,
    active: true,
    rating: 4.7,
    discount: 0
  }
];

export async function populateSampleData() {
  try {
    console.log('Starting sample data population process...');
    
    // Check what's currently in the database
    const { data: existingData, error: countError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    console.log('Existing data check:', { existingData, countError });

    // If there's an error or no data, insert sample data
    if (countError || !existingData || existingData.length === 0) {
      console.log('Attempting to insert sample products...');
      console.log('Sample products data:', sampleProducts);
      
      // Insert sample products
      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Error inserting sample data:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return false;
      }

      console.log('Sample data inserted successfully');
    } else {
      console.log('Products already exist in database, skipping insertion');
    }
    
    // Verify what's in the database by fetching categories
    const { data: categories, error: categoriesError } = await supabase
      .from('products')
      .select('category');

    console.log('Categories query result:', { categories, categoriesError });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return false;
    }

    // Handle case where data might be null or undefined
    if (!categories) {
      console.log('No categories data returned');
      return false;
    }

    // Extract unique categories
    const filteredCategories = categories
      .map((product: any) => product.category)
      .filter((cat: any) => cat && cat.trim() !== '');
    
    const categorySet = new Set(filteredCategories);
    const uniqueCategories: string[] = Array.from(categorySet);
    
    console.log('Categories in database:', uniqueCategories);
    return uniqueCategories.length > 0;
  } catch (error) {
    console.error('Error in populateSampleData:', error);
    return false;
  }
}
