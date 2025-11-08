import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheck, FiTruck, FiShoppingBag, FiPackage, FiClock, FiMapPin, FiPlay } from 'react-icons/fi';

const services = [
  {
    icon: <FiShoppingBag size={40} />,
    title: 'Easy to shop',
    description: 'We have a more than 50,000 products from best brands in our  store to serve your need.'
  },
  {
    icon: <FiTruck size={40} />,
    title: 'Faster delivery',
    description: 'Get your groceries delivered straight to your doorstep in under 2 hours.'
  },
  {
    icon: <FiPackage size={40} />,
    title: 'Guarantee Quality',
    description: 'We ensure 100% quality and freshness for all our products with guarantee.'
  }
];

const features = [
  {
    icon: <FiClock size={20} />,
    text: '24/7 Service'
  },
  {
    icon: <FiTruck size={20} />,
    text: 'Fast Delivery'
  },
  {
    icon: <FiMapPin size={20} />,
    text: 'Delivery Near You'
  }
];

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <HeroSection>
        <HeroOverlay />
        <HeroContent
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <HeroTitle>About Us</HeroTitle>
        </HeroContent>
      </HeroSection>

      {/* We Help You Section */}
      <SectionWhite>
        <ContentContainer>
          <TwoColumnGrid>
            <TextColumn
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <SectionLabel>ABOUT US</SectionLabel>
              <SectionHeading>We help you to serve your daily needs.</SectionHeading>
              <SectionText>
                Just order from thousands of products in your nearby convenience mart to get a doorstep 
                delivery within 2 hours. We care about your needs and make sure you get the best quality 
                products at affordable prices.
              </SectionText>
              <LearnMoreButton to="/products">
                Learn More
              </LearnMoreButton>
            </TextColumn>
            <ImageColumn
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <RoundedImage src="https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80" alt="Fresh Produce" />
            </ImageColumn>
          </TwoColumnGrid>
        </ContentContainer>
      </SectionWhite>

      {/* 25 Years Section with Video */}
      <SectionLight>
        <ContentContainer>
          <MilestoneCard
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <MilestoneLabel>WELCOME TO</MilestoneLabel>
            <MilestoneHeading>25 Years Providing Grocery Service.</MilestoneHeading>
            <MilestoneText>
              Lorem Ipsum is simply text of the printing and typesetting of an industry. Lorem Ipsum 
              has been the industry's standard dummy text.
            </MilestoneText>
            <MilestoneFacts>
              <Fact>
                <FactIcon><FiShoppingBag /></FactIcon>
                <FactContent>
                  <FactNumber>10,000+</FactNumber>
                  <FactLabel>HAPPY CUSTOMER COME SHOP</FactLabel>
                </FactContent>
              </Fact>
              <Fact>
                <FactIcon><FiPackage /></FactIcon>
                <FactContent>
                  <FactNumber>50,000+</FactNumber>
                  <FactLabel>FRESH PRODUCT ALWAYS AVAILABLE</FactLabel>
                </FactContent>
              </Fact>
            </MilestoneFacts>
          </MilestoneCard>

          <VideoSection
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <VideoThumbnail src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80" alt="Store Video" />
            <PlayButton>
              <FiPlay />
            </PlayButton>
          </VideoSection>
        </ContentContainer>
      </SectionLight>

      {/* Services Section */}
      <SectionWhite>
        <ContentContainer>
          <CenteredHeader
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <ServiceLabel>TEAM SERVICES</ServiceLabel>
            <ServiceHeading>Grocery service you can count on</ServiceHeading>
          </CenteredHeader>
          
          <ServicesGrid>
            {services.map((service, index) => (
              <ServiceCard
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ServiceImage src={`https://images.unsplash.com/photo-${index === 0 ? '1542838132-92c53300491e' : index === 1 ? '1604719312-6edb2016de7e' : '1553531384-cc64ac80f931'}?w=400&auto=format&fit=crop&q=80`} alt={service.title} />
                <ServiceContent>
                  <ServiceIcon>{service.icon}</ServiceIcon>
                  <ServiceTitle>{service.title}</ServiceTitle>
                  <ServiceDescription>{service.description}</ServiceDescription>
                </ServiceContent>
              </ServiceCard>
            ))}
          </ServicesGrid>
          
          <CenteredButton>
            <ViewAllButton to="/services">View All Services</ViewAllButton>
          </CenteredButton>
        </ContentContainer>
      </SectionWhite>

      {/* Doorstep Delivery Section */}
      <SectionLight>
        <ContentContainer>
          <TwoColumnGrid>
            <ImageColumn
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <RoundedImage src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=600&auto=format&fit=crop&q=80" alt="Delivery Person" />
            </ImageColumn>
            <TextColumn
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <SectionLabel>TEAM SERVICES</SectionLabel>
              <SectionHeading>We serve till the doorstep.</SectionHeading>
              <SectionText>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore Lorem ipsum, 
                dolor sit amet consectetur adipisicing elit. Deserunt hic aliquid fugiat consectetur nemo itaque.
              </SectionText>
              <FeaturesList>
                {features.map((feature, index) => (
                  <FeatureItem key={index}>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <FeatureText>{feature.text}</FeatureText>
                  </FeatureItem>
                ))}
              </FeaturesList>
            </TextColumn>
          </TwoColumnGrid>
        </ContentContainer>
      </SectionLight>

      {/* Promotional Sections */}
      <PromotionsSection>
        <ContentContainer>
          <PromotionsGrid>
            <PromoCard
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              $bg="linear-gradient(135deg, #f8e8e9 0%, #fdf3f4 100%)"
            >
              <PromoContent>
                <PromoHeading>Discount Up to 55%</PromoHeading>
                <PromoText>All kinds of smart super market are available at Dailyfresh</PromoText>
                <ShopNowButton>Shop Now</ShopNowButton>
              </PromoContent>
              <PromoImage src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300&auto=format&fit=crop&q=80" alt="Discount" />
            </PromoCard>

            <PromoCard
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              $bg="linear-gradient(135deg, #fff8e1 0%, #fffbf0 100%)"
            >
              <PromoContent>
                <PromoHeading>Fruit Parade</PromoHeading>
                <PromoText>We provide  all kinds of fresh fruit products</PromoText>
                <ShopNowButton>Shop Now</ShopNowButton>
              </PromoContent>
              <PromoImage src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop&q=80" alt="Fruits" />
            </PromoCard>
          </PromotionsGrid>
        </ContentContainer>
      </PromotionsSection>
    </PageWrapper>
  );
};

