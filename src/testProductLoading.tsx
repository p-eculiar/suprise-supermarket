import React, { useEffect, useState } from 'react';
import { productService } from './services/productService';
import { supabase } from './lib/supabase';

const TestProductLoading: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const testProductLoading = async () => {
      try {
        setLoading(true);
        console.log('Testing product loading...');
        
        // Test 1: Direct Supabase query
        console.log('Test 1: Direct Supabase query');
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('products')
          .select('id, name, category, price, image_url')
          .limit(5);
        
        console.log('Supabase query result:', { data: supabaseData, error: supabaseError });
        
        if (supabaseError) {
          console.error('Supabase error:', supabaseError);
          setError(`Supabase error: ${supabaseError.message}`);
          return;
        }
        
        // Test 2: Product service getAllProducts
        console.log('Test 2: Product service getAllProducts');
        const serviceProducts = await productService.getAllProducts();
        console.log('Product service result:', serviceProducts);
        setProducts(serviceProducts);
        
        // Test 3: Categories
        console.log('Test 3: Loading categories');
        const serviceCategories = await productService.getCategories();
        console.log('Categories result:', serviceCategories);
        setCategories(serviceCategories);
        
      } catch (err) {
        console.error('Test error:', err);
        setError(`Test error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    testProductLoading();
  }, []);

  if (loading) {
    return <div>Testing product loading...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Product Loading Test</h2>
      <p>Products found: {products.length}</p>
      <p>Categories found: {categories.length}</p>
      
      <h3>Sample Products:</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {products.slice(0, 3).map(product => (
          <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '200px' }}>
            <h4>{product.name}</h4>
            <p>Category: {product.category}</p>
            <p>Price: ${product.price}</p>
            {product.image_url && (
              <img src={product.image_url} alt={product.name} style={{ width: '100%' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestProductLoading;