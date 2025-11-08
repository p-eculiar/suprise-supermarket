import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { supabase } from '../lib/supabase';

const DebugAuth: React.FC = () => {
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawProducts, setRawProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching products with user state:', { user, isAuthenticated, isLoading });
        
        // Test 1: Direct Supabase query
        console.log('Test 1: Direct Supabase query');
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('products')
          .select('*')
          .limit(5);
        
        console.log('Supabase query result:', { data: supabaseData, error: supabaseError });
        setRawProducts(supabaseData || []);
        
        if (supabaseError) {
          throw new Error(`Supabase error: ${supabaseError.message}`);
        }
        
        // Test 2: Product service
        console.log('Test 2: Product service');
        const serviceProducts = await productService.getAllProducts();
        console.log('Product service result:', serviceProducts);
        setProducts(serviceProducts);
        
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    if (!isLoading) {
      fetchProducts();
    }
  }, [user, isAuthenticated, isLoading]);

  const handleRefresh = async () => {
    await refreshUser();
  };

  if (isLoading) {
    return <div>Loading authentication state...</div>;
  }

  return (
    <Container>
      <h1>Authentication Debug</h1>
      
      <Section>
        <h2>User State</h2>
        <pre>{JSON.stringify({ user, isAuthenticated }, null, 2)}</pre>
        <button onClick={handleRefresh}>Refresh User</button>
      </Section>
      
      <Section>
        <h2>Product Fetching</h2>
        {error && <ErrorBox>Error: {error}</ErrorBox>}
        {loading && <div>Loading products...</div>}
        
        <h3>Raw Supabase Data ({rawProducts.length} items)</h3>
        <ProductList>
          {rawProducts.map((product, index) => (
            <ProductCard key={index}>
              <h4>{product.name}</h4>
              <p>Active: {String(product.active)}</p>
              <p>Status: {product.status}</p>
              <p>Category: {product.category}</p>
            </ProductCard>
          ))}
        </ProductList>
        
        <h3>Product Service Data ({products.length} items)</h3>
        <ProductList>
          {products.map((product, index) => (
            <ProductCard key={index}>
              <h4>{product.name}</h4>
              <p>Active: {String(product.active)}</p>
              <p>Featured: {String(product.featured)}</p>
              <p>Category: {product.category}</p>
            </ProductCard>
          ))}
        </ProductList>
      </Section>
    </Container>
  );
};

export default DebugAuth;

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Section = styled.section`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
`;

const ErrorBox = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const ProductList = styled.div`
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