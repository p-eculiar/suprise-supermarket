import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { FiGift, FiShoppingCart, FiGlobe, FiCheck, FiHeart } from 'react-icons/fi';

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
  category: string;
  featured: boolean;
}

const DiasporaGifting: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCurrency, setSelectedCurrency] = useState<'NGN' | 'USD' | 'GBP' | 'EUR'>('USD');
  const [selectedBasket, setSelectedBasket] = useState<GiftBasket | null>(null);

  // Fetch gift baskets
  const { data: baskets, isLoading } = useQuery({
    queryKey: ['diaspora-baskets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diaspora_gift_baskets')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('price_ngn', { ascending: true });

      if (error) throw error;
      return data as GiftBasket[];
    },
  });

  const getPriceInCurrency = (basket: GiftBasket) => {
    switch (selectedCurrency) {
      case 'USD':
        return { symbol: '$', amount: basket.price_usd };
      case 'GBP':
        return { symbol: '£', amount: basket.price_gbp };
      case 'EUR':
        return { symbol: '€', amount: basket.price_eur };
      default:
        return { symbol: '₦', amount: basket.price_ngn };
    }
  };

  const handleOrderBasket = (basket: GiftBasket) => {
    navigate('/diaspora-checkout', { state: { basket, currency: selectedCurrency } });
  };

  return (
    <Container>
      <Hero>
        <HeroContent>
          <HeroTitle>Send Love Home 🇳🇬</HeroTitle>
          <HeroSubtitle>
            Nigerian diaspora? Send fresh groceries to your loved ones back home with guaranteed quality
            and reliable delivery
          </HeroSubtitle>
          <HeroFeatures>
            <Feature>
              <FiCheck /> Premium Quality Products
            </Feature>
            <Feature>
              <FiCheck /> Same-Day Delivery Available
            </Feature>
            <Feature>
              <FiCheck /> Track Your Gift in Real-Time
            </Feature>
          </HeroFeatures>
        </HeroContent>
      </Hero>

      {/* Currency Selector */}
      <CurrencySection>
        <CurrencyLabel>Select Your Currency:</CurrencyLabel>
        <CurrencyButtons>
          <CurrencyButton
            $active={selectedCurrency === 'USD'}
            onClick={() => setSelectedCurrency('USD')}
          >
            🇺🇸 USD
          </CurrencyButton>
          <CurrencyButton
            $active={selectedCurrency === 'GBP'}
            onClick={() => setSelectedCurrency('GBP')}
          >
            🇬🇧 GBP
          </CurrencyButton>
          <CurrencyButton
            $active={selectedCurrency === 'EUR'}
            onClick={() => setSelectedCurrency('EUR')}
          >
            🇪🇺 EUR
          </CurrencyButton>
          <CurrencyButton
            $active={selectedCurrency === 'NGN'}
            onClick={() => setSelectedCurrency('NGN')}
          >
            🇳🇬 NGN
          </CurrencyButton>
        </CurrencyButtons>
      </CurrencySection>

      {/* Trust Indicators */}
      <TrustSection>
        <TrustCard>
          <TrustIcon>🔒</TrustIcon>
          <TrustTitle>Secure Payment</TrustTitle>
          <TrustText>Pay safely with international cards</TrustText>
        </TrustCard>
        <TrustCard>
          <TrustIcon>📦</TrustIcon>
          <TrustTitle>Quality Guarantee</TrustTitle>
          <TrustText>Fresh products or money back</TrustText>
        </TrustCard>
        <TrustCard>
          <TrustIcon>🚚</TrustIcon>
          <TrustTitle>Fast Delivery</TrustTitle>
          <TrustText>Within 24-48 hours nationwide</TrustText>
        </TrustCard>
        <TrustCard>
          <TrustIcon>📱</TrustIcon>
          <TrustTitle>Real-Time Updates</TrustTitle>
          <TrustText>Track every step of delivery</TrustText>
        </TrustCard>
      </TrustSection>

      {/* Featured Baskets */}
      {baskets && baskets.filter(b => b.featured).length > 0 && (
        <Section>
          <SectionTitle>⭐ Most Popular Gift Baskets</SectionTitle>
          <BasketsGrid>
            {baskets
              .filter(b => b.featured)
              .map((basket) => {
                const price = getPriceInCurrency(basket);
                return (
                  <BasketCard key={basket.id} $featured>
                    <PopularBadge>Most Popular</PopularBadge>
                    <BasketImage src={basket.image_url} alt={basket.name} />
                    <BasketContent>
                      <BasketName>{basket.name}</BasketName>
                      <BasketDescription>{basket.description}</BasketDescription>

                      <BasketPrice>
                        <Currency>{price.symbol}</Currency>
                        <Amount>{price.amount.toFixed(2)}</Amount>
                      </BasketPrice>

                      <ItemsList>
                        <ItemsTitle>What's Inside:</ItemsTitle>
                        {basket.items?.slice(0, 4).map((item: any, idx: number) => (
                          <Item key={idx}>
                            <FiCheck />
                            {item.name} ({item.quantity} {item.unit})
                          </Item>
                        ))}
                        {basket.items?.length > 4 && (
                          <Item>+ {basket.items.length - 4} more items</Item>
                        )}
                      </ItemsList>

                      <OrderButton onClick={() => handleOrderBasket(basket)}>
                        <FiGift /> Send This Gift
                      </OrderButton>
                    </BasketContent>
                  </BasketCard>
                );
              })}
          </BasketsGrid>
        </Section>
      )}

      {/* All Baskets */}
      <Section>
        <SectionTitle>🎁 All Gift Baskets</SectionTitle>
        {isLoading ? (
          <LoadingText>Loading gift baskets...</LoadingText>
        ) : (
          <BasketsGrid>
            {baskets?.map((basket) => {
              const price = getPriceInCurrency(basket);
              return (
                <BasketCard key={basket.id}>
                  <BasketImage src={basket.image_url} alt={basket.name} />
                  <BasketContent>
                    <CategoryBadge>{basket.category}</CategoryBadge>
                    <BasketName>{basket.name}</BasketName>
                    <BasketDescription>{basket.description}</BasketDescription>

                    <BasketPrice>
                      <Currency>{price.symbol}</Currency>
                      <Amount>{price.amount.toFixed(2)}</Amount>
                    </BasketPrice>

                    <ItemsList>
                      <ItemsTitle>Includes:</ItemsTitle>
                      {basket.items?.slice(0, 3).map((item: any, idx: number) => (
                        <Item key={idx}>
                          <FiCheck />
                          {item.name} ({item.quantity} {item.unit})
                        </Item>
                      ))}
                      {basket.items?.length > 3 && (
                        <Item>+ {basket.items.length - 3} more items</Item>
                      )}
                    </ItemsList>

                    <OrderButton onClick={() => handleOrderBasket(basket)}>
                      <FiGift /> Send This Gift
                    </OrderButton>
                  </BasketContent>
                </BasketCard>
              );
            })}
          </BasketsGrid>
        )}
      </Section>

      {/* How It Works */}
      <HowItWorks>
        <SectionTitle>How It Works</SectionTitle>
        <StepsGrid>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>Choose a Basket</StepTitle>
            <StepText>Select the perfect gift basket for your loved ones</StepText>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>Add Recipient Details</StepTitle>
            <StepText>Enter delivery address and a personal message</StepText>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>Pay Securely</StepTitle>
            <StepText>Complete payment with your international card</StepText>
          </Step>
          <Step>
            <StepNumber>4</StepNumber>
            <StepTitle>Track Delivery</StepTitle>
            <StepText>Follow your gift from our warehouse to their door</StepText>
          </Step>
        </StepsGrid>
      </HowItWorks>

      {/* Testimonials */}
      <Testimonials>
        <SectionTitle>What Our Customers Say 💬</SectionTitle>
        <TestimonialsGrid>
          <Testimonial>
            <TestimonialText>
              "Sent groceries to my parents in Lagos from London. They received everything fresh and on
              time. Highly recommended!"
            </TestimonialText>
            <TestimonialAuthor>- Chioma A., UK 🇬🇧</TestimonialAuthor>
          </Testimonial>
          <Testimonial>
            <TestimonialText>
              "Best service for sending food home! My family was so happy. The quality was excellent and
              delivery was fast."
            </TestimonialText>
            <TestimonialAuthor>- David O., USA 🇺🇸</TestimonialAuthor>
          </Testimonial>
          <Testimonial>
            <TestimonialText>
              "I send a basket every month to my elderly parents. The process is easy and I can track
              everything online."
            </TestimonialText>
            <TestimonialAuthor>- Ngozi M., Canada 🇨🇦</TestimonialAuthor>
          </Testimonial>
        </TestimonialsGrid>
      </Testimonials>

      {/* FAQ */}
      <FAQ>
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <FAQGrid>
          <FAQItem>
            <FAQQuestion>Which cities do you deliver to?</FAQQuestion>
            <FAQAnswer>
              We deliver nationwide across Nigeria, including Lagos, Abuja, Port Harcourt, Ibadan, Kano,
              and all major cities.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>How long does delivery take?</FAQQuestion>
            <FAQAnswer>
              Standard delivery is 24-48 hours. Same-day delivery is available in Lagos, Abuja, and Port
              Harcourt for orders placed before 10 AM.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>Can I add a personal message?</FAQQuestion>
            <FAQAnswer>
              Yes! You can include a personalized gift message that will be printed and delivered with the
              basket.
            </FAQAnswer>
          </FAQItem>
          <FAQItem>
            <FAQQuestion>What payment methods do you accept?</FAQQuestion>
            <FAQAnswer>
              We accept all major international credit/debit cards (Visa, Mastercard, Amex), PayPal, and
              bank transfers.
            </FAQAnswer>
          </FAQItem>
        </FAQGrid>
      </FAQ>
    </Container>
  );
};

