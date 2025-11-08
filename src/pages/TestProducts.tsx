import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { productService } from '../services/productService';
import { supabase } from '../lib/supabase';

const TestProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [supabaseTest, setSupabaseTest] = useState<any>(null);

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
        }
        
        setSupabaseTest({ data: supabaseData, error: supabaseError });
        
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

  return (
    <Container>
      <h1>Product Loading Test</h1>
      
      {error && <ErrorBox>Error: {error}</ErrorBox>}
      
      <Section>
        <h2>Direct Supabase Query</h2>
        <p>Status: {supabaseTest?.error ? 'Error' : 'Success'}</p>
        {supabaseTest?.error && <p>Error: {supabaseTest.error.message}</p>}
        <p>Products found: {supabaseTest?.data?.length || 0}</p>
      </Section>
      
      <Section>
        <h2>Product Service</h2>
        <p>Products found: {products.length}</p>
        
        <h3>Sample Products:</h3>
        <ProductGrid>
          {products.slice(0, 3).map(product => (
            <ProductCard key={product.id}>
              <h4>{product.name}</h4>
              <p>Category: {product.category}</p>
              <p>Price: ${product.price}</p>
              {product.image_url && (
                <img src={product.image_url} alt={product.name} style={{ width: '100%' }} />
              )}
            </ProductCard>
          ))}
        </ProductGrid>
      </Section>
      
      <Section>
        <h2>Categories</h2>
        <p>Categories found: {categories.length}</p>
        <CategoryList>
          {categories.map((category, index) => (
            <CategoryItem key={index}>{category}</CategoryItem>
          ))}
        </CategoryList>
      </Section>
    </Container>
  );
};

export default TestProducts;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const ErrorBox = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ProductCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 1rem;
`;

const CategoryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const CategoryItem = styled.span`
  background-color: #e3f2fd;
  padding: 0.5rem;
  border-radius: 4px;
`;