export default AboutPage;

// Styled Components
const PageWrapper = styled.div`
  width: 100%;
  overflow-x: hidden;
`;

const HeroSection = styled.div`
  position: relative;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  height: 400px;
  background: url('https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=1600&auto=format&fit=crop&q=80') center/cover;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    height: 500px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(42, 80, 64, 0.6);
`;

const HeroContent = styled(motion.div)`
  position: relative;
  z-index: 1;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 700;
  color: white;
  margin: 0;
`;

const SectionWhite = styled.section`
  padding: 80px 0;
  background: white;
  
  @media (min-width: 768px) {
    padding: 100px 0;
  }
`;

const SectionLight = styled.section`
  padding: 80px 0;
  background: #F8F9FA;
  
  @media (min-width: 768px) {
    padding: 100px 0;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  
  @media (min-width: 1024px) {
    padding: 0 2rem;
  }
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  align-items: center;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
`;

const TextColumn = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ImageColumn = styled(motion.div)``;

const SectionLabel = styled.div`
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
`;

const SectionHeading = styled.h2`
  font-size: clamp(1.875rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #2D3436;
  line-height: 1.2;
`;

const SectionText = styled.p`
  color: #636E72;
  line-height: 1.8;
  font-size: 1rem;
`;

const LearnMoreButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2rem;
  background: #E74C3C;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  max-width: fit-content;
  
  &:hover {
    background: #C0392B;
    transform: translateY(-2px);
  }
`;

const RoundedImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  object-fit: cover;
`;

const MilestoneCard = styled(motion.div)`
  background: white;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
  
  @media (min-width: 768px) {
    padding: 3rem 3.5rem;
  }
`;

const MilestoneLabel = styled.div`
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  margin-bottom: 1rem;
`;

const MilestoneHeading = styled.h2`
  font-size: clamp(1.5rem, 3.5vw, 2.25rem);
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 1rem;
  line-height: 1.3;
`;

const MilestoneText = styled.p`
  color: #636E72;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const MilestoneFacts = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const Fact = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FactIcon = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #6C9A7F 0%, #4A7760 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const FactContent = styled.div``;

const FactNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3436;
`;

const FactLabel = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 0.25rem;
`;

const VideoSection = styled(motion.div)`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 15px 50px rgba(0, 0, 0, 0.15);
  }
`;

const VideoThumbnail = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  display: block;
  
  @media (min-width: 768px) {
    height: 500px;
  }
`;

const PlayButton = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  font-size: 2rem;
  transition: all 0.3s ease;
  
  svg {
    margin-left: 4px;
  }
  
  ${VideoSection}:hover & {
    transform: translate(-50%, -50%) scale(1.1);
    background: white;
  }
`;

const CenteredHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 3rem;
`;

const ServiceLabel = styled.div`
  color: #6C9A7F;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
`;

const ServiceHeading = styled.h2`
  font-size: clamp(1.875rem, 4vw, 2.5rem);
  font-weight: 700;
  color: #2D3436;
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ServiceCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const ServiceImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ServiceContent = styled.div`
  padding: 2rem 1.5rem;
  text-align: center;
`;

const ServiceIcon = styled.div`
  color: #6C9A7F;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const ServiceTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.75rem;
`;

const ServiceDescription = styled.p`
  color: #636E72;
  line-height: 1.6;
  font-size: 0.95rem;
`;

const CenteredButton = styled.div`
  display: flex;
  justify-content: center;
`;

const ViewAllButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.875rem 2.5rem;
  background: #E74C3C;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #C0392B;
    transform: translateY(-2px);
  }
`;

const FeaturesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #E8F5EC;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  font-weight: 600;
  color: #2D3436;
  font-size: 0.95rem;
`;

const PromotionsSection = styled.section`
  padding: 80px 0;
  background: white;
  
  @media (min-width: 768px) {
    padding: 100px 0;
  }
`;

const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
`;

interface PromoCardProps {
  $bg: string;
}

const PromoCard = styled(motion.div)<PromoCardProps>`
  background: ${props => props.$bg};
  border-radius: 16px;
  padding: 2.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  overflow: hidden;
  position: relative;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const PromoContent = styled.div`
  flex: 1;
`;

const PromoHeading = styled.h3`
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.75rem;
`;

const PromoText = styled.p`
  color: #636E72;
  margin-bottom: 1.5rem;
  line-height: 1.6;
`;

const ShopNowButton = styled.button`
  padding: 0.75rem 2rem;
  background: #E74C3C;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #C0392B;
    transform: translateY(-2px);
  }
`;

const PromoImage = styled.img`
  width: 150px;
  height: 150px;
  object-fit: contain;
  
  @media (min-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;
