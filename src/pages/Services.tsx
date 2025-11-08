import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiShoppingCart, FiTruck, FiClock, FiGift, FiTag, FiShield,
  FiStar, FiHeadphones, FiRefreshCw, FiPackage, FiCheckCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const services = [
  {
    id: 1,
    icon: <FiShoppingCart />,
    title: 'Easy Online Shopping',
    description: 'Browse thousands of products from the comfort of your home with our user-friendly interface.',
    color: '#6C9A7F'
  },
  {
    id: 2,
    icon: <FiTruck />,
    title: 'Fast Delivery',
    description: 'Get your orders delivered to your doorstep within 2 hours with our express delivery service.',
    color: '#FFC107'
  },
  {
    id: 3,
    icon: <FiPackage />,
    title: 'Quality Products',
    description: 'We ensure 100% quality and freshness for all our products with strict quality control.',
    color: '#FF6B6B'
  },
  {
    id: 4,
    icon: <FiGift />,
    title: 'Loyalty Rewards',
    description: 'Earn points on every purchase and redeem them for exclusive discounts and offers.',
    color: '#4ECDC4'
  },
  {
    id: 5,
    icon: <FiTag />,
    title: 'Special Offers',
    description: 'Access exclusive deals, digital coupons, and weekly promotions on your favorite items.',
    color: '#9B59B6'
  },
  {
    id: 6,
    icon: <FiShield />,
    title: 'Secure Payment',
    description: 'Multiple secure payment options with 100% buyer protection and fraud prevention.',
    color: '#3498DB'
  },
  {
    id: 7,
    icon: <FiHeadphones />,
    title: '24/7 Support',
    description: 'Our customer support team is available around the clock to assist you with any queries.',
    color: '#E67E22'
  },
  {
    id: 8,
    icon: <FiRefreshCw />,
    title: 'Easy Returns',
    description: 'Hassle-free returns within 14 days with full refund if you\'re not satisfied with your purchase.',
    color: '#1ABC9C'
  }
];

const features = [
  {
    icon: <FiCheckCircle />,
    title: 'Fresh Products',
    description: 'Daily fresh stock'
  },
  {
    icon: <FiCheckCircle />,
    title: 'Best Prices',
    description: 'Competitive pricing'
  },
  {
    icon: <FiCheckCircle />,
    title: 'Wide Selection',
    description: '10,000+ products'
  },
  {
    icon: <FiCheckCircle />,
    title: 'Trusted Brands',
    description: 'Top quality brands'
  }
];

const Services: React.FC = () => {
  return (
    <PageWrapper>
      {/* Breadcrumb & Page Header */}
      <BreadcrumbSection>
        <ContentContainer>
          <PageTitle>Our Services</PageTitle>
          <Breadcrumb>
            <BreadcrumbLink to="/">Home</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbCurrent>Services</BreadcrumbCurrent>
          </Breadcrumb>
        </ContentContainer>
      </BreadcrumbSection>

      <ContentContainer>
        {/* Hero Section */}
        <HeroSection>
          <HeroContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <HeroTitle>Making Your Shopping Experience Better</HeroTitle>
            <HeroSubtitle>
              We provide a comprehensive range of services designed to make your grocery shopping 
              convenient, affordable, and enjoyable. Discover what makes us different.
            </HeroSubtitle>
          </HeroContent>

          <FeaturesRow>
            {features.map((feature, index) => (
              <FeatureItem
                key={index}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureText>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureText>
              </FeatureItem>
            ))}
          </FeaturesRow>
        </HeroSection>

        {/* Services Grid */}
        <ServicesSection>
          <SectionHeader>
            <SectionLabel>WHAT WE OFFER</SectionLabel>
            <SectionTitle>Comprehensive Services for Your Convenience</SectionTitle>
            <SectionSubtitle>
              From easy online shopping to fast delivery, we've got everything you need for a seamless shopping experience.
            </SectionSubtitle>
          </SectionHeader>

          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                as={motion.div}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <ServiceIconWrapper $color={service.color}>
                  {service.icon}
                </ServiceIconWrapper>
                <ServiceTitle>{service.title}</ServiceTitle>
                <ServiceDescription>{service.description}</ServiceDescription>
                <LearnMoreLink>
                  Learn More →
                </LearnMoreLink>
              </ServiceCard>
            ))}
          </ServicesGrid>
        </ServicesSection>

        {/* Why Choose Us Section */}
        <WhyChooseSection>
          <TwoColumnGrid>
            <ImageColumn
              as={motion.div}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <ServiceImage src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&auto=format&fit=crop&q=80" alt="Happy Customer" />
            </ImageColumn>

            <ContentColumn
              as={motion.div}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <SectionLabel>WHY CHOOSE US</SectionLabel>
              <ColumnTitle>Your Trusted Grocery Partner</ColumnTitle>
              <ColumnText>
                With over 25 years of experience in the grocery industry, we've built a reputation 
                for quality, reliability, and exceptional customer service. Here's why thousands of 
                customers trust us with their grocery needs:
              </ColumnText>

              <BenefitsList>
                <BenefitItem>
                  <BenefitIcon><FiStar /></BenefitIcon>
                  <BenefitText>
                    <BenefitTitle>Premium Quality</BenefitTitle>
                    <BenefitDesc>Only the best products make it to our shelves</BenefitDesc>
                  </BenefitText>
                </BenefitItem>

                <BenefitItem>
                  <BenefitIcon><FiShield /></BenefitIcon>
                  <BenefitText>
                    <BenefitTitle>Quality Guarantee</BenefitTitle>
                    <BenefitDesc>100% satisfaction or your money back</BenefitDesc>
                  </BenefitText>
                </BenefitItem>

                <BenefitItem>
                  <BenefitIcon><FiHeadphones /></BenefitIcon>
                  <BenefitText>
                    <BenefitTitle>Expert Support</BenefitTitle>
                    <BenefitDesc>Dedicated team ready to help 24/7</BenefitDesc>
                  </BenefitText>
                </BenefitItem>
              </BenefitsList>

              <CTAButton to="/products">
                Start Shopping Now
              </CTAButton>
            </ContentColumn>
          </TwoColumnGrid>
        </WhyChooseSection>

        {/* CTA Section */}
        <CtaSection>
          <CtaContent
            as={motion.div}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <CtaTitle>Ready to Experience the Difference?</CtaTitle>
            <CtaText>
              Join thousands of satisfied customers who trust us for their grocery needs. 
              Sign up today and get 10% off your first order!
            </CtaText>
            <CtaButtons>
              <CtaButton to="/register" $primary>
                Get Started
              </CtaButton>
              <CtaButton to="/contact" $outline>
                Contact Us
              </CtaButton>
            </CtaButtons>
          </CtaContent>
        </CtaSection>
      </ContentContainer>
    </PageWrapper>
  );
};

