import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAward, FiHeart, FiShield, FiUsers, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { Container, Section, Heading, Text, Button } from '../components/common';

const teamMembers = [
  {
    id: 1,
    name: 'Alex Johnson',
    role: 'Founder & CEO',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'With over 15 years in retail management, Alex founded Suprise Supermarket with a vision to revolutionize the grocery shopping experience.'
  },
  {
    id: 2,
    name: 'Sarah Williams',
    role: 'Head of Operations',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    bio: 'Sarah ensures our stores run smoothly and that our customers always have the best shopping experience possible.'
  },
  {
    id: 3,
    name: 'Michael Chen',
    role: 'Head of Technology',
    image: 'https://randomuser.me/api/portraits/men/22.jpg',
    bio: 'Michael leads our tech team, developing innovative solutions to make grocery shopping more convenient and enjoyable.'
  },
  {
    id: 4,
    name: 'Emily Rodriguez',
    role: 'Customer Experience',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    bio: 'Emily and her team are dedicated to ensuring every customer leaves our stores satisfied and excited to return.'
  }
];

const values = [
  {
    icon: <FiHeart size={32} />,
    title: 'Customer First',
    description: 'We put our customers at the heart of everything we do.'
  },
  {
    icon: <FiAward size={32} />,
    title: 'Quality',
    description: 'We source only the finest products for our customers.'
  },
  {
    icon: <FiShield size={32} />,
    title: 'Integrity',
    description: 'We do business with honesty and transparency.'
  },
  {
    icon: <FiUsers size={32} />,
    title: 'Community',
    title: 'Community',
    description: 'We support and invest in the communities we serve.'
  }
];

const AboutPage: React.FC = () => {
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
              Our Story
            </Heading>
            <Text size="lg" color="white" align="center" mt={3}>
              From a small local store to your favorite neighborhood supermarket
            </Text>
          </HeroContent>
        </Container>
      </HeroSection>

      <Section>
        <Container>
          <AboutContent>
            <AboutText
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Heading as="h2" size="2xl" weight="bold">
                Welcome to Suprise Supermarket
              </Heading>
              <Text mt={3}>
                Founded in 2010, Suprise Supermarket began as a small family-owned grocery store with a simple mission: 
                to provide fresh, high-quality products at affordable prices. What started as a single location has grown 
                into a beloved community staple, known for our exceptional customer service and commitment to quality.
              </Text>
              <Text mt={3}>
                Today, we continue to uphold our founding principles while embracing innovation to serve you better. 
                From our digital loyalty program to our convenient local pickup service, we're constantly evolving to 
                meet your needs.
              </Text>
              <StatsGrid>
                <StatItem>
                  <StatNumber>12+</StatNumber>
                  <StatLabel>Years in Business</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>5000+</StatNumber>
                  <StatLabel>Happy Customers</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>100%</StatNumber>
                  <StatLabel>Satisfaction Guarantee</StatLabel>
                </StatItem>
              </StatsGrid>
            </AboutText>
            <AboutImage
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80" 
                alt="Suprise Supermarket storefront"
              />
            </AboutImage>
          </AboutContent>
        </Container>
      </Section>

      <ValuesSection>
        <Container>
          <SectionHeader
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Heading as="h2" size="2xl" weight="bold" align="center">
              Our Core Values
            </Heading>
            <Text align="center" mt={2} maxWidth="700px" mx="auto">
              These principles guide everything we do at Suprise Supermarket
            </Text>
          </SectionHeader>

          <ValuesGrid>
            {values.map((value, index) => (
              <ValueCard
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ValueIcon>{value.icon}</ValueIcon>
                <ValueTitle>{value.title}</ValueTitle>
                <ValueDescription>{value.description}</ValueDescription>
              </ValueCard>
            ))}
          </ValuesGrid>
        </Container>
      </ValuesSection>

      <TeamSection>
        <Container>
          <SectionHeader
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Heading as="h2" size="2xl" weight="bold" align="center">
              Meet Our Team
            </Heading>
            <Text align="center" mt={2} maxWidth="700px" mx="auto">
              The passionate people behind Suprise Supermarket
            </Text>
          </SectionHeader>

          <TeamGrid>
            {teamMembers.map((member, index) => (
              <TeamMemberCard
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <TeamMemberImage>
                  <img src={member.image} alt={member.name} />
                </TeamMemberImage>
                <TeamMemberInfo>
                  <TeamMemberName>{member.name}</TeamMemberName>
                  <TeamMemberRole>{member.role}</TeamMemberRole>
                  <TeamMemberBio>{member.bio}</TeamMemberBio>
                </TeamMemberInfo>
              </TeamMemberCard>
            ))}
          </TeamGrid>
        </Container>
      </TeamSection>

      <CtaSection>
        <Container>
          <CtaContent>
            <CtaText
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <FiShoppingBag size={48} />
              <Heading as="h2" size="2xl" weight="bold" color="white" mt={3}>
                Visit Us Today
              </Heading>
              <Text color="white" mt={2}>
                Experience the Suprise Supermarket difference for yourself
              </Text>
              <Button 
                variant="secondary" 
                size="lg" 
                mt={4}
                as="a"
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Directions
              </Button>
            </CtaText>
          </CtaContent>
        </Container>
      </CtaSection>
    </PageWrapper>
  );
};

export default AboutPage;

// Styled Components
const PageWrapper = styled.div`
  padding-top: 80px;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 120px 0 80px;
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

const AboutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
  margin: 60px 0;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const AboutText = styled(motion.div)`
  max-width: 600px;
  
  @media (max-width: 992px) {
    max-width: 100%;
    margin: 0 auto;
  }
`;

const AboutImage = styled(motion.div)`
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
    max-width: 600px;
    margin: 0 auto;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 15px;
  }
`;

const StatItem = styled.div`
  text-align: center;
  padding: 20px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  line-height: 1.2;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 5px;
`;

const ValuesSection = styled(Section)`
  background: ${({ theme }) => theme.colors.background.secondary};
  padding: 100px 0;
`;

const SectionHeader = styled(motion.div)`
  text-align: center;
  margin-bottom: 60px;
`;

const ValuesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
`;

const ValueCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }
`;

const ValueIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => `${theme.colors.primary}15`};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 2rem;
`;

const ValueTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ValueDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
`;

const TeamSection = styled(Section)`
  padding: 100px 0;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-top: 40px;
`;

const TeamMemberCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid ${({ theme }) => theme.colors.border};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
  }
`;

const TeamMemberImage = styled.div`
  width: 100%;
  height: 280px;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  ${TeamMemberCard}:hover & img {
    transform: scale(1.05);
  }
`;

const TeamMemberInfo = styled.div`
  padding: 25px;
  text-align: center;
`;

const TeamMemberName = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TeamMemberRole = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  margin-bottom: 15px;
`;

const TeamMemberBio = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  font-size: 0.95rem;
`;

const CtaSection = styled.div`
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 100px 0;
  text-align: center;
`;

const CtaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CtaText = styled(motion.div`
  color: white;
  
  svg {
    color: white;
  }
`;
