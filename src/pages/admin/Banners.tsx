import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../../hooks/useRealtime';
import { FiRefreshCw } from 'react-icons/fi';
import { FormLoader } from '../../components/common/GranularLoading';

type BannerSlot = 'left' | 'right';

interface ProductLite {
  id: string;
  name: string;
  image_url: string;
  category: string;
}

interface BannerRecord {
  slot: BannerSlot;
  product_id: string;
}

const AdminBanners: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Define the fetch function for products with images
  const fetchProductsWithImages = async (): Promise<ProductLite[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, image_url, category')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    if (error) throw error;
    return data || [];
  };

  const {
    data: products = [],
    isLoading: productsLoading,
    refetch: refetchProducts,
  } = useQuery<ProductLite[]>({
    queryKey: ['products-with-images'],
    queryFn: fetchProductsWithImages,
  });

  const { data: banners = [], isLoading: bannersLoading, refetch: refetchBanners } = useQuery<BannerRecord[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const { data, error } = await supabase.from('banners').select('slot,product_id');
      if (error) return [];
      return (data || []) as any;
    }
  });

  // Realtime: refresh products and banners when they change
  useRealtime<any>({
    table: 'products',
    events: ['INSERT','UPDATE','DELETE'],
    onEvent: () => queryClient.invalidateQueries({ queryKey: ['banner-products'] }),
    channelName: 'banners-products',
  });
  useRealtime<any>({
    table: 'banners',
    events: ['INSERT','UPDATE','DELETE'],
    onEvent: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
    channelName: 'banners-live',
  });

  const bannerMap = useMemo(() => {
    const map: Record<BannerSlot, string | null> = { left: null, right: null };
    for (const b of banners) map[b.slot] = b.product_id;
    return map;
  }, [banners]);

  const upsertBanner = useMutation({
    mutationFn: async (payload: { slot: BannerSlot; product_id: string }) => {
      const { error } = await supabase.from('banners').upsert(payload, { onConflict: 'slot' });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] })
  });

  // Add refresh function
  const handleRefresh = () => {
    refetchProducts();
    refetchBanners();
  };

  return (
    <Container>
      {(productsLoading || bannersLoading) && !banners.length ? (
        <>
          <Header>
            <Title>Banners Manager</Title>
          </Header>
          <FormLoader fields={2} />
        </>
      ) : (
        <>
      <Header>
        <Title>Banners Manager</Title>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </HeaderActions>
        <Subtitle>Choose which products power the homepage promo banners</Subtitle>
      </Header>

      {products.length === 0 ? (
        <EmptyState>
          <EmptyText>No products available with images.</EmptyText>
          <EmptySubtext>Add products with images to configure banners.</EmptySubtext>
          <RefreshButton onClick={() => refetchProducts()} style={{ marginTop: '1rem' }}>
            <FiRefreshCw /> Refresh Products
          </RefreshButton>
        </EmptyState>
      ) : (
        <Grid>
          {(['left','right'] as BannerSlot[]).map((slot) => (
            <Card key={slot}>
              <CardHeader>
                <h3>{slot === 'left' ? 'Left Banner' : 'Right Banner'}</h3>
              </CardHeader>
              <Body>
                <Select
                  value={bannerMap[slot] || ''}
                  onChange={(e) => upsertBanner.mutate({ slot, product_id: e.target.value })}
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                  ))}
                </Select>
                {bannerMap[slot] && (
                  <Preview>
                    <img
                      src={products.find(p => p.id === bannerMap[slot!])?.image_url}
                      alt="Preview"
                      loading="lazy"
                    />
                  </Preview>
                )}
              </Body>
            </Card>
          ))}
        </Grid>
      )}
      </>
      )}
    </Container>
  );
};

export default AdminBanners;

const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Header = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0; 
  font-size: 1.75rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  margin: 0.25rem 0 0; 
  color: #636E72;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Grid = styled.div`
  display: grid; 
  grid-template-columns: repeat(auto-fit,minmax(320px,1fr)); 
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white; 
  border: 1px solid #E1E8ED; 
  border-radius: 12px; 
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1rem 1.25rem; 
  border-bottom: 1px solid #E1E8ED; 
  
  h3 {
    margin: 0;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    
    h3 {
      font-size: 1.1rem;
    }
  }
`;

const Body = styled.div`
  padding: 1rem 1.25rem; 
  display: grid; 
  gap: 1rem;
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
  }
`;

const Select = styled.select`
  padding: .75rem 1rem; 
  border: 1px solid #E1E8ED; 
  border-radius: 8px;
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const Preview = styled.div`
  width: 100%; 
  height: 200px; 
  background: #F8F9FA; 
  border-radius: 8px; 
  overflow: hidden;
  
  img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
  }
  
  @media (max-width: 480px) {
    height: 150px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    justify-content: center;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
  }
`;

const EmptyText = styled.h3`
  color: #636E72;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const EmptySubtext = styled.p`
  color: #999;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