export default DiasporaGifting;

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
  font-size: 3rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.95;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const HeroFeatures = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;

  svg {
    color: #FFD700;
  }
`;

const CurrencySection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const CurrencyLabel = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const CurrencyButtons = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const CurrencyButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  border: 2px solid ${({ $active, theme }) => ($active ? theme.colors.primary.main : '#ddd')};
  background: ${({ $active, theme }) => ($active ? theme.colors.primary.main : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#666')};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const TrustSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const TrustCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TrustIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const TrustTitle = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const TrustText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

const Section = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const BasketsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const BasketCard = styled.div<{ $featured?: boolean }>`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  border: ${({ $featured, theme }) => ($featured ? `3px solid ${theme.colors.primary.main}` : 'none')};

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #333;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.875rem;
  z-index: 1;
`;

const BasketImage = styled.img`
  width: 100%;
  height: 250px;
  object-fit: cover;
`;

const BasketContent = styled.div`
  padding: 1.5rem;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background: #E3F2FD;
  color: #1565C0;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 1rem;
`;

const BasketName = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.75rem;
`;

const BasketDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const BasketPrice = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
`;

const Currency = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #666;
`;

const Amount = styled.span`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ItemsList = styled.div`
  margin-bottom: 1.5rem;
`;

const ItemsTitle = styled.div`
  font-weight: 700;
  margin-bottom: 0.75rem;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: #666;

  svg {
    color: ${({ theme }) => theme.colors.primary.main};
    flex-shrink: 0;
  }
`;

const OrderButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const StepTitle = styled.h4`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const StepText = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const Testimonials = styled.div`
  margin-bottom: 4rem;
`;

const TestimonialsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const Testimonial = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${({ theme }) => theme.colors.primary.main};
`;

const TestimonialText = styled.p`
  font-style: italic;
  color: #666;
  line-height: 1.8;
  margin-bottom: 1rem;
`;

const TestimonialAuthor = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary.main};
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
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const FAQAnswer = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;
