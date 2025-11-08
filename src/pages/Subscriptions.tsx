import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiPackage, FiClock, FiTruck } from 'react-icons/fi';

interface SubscriptionPlan {
  id: string;
  name: string;
  type: 'household' | 'corporate';
  price: number;
  duration: string;
  description: string;
  items: any[];
  active: boolean;
}

const Subscriptions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<'household' | 'corporate'>('household');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  // Fetch subscription plans
  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans', selectedType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('active', true)
        .eq('type', selectedType)
        .order('price', { ascending: true });

      if (error) throw error;
      return data as SubscriptionPlan[];
    },
  });

  // Fetch user's active subscriptions
  const { data: userSubscriptions } = useQuery({
    queryKey: ['user-subscriptions'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, subscription_plans(*)')
        .eq('user_id', user.id)
        .in('status', ['active', 'paused']);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) {
        throw new Error('Please login to subscribe');
      }

      const plan = plans?.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      // Calculate next delivery date (30 days from now)
      const nextDeliveryDate = new Date();
      nextDeliveryDate.setDate(nextDeliveryDate.getDate() + 30);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{
          user_id: user.id,
          plan_id: planId,
          monthly_value: plan.price,
          status: 'active',
          next_delivery_date: nextDeliveryDate.toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      alert('Subscription activated successfully! 🎉');
      setSelectedPlan(null);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to subscribe');
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!user) {
      navigate('/login?redirect=/subscriptions');
      return;
    }

    if (window.confirm('Confirm subscription? You will be charged according to the selected plan.')) {
      subscribeMutation.mutate(planId);
    }
  };

  const hasActiveSubscription = userSubscriptions && userSubscriptions.length > 0;

  return (
    <Container>
      <Hero>
        <HeroContent>
          <HeroTitle>Never Run Out of Groceries Again 🛒</HeroTitle>
          <HeroSubtitle>
            Subscribe to our automatic delivery service and enjoy fresh groceries delivered to your
            doorstep every month
          </HeroSubtitle>
        </HeroContent>
      </Hero>

      {/* User's Active Subscriptions */}
      {hasActiveSubscription && (
        <ActiveSubscriptions>
          <SectionTitle>Your Active Subscriptions</SectionTitle>
          <SubscriptionsList>
            {userSubscriptions?.map((sub: any) => (
              <ActiveSubCard key={sub.id}>
                <SubHeader>
                  <SubName>{sub.subscription_plans.name}</SubName>
                  <SubStatus $status={sub.status}>{sub.status}</SubStatus>
                </SubHeader>
                <SubPrice>₦{sub.monthly_value.toLocaleString()}/{sub.subscription_plans.duration}</SubPrice>
                <SubInfo>
                  <InfoItem>
                    <FiTruck />
                    Next Delivery: {new Date(sub.next_delivery_date).toLocaleDateString()}
                  </InfoItem>
                </SubInfo>
              </ActiveSubCard>
            ))}
          </SubscriptionsList>
        </ActiveSubscriptions>
      )}

      {/* Plan Type Toggle */}
      <TypeToggle>
        <ToggleButton 
          $active={selectedType === 'household'} 
          onClick={() => setSelectedType('household')}
        >
          🏠 Household Plans
        </ToggleButton>
        <ToggleButton 
          $active={selectedType === 'corporate'} 
          onClick={() => setSelectedType('corporate')}
        >
          🏢 Corporate Plans
        </ToggleButton>
      </TypeToggle>

      {/* Features Section */}
      <FeaturesGrid>
        <Feature>
          <FeatureIcon><FiPackage /></FeatureIcon>
          <FeatureTitle>Curated Packages</FeatureTitle>
          <FeatureText>Hand-picked quality products based on your needs</FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FiClock /></FeatureIcon>
          <FeatureTitle>Flexible Delivery</FeatureTitle>
          <FeatureText>Pause, skip, or cancel anytime with no penalty</FeatureText>
        </Feature>
        <Feature>
          <FeatureIcon><FiTruck /></FeatureIcon>
          <FeatureTitle>Free Delivery</FeatureTitle>
          <FeatureText>All subscriptions include free home delivery</FeatureText>
        </Feature>
      </FeaturesGrid>

      {/* Subscription Plans */}
      <PlansSection>
        <SectionTitle>
          {selectedType === 'household' ? 'Family Plans' : 'Business Plans'}
        </SectionTitle>
        
        {isLoading ? (
          <LoadingText>Loading plans...</LoadingText>
        ) : (
          <PlansGrid>
            {plans?.map((plan) => (
              <PlanCard key={plan.id} $featured={plan.price > 75000}>
                {plan.price > 75000 && <Badge>Popular</Badge>}
                
                <PlanHeader>
                  <PlanName>{plan.name}</PlanName>
                  <PlanPrice>
                    <Currency>₦</Currency>
                    <Amount>{plan.price.toLocaleString()}</Amount>
                    <Period>/{plan.duration}</Period>
                  </PlanPrice>
                  <PlanDescription>{plan.description}</PlanDescription>
                </PlanHeader>

                <ItemsList>
                  <ItemsTitle>What's Included:</ItemsTitle>
                  {plan.items && plan.items.map((item: any, idx: number) => (
                    <Item key={idx}>
                      <FiCheck />
                      <span>{item.name} - {item.quantity} {item.unit}</span>
                    </Item>
                  ))}
                </ItemsList>

                <SubscribeButton
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribeMutation.isPending}
                  $primary={plan.price > 75000}
                >
                  {subscribeMutation.isPending && selectedPlan === plan.id
                    ? 'Processing...'
                    : 'Subscribe Now'}
                </SubscribeButton>
              </PlanCard>
            ))}
          </PlansGrid>
        )}
      </PlansSection>

      {/* How It Works */}
      <HowItWorks>
        <SectionTitle>How It Works</SectionTitle>
        <StepsGrid>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>Choose Your Plan</StepTitle>
            <StepText>Select a plan that fits your household or business needs</StepText>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>Set Delivery Schedule</StepTitle>
            <StepText>Pick your preferred delivery day and time</StepText>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>Relax & Receive</StepTitle>
            <StepText>We deliver fresh groceries to your doorstep monthly</StepText>
          </Step>
        </StepsGrid>
      </HowItWorks>

      {/* FAQ Section */}
      <FAQ>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <FAQGrid>
          <FAQItem>
            <FAQQuestion>Can I cancel anytime?</FAQQuestion>
            <FAQAnswer>Yes! Cancel, pause, or modify your subscription anytime with no penalties.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>How does delivery work?</FAQQuestion>
            <FAQAnswer>We deliver to your specified address on your chosen delivery day each month.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Can I customize my basket?</FAQQuestion>
            <FAQAnswer>Yes! Contact us to customize items in your subscription basket.</FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>What payment methods do you accept?</FAQQuestion>
            <FAQAnswer>We accept cards, bank transfers, and mobile money payments.</FAQAnswer>
          </FAQItem>
        </FAQGrid>
      </FAQ>
    </Container>
  );
};

