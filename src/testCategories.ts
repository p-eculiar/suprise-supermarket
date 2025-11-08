import { productService } from './services/productService';

// Test function to check categories
async function testCategories() {
  try {
    console.log('Fetching categories...');
    const categories = await productService.getCategories();
    console.log('Categories found:', categories);
    
    console.log('Fetching all products...');
    const products = await productService.getAllProducts();
    console.log('Total products:', products.length);
    
    if (products.length > 0) {
      console.log('First product:', products[0]);
    }
    
    console.log('Fetching product count by category...');
    const categoryCounts = await productService.getProductCountByCategory();
    console.log('Category counts:', categoryCounts);
  } catch (error) {
    console.error('Error testing categories:', error);
  }
}

// Run the test
testCategories();