export default Services;

// Styled Components
const PageWrapper = styled.div`
  background: #F8F9FA;
  min-height: 100vh;
  padding-bottom: 3rem;
`;

const BreadcrumbSection = styled.div`
  background: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const BreadcrumbLink = styled(Link)`
  color: #6C9A7F;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #636E72;
`;

const BreadcrumbCurrent = styled.span`
  color: #636E72;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  padding: 4rem 3rem;
  border-radius: 16px;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto 3rem;
`;

const HeroTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
`;

const FeaturesRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FeatureItem = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const FeatureText = styled.div``;

const FeatureTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
`;

const FeatureDescription = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
`;

const ServicesSection = styled.div`
  margin-bottom: 5rem;
`;

const SectionHeader = styled.div`
  text-align: center;
  max-width: 700px;
  margin: 0 auto 3rem;
`;

const SectionLabel = styled.div`
  font-size: 0.875rem;
  font-weight: 700;
  color: #6C9A7F;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  color: #636E72;
  line-height: 1.6;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ServiceCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  }
`;

const ServiceIconWrapper = styled.div<{ $color: string }>`
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: ${props => `${props.$color}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color};
  margin-bottom: 1.5rem;
  
  svg {
    width: 32px;
    height: 32px;
  }
`;

const ServiceTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.75rem;
`;

const ServiceDescription = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  flex: 1;
`;

const LearnMoreLink = styled.a`
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #5A8569;
    transform: translateX(5px);
  }
`;

const WhyChooseSection = styled.div`
  margin-bottom: 5rem;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const ImageColumn = styled.div``;

const ServiceImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
`;

const ContentColumn = styled.div``;

const ColumnTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const ColumnText = styled.p`
  font-size: 1rem;
  color: #636E72;
  line-height: 1.7;
  margin-bottom: 2rem;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BenefitItem = styled.div`
  display: flex;
  gap: 1rem;
`;

const BenefitIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #E8F5EC;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const BenefitText = styled.div``;

const BenefitTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const BenefitDesc = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  padding: 1rem 2rem;
  background: #6C9A7F;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
`;

const CtaSection = styled.div`
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  padding: 4rem 3rem;
  border-radius: 16px;
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
  }
`;

const CtaContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
`;

const CtaTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
`;

const CtaText = styled.p`
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.7;
`;

const CtaButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
  }
`;

const CtaButton = styled(Link)<{ $primary?: boolean; $outline?: boolean }>`
  display: inline-block;
  padding: 1rem 2.5rem;
  background: ${props => props.$primary ? 'white' : 'transparent'};
  color: ${props => props.$primary ? '#6C9A7F' : 'white'};
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: ${props => props.$outline ? '2px solid white' : 'none'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    background: ${props => props.$primary ? '#F8F9FA' : 'rgba(255, 255, 255, 0.1)'};
  }
`;