export default Subscriptions;

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  margin-bottom: 3rem;
  color: white;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.95;
  line-height: 1.6;
`;

const ActiveSubscriptions = styled.div`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const SubscriptionsList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ActiveSubCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #6C9A7F;
`;

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SubName = styled.h3`
  font-size: 1.25rem;
  margin: 0;
`;

const SubStatus = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${({ $status }) => ($status === 'active' ? '#D4EDDA' : '#FFF3CD')};
  color: ${({ $status }) => ($status === 'active' ? '#155724' : '#856404')};
`;

const SubPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #6C9A7F;
  margin-bottom: 1rem;
`;

const SubInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
`;

const TypeToggle = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  padding: 1rem 2rem;
  border-radius: 50px;
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary.main : '#ddd')};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary.main : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#666')};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const Feature = styled.div`
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  color: #666;
  line-height: 1.6;
`;

const PlansSection = styled.div`
  margin-bottom: 4rem;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
`;

const PlanCard = styled.div<{ $featured?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  position: relative;
  border: 2px solid ${({ $featured, theme }) => ($featured ? theme.colors.primary.main : '#eee')};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
`;

const PlanHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
`;

const PlanName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1rem;
`;

const PlanPrice = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-bottom: 1rem;
`;

const Currency = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #666;
`;

const Amount = styled.span`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
  line-height: 1;
`;

const Period = styled.span`
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
`;

const PlanDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const ItemsList = styled.div`
  margin-bottom: 2rem;
`;

const ItemsTitle = styled.div`
  font-weight: 700;
  margin-bottom: 1rem;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #666;
  
  svg {
    color: ${({ theme }) => theme.colors.primary.main};
    flex-shrink: 0;
  }
`;

const SubscribeButton = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  background: ${({ $primary, theme }) =>
    $primary
      ? `linear-gradient(135deg, ${theme.colors.primary.main} 0%, #5A8569 100%)`
      : theme.colors.primary.main};
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const HowItWorks = styled.div`
  background: #f9f9f9;
  padding: 3rem 2rem;
  border-radius: 16px;
  margin-bottom: 4rem;
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const Step = styled.div`
  text-align: center;
`;

const StepNumber = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
`;

const StepTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
`;

const StepText = styled.p`
  color: #666;
  line-height: 1.6;
`;

const FAQ = styled.div`
  margin-bottom: 4rem;
`;

const FAQGrid = styled.div`
  display: grid;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
`;

const FAQItem = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FAQQuestion = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const FAQAnswer = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;
