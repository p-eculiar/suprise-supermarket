import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiUsers, FiDollarSign } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'household' | 'corporate';
  price: number;
  duration: 'monthly' | 'quarterly' | 'yearly';
  description: string;
  items: any[];
  active: boolean;
  subscribers_count?: number;
  created_at: string;
}

const AdminSubscriptions: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<'all' | 'household' | 'corporate'>('all');

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin-subscription-plans', selectedType],
    queryFn: async () => {
      let query = supabase.from('subscription_plans').select('*');
      
      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch subscription statistics
  const { data: stats } = useQuery({
    queryKey: ['subscription-stats'],
    queryFn: async () => {
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('status, monthly_value')
        .eq('status', 'active');

      if (error) throw error;

      const activeSubscribers = subscriptions?.length || 0;
      const monthlyRevenue = subscriptions?.reduce((sum, sub) => sum + (sub.monthly_value || 0), 0) || 0;

      return {
        activeSubscribers,
        monthlyRevenue,
        totalPlans: plans?.length || 0,
      };
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from('subscription_plans')
        .delete()
        .eq('id', planId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscription-plans'] });
      alert('Plan deleted successfully');
    },
  });

  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this subscription plan?')) {
      deletePlanMutation.mutate(planId);
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Subscription Management</Title>
          <Subtitle>Manage household and corporate subscription plans</Subtitle>
        </HeaderContent>
        <AddButton to="/admin/subscriptions/new">
          <FiPlus />
          Create New Plan
        </AddButton>
      </Header>

      {/* Statistics Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiUsers />
          </StatIcon>
          <StatInfo>
            <StatLabel>Active Subscribers</StatLabel>
            <StatValue>{stats?.activeSubscribers || 0}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4ECDC4">
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Monthly Recurring Revenue</StatLabel>
            <StatValue>₦{(stats?.monthlyRevenue || 0).toLocaleString()}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#9B59B6">
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Plans</StatLabel>
            <StatValue>{stats?.totalPlans || 0}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Filter Tabs */}
      <FilterTabs>
        <FilterTab $active={selectedType === 'all'} onClick={() => setSelectedType('all')}>
          All Plans
        </FilterTab>
        <FilterTab $active={selectedType === 'household'} onClick={() => setSelectedType('household')}>
          Household Plans
        </FilterTab>
        <FilterTab $active={selectedType === 'corporate'} onClick={() => setSelectedType('corporate')}>
          Corporate Plans
        </FilterTab>
      </FilterTabs>

      {/* Plans Grid */}
      <PlansGrid>
        {isLoading ? (
          <LoadingText>Loading plans...</LoadingText>
        ) : plans && plans.length > 0 ? (
          plans.map((plan) => (
            <PlanCard key={plan.id}>
              <PlanHeader>
                <PlanType $type={plan.type}>
                  {plan.type === 'household' ? '🏠 Household' : '🏢 Corporate'}
                </PlanType>
                <PlanActions>
                  <ActionButton to={`/admin/subscriptions/edit/${plan.id}`}>
                    <FiEdit2 />
                  </ActionButton>
                  <DeleteButton onClick={() => handleDeletePlan(plan.id)}>
                    <FiTrash2 />
                  </DeleteButton>
                </PlanActions>
              </PlanHeader>

              <PlanName>{plan.name}</PlanName>
              <PlanPrice>₦{plan.price.toLocaleString()}/{plan.duration}</PlanPrice>
              <PlanDescription>{plan.description}</PlanDescription>

              <PlanItems>
                <ItemsTitle>Included Items:</ItemsTitle>
                <ItemsList>
                  {plan.items && plan.items.length > 0 ? (
                    plan.items.slice(0, 3).map((item: any, idx: number) => (
                      <Item key={idx}>• {item.name} ({item.quantity})</Item>
                    ))
                  ) : (
                    <Item>No items configured</Item>
                  )}
                  {plan.items && plan.items.length > 3 && (
                    <Item>+ {plan.items.length - 3} more items</Item>
                  )}
                </ItemsList>
              </PlanItems>

              <PlanFooter>
                <StatusBadge $active={plan.active}>
                  {plan.active ? '✓ Active' : '✗ Inactive'}
                </StatusBadge>
                <SubscriberCount>
                  {plan.subscribers_count || 0} subscribers
                </SubscriberCount>
              </PlanFooter>
            </PlanCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              <FiPackage />
            </EmptyIcon>
            <EmptyText>No subscription plans yet</EmptyText>
            <EmptySubtext>Create your first plan to start offering subscriptions</EmptySubtext>
          </EmptyState>
        )}
      </PlansGrid>
    </Container>
  );
};

export default AdminSubscriptions;

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
  
  svg {
    font-size: 1.125rem;
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

const FilterTabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #eee;
`;

const FilterTab = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${({ $active, theme }) => ($active ? theme.colors.primary.main : 'transparent')};
  color: ${({ $active }) => ($active ? '#333' : '#666')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: -2px;
  
  &:hover {
    color: #333;
  }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
`;

const LoadingText = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const PlanCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const PlanHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PlanType = styled.span<{ $type: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${({ $type }) => ($type === 'household' ? '#E8F5E9' : '#E3F2FD')};
  color: ${({ $type }) => ($type === 'household' ? '#2E7D32' : '#1565C0')};
`;

const PlanActions = styled.div`
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
  background: #F5F5F5;
  color: #666;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
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
  background: #F5F5F5;
  color: #666;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FF6B6B;
    color: white;
  }
`;

const PlanName = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const PlanPrice = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 1rem;
`;

const PlanDescription = styled.p`
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const PlanItems = styled.div`
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

const PlanFooter = styled.div`
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
  background: ${({ $active }) => ($active ? '#D4EDDA' : '#F8D7DA')};
  color: ${({ $active }) => ($active ? '#155724' : '#721C24')};
`;

const SubscriberCount = styled.span`
  font-size: 0.875rem;
  color: #666;
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
