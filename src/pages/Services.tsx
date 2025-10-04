import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiTag, FiTruck, FiClock, FiShield, FiGift, FiPercent } from 'react-icons/fi';
import { Container, Section, Heading, Text, Button } from '../components/common';

const services = [
  {
    id: 1,
    icon: <FiShoppingCart size={40} />,
    title: 'Live In-Store Inventory',
    description: 'Real-time stock updates and accurate pricing for all products in our store.',
    color: 'var(--color-primary)'
  },
  {
    id: 2,
    icon: <FiGift size={40} />,
    title: 'Digital Loyalty Program',
    description: 'Earn points on every purchase and redeem exciting rewards and discounts.',
    color: 'var(--color-secondary)'
  },
  {
    id: 3,
    icon: <FiTag size={40} />,
    title: 'E-Coupons & Deals',
    description: 'Exclusive digital coupons and special offers available only to our app users.',
    color: 'var(--color-accent)'
  },
  {
    id: 4,
    icon: <FiTruck size={40} />,
    title: 'Supplier Sponsorships',
    description: 'Featured products and special promotions from our trusted suppliers.',
    color: 'var(--color-success)'
  },
  {
    id: 5,
    icon: <FiClock size={40} />,
    title: 'Local Pickup',
    description: 'Order online and pick up at your convenience with our contactless pickup service.',
    color: 'var(--color-warning)'
  },
  {
    id: 6,
    icon: <FiShield size={40} />,
    title: 'Price Match Guarantee',
    description: 'Found it cheaper elsewhere? We\'ll match the price plus give you 10% off!',
    color: 'var(--color-error)'
  },
];

const ServicesPage: React.FC = () => {
  return (
    <PageWrapper>
      <HeroSection>
        <Container>
          <HeroContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heading as="h1" size="3xl" weight="bold" color="white" align="center">
              Our Services
            </Heading>
            <Text size="lg" color="white" align="center" mt={3}>
              Discover how we make your shopping experience better with our innovative services
            </Text>
          </HeroContent>
        </Container>
      </HeroSection>

      <Section>
        <Container>
          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ServiceIcon $color={service.color}>
                  {service.icon}
                </ServiceIcon>
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                <LearnMoreButton
                  $color={service.color}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </LearnMoreButton>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </Container>
      </Section>

      <FeatureSection>
        <Container>
          <FeatureContent>
            <FeatureText
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Heading as="h2" size="2xl" weight="bold">
                Special Member Benefits
              </Heading>
              <Text mt={3} size="md">
                Join our loyalty program today and enjoy exclusive benefits including:
              </Text>
              <BenefitsList>
                <BenefitItem>
                  <FiPercent className="benefit-icon" />
                  <span>10% off your first order</span>
                </BenefitItem>
                <BenefitItem>
                  <FiGift className="benefit-icon" />
                  <span>Birthday surprises and special offers</span>
                </BenefitItem>
                <BenefitItem>
                  <FiTag className="benefit-icon" />
                  <span>Exclusive member-only discounts</span>
                </BenefitItem>
                <BenefitItem>
                  <FiClock className="benefit-icon" />
                  <span>Early access to sales and new products</span>
                </BenefitItem>
              </BenefitsList>
              <Button variant="primary" size="lg" mt={4}>
                Join Now - It's Free!
              </Button>
            </FeatureText>
            <FeatureImage
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80" 
                alt="Happy customer with shopping bags"
              />
            </FeatureImage>
          </FeatureContent>
        </Container>
      </FeatureSection>

      <CtaSection>
        <Container>
          <CtaContent>
            <Heading as="h2" size="2xl" weight="bold" color="white" align="center">
              Ready to Experience the Difference?
            </Heading>
            <Text size="lg" color="white" align="center" mt={3} mb={5}>
              Download our app now and get $5 off your first order!
            </Text>
            <CtaButtons>
              <CtaButton 
                as="a" 
                href="#" 
                variant="secondary" 
                size="lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <AppStoreIcon />
                App Store
              </CtaButton>
              <CtaButton 
                as="a" 
                href="#" 
                variant="secondary" 
                size="lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlayStoreIcon />
                Google Play
              </CtaButton>
            </CtaButtons>
          </CtaContent>
        </Container>
      </CtaSection>
    </PageWrapper>
  );
};

export default ServicesPage;

// Styled Components
const PageWrapper = styled.div`
  padding-top: 80px; // Account for fixed header
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    opacity: 0.6;
  }
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 50px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  }
`;

const ServiceIcon = styled.div<{ $color: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ $color }) => `${$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: ${({ $color }) => $color};
  font-size: 2rem;
`;

const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ServiceDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 20px;
  line-height: 1.6;
`;

const LearnMoreButton = styled(motion.button)<{ $color: string }>`
  background: none;
  border: none;
  color: ${({ $color }) => $color};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 0;
  margin-top: auto;
  
  &::after {
    content: '→';
    margin-left: 8px;
    transition: transform 0.3s ease;
  }
  
  &:hover::after {
    transform: translateX(5px);
  }
`;

const FeatureSection = styled(Section)`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 100px 0;
`;

const FeatureContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const FeatureText = styled(motion.div)`
  max-width: 500px;
  
  @media (max-width: 992px) {
    max-width: 100%;
    margin: 0 auto;
    text-align: center;
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 30px 0;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
  
  .benefit-icon {
    margin-right: 15px;
    color: var(--color-primary);
    min-width: 24px;
  }
  
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const FeatureImage = styled(motion.div)`
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  
  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.03);
  }
  
  @media (max-width: 992px) {
    max-width: 500px;
    margin: 0 auto;
  }
`;

const CtaSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 80px 0;
  text-align: center;
`;

const CtaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CtaButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CtaButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
`;

const AppStoreIcon = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'%3E%3Cpath fill='currentColor' d='M318.7 268.7c-.2-36.7 16.4-64.4 13-81.9-16.1-60.6-53.7-72.2-62.4-72.2-27.7 0-51.8 16.3-67.3 16.3-15.5 0-39.9-15.9-65.7-15.4-33.8.5-65.2 19.7-82.7 50.1-35.3 61.3-9 152.3 25.3 202.1 16.5 24.1 36.2 51.2 62.1 50.3 25-.9 34.5-16.3 64.7-16.3 30.2 0 38.7 16.3 65.2 15.7 26.9-.6 44.9-24.3 61.4-48.5 19.6-28.6 27.6-56.2 28.1-57.6-.6-.3-54-20.7-54.5-82.3zM155.9 85.4c16.8-20.4 14.5-50.2-3.6-67.9-18.6-19.1-48.9-20.6-67.6-4.6-16.8 20.4-14.5 50.2 3.6 67.9 18.9 19.1 49.1 19.8 67.6 4.6z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;

const PlayStoreIcon = styled.span`
  display: inline-block;
  width: 24px;
  height: 24px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='currentColor' d='M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z'/%3E%3C/svg%3E") no-repeat center;
  background-size: contain;
`;
