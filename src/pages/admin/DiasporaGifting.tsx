import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FiGift, FiEdit2, FiTrash2, FiPlus, FiDollarSign, FiGlobe, FiPackage } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface GiftBasket {
  id: string;
  name: string;
  description: string;
  price_ngn: number;
  price_usd: number;
  price_gbp: number;
  price_eur: number;
  items: any[];
  image_url: string;
  active: boolean;
  total_orders: number;
  created_at: string;
}

const DiasporaGifting: React.FC = () => {
  const queryClient = useQueryClient();

  // Fetch gift baskets
  const { data: baskets, isLoading } = useQuery({
    queryKey: ['diaspora-gift-baskets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_gift_baskets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as GiftBasket[];
    },
  });

  // Fetch orders statistics
  const { data: stats } = useQuery({
    queryKey: ['diaspora-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('diaspora_orders')
        .select('total_ngn, currency')
        .eq('status', 'completed');

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_ngn || 0), 0) || 0;

      return {
        totalOrders,
        totalRevenue,
        totalBaskets: baskets?.length || 0,
      };
    },
  });

  // Delete basket mutation
  const deleteBasketMutation = useMutation({
    mutationFn: async (basketId: string) => {
      const { error } = await supabase
        .from('diaspora_gift_baskets')
        .delete()
        .eq('id', basketId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diaspora-gift-baskets'] });
      alert('Basket deleted successfully');
    },
  });

  const handleDeleteBasket = (basketId: string) => {
    if (window.confirm('Are you sure you want to delete this gift basket?')) {
      deleteBasketMutation.mutate(basketId);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Diaspora Gifting Service</Title>
          <Subtitle>Manage gift baskets for Nigerians abroad sending groceries home</Subtitle>
        </HeaderContent>
        <AddButton to="/admin/diaspora-gifting/new">
          <FiPlus />
          Create New Basket
        </AddButton>
      </Header>

      {/* Statistics */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiGift />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Gift Baskets</StatLabel>
            <StatValue>{stats?.totalBaskets || 0}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4ECDC4">
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Orders</StatLabel>
            <StatValue>{stats?.totalOrders || 0}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#FF9800">
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Revenue</StatLabel>
            <StatValue>₦{(stats?.totalRevenue || 0).toLocaleString()}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Baskets Grid */}
      <BasketsGrid>
        {isLoading ? (
          <LoadingText>Loading gift baskets...</LoadingText>
        ) : baskets && baskets.length > 0 ? (
          baskets.map((basket) => (
            <BasketCard key={basket.id}>
              <BasketImage src={basket.image_url} alt={basket.name} />
              
              <BasketContent>
                <BasketHeader>
                  <BasketName>{basket.name}</BasketName>
                  <BasketActions>
                    <ActionButton to={`/admin/diaspora-gifting/edit/${basket.id}`}>
                      <FiEdit2 />
                    </ActionButton>
                    <DeleteButton onClick={() => handleDeleteBasket(basket.id)}>
                      <FiTrash2 />
                    </DeleteButton>
                  </BasketActions>
                </BasketHeader>

                <BasketDescription>{basket.description}</BasketDescription>

                <PriceGrid>
                  <PriceItem>
                    <Currency>NGN</Currency>
                    <Price>₦{basket.price_ngn.toLocaleString()}</Price>
                  </PriceItem>
                  <PriceItem>
                    <Currency>USD</Currency>
                    <Price>${basket.price_usd.toFixed(2)}</Price>
                  </PriceItem>
                  <PriceItem>
                    <Currency>GBP</Currency>
                    <Price>£{basket.price_gbp.toFixed(2)}</Price>
                  </PriceItem>
                  <PriceItem>
                    <Currency>EUR</Currency>
                    <Price>€{basket.price_eur.toFixed(2)}</Price>
                  </PriceItem>
                </PriceGrid>

                <BasketItems>
                  <ItemsTitle>Includes:</ItemsTitle>
                  <ItemsList>
                    {basket.items && basket.items.length > 0 ? (
                      basket.items.slice(0, 3).map((item: any, idx: number) => (
                        <Item key={idx}>• {item.name} ({item.quantity})</Item>
                      ))
                    ) : (
                      <Item>No items configured</Item>
                    )}
                    {basket.items && basket.items.length > 3 && (
                      <Item>+ {basket.items.length - 3} more items</Item>
                    )}
                  </ItemsList>
                </BasketItems>

                <BasketFooter>
                  <StatusBadge $active={basket.active}>
                    {basket.active ? '✓ Active' : '✗ Inactive'}
                  </StatusBadge>
                  <OrdersCount>
                    <FiGlobe /> {basket.total_orders || 0} orders
                  </OrdersCount>
                </BasketFooter>
              </BasketContent>
            </BasketCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              <FiGift />
            </EmptyIcon>
            <EmptyText>No gift baskets yet</EmptyText>
            <EmptySubtext>Create your first diaspora gift basket</EmptySubtext>
          </EmptyState>
        )}
      </BasketsGrid>
    </Container>
  );
};

export default DiasporaGifting;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
`;

const AddButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const BasketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LoadingText = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const BasketCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const BasketImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const BasketContent = styled.div`
  padding: 1.5rem;
`;

const BasketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const BasketName = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

const BasketActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled(Link)`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6c9a7f;
    color: white;
  }
`;

const DeleteButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #666;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff6b6b;
    color: white;
  }
`;

const BasketDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const PriceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
`;

const PriceItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Currency = styled.div`
  font-size: 0.75rem;
  color: #666;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const Price = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const BasketItems = styled.div`
  margin-bottom: 1.5rem;
`;

const ItemsTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Item = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const BasketFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${({ $active }) => ($active ? '#d4edda' : '#f8d7da')};
  color: ${({ $active }) => ($active ? '#155724' : '#721c24')};
`;

const OrdersCount = styled.span`
  font-size: 0.875rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyText = styled.h3`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.p`
  color: #999;
`;
