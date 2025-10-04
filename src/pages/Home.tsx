import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Mock data for featured categories
const featuredCategories = [
  {
    id: 1,
    name: 'Fresh Produce',
    image: 'https://images.unsplash.com/photo-1542838132-92d533f92e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    link: '/products?category=fresh-produce'
  },
  {
    id: 2,
    name: 'Dairy & Eggs',
    image: 'https://images.unsplash.com/photo-1550583724-2692cb30b516?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    link: '/products?category=dairy-eggs'
  },
  {
    id: 3,
    name: 'Meat & Seafood',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    link: '/products?category=meat-seafood'
  },
  {
    id: 4,
    name: 'Bakery',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    link: '/products?category=bakery'
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export const Home: React.FC = () => {
  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-title"
          >
            Fresh Groceries <br />
            <span>Delivered to Your Doorstep</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hero-subtitle"
          >
            Discover the freshest selection of groceries at unbeatable prices.
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-cta"
          >
            <ShopNowButton to="/products">Shop Now</ShopNowButton>
            <LearnMoreButton to="/about">Learn More</LearnMoreButton>
          </motion.div>
        </HeroContent>
        <HeroImage 
          src="https://images.unsplash.com/photo-1542838132-92d533f92e39?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Fresh groceries"
        />
      </HeroSection>

      {/* Featured Categories */}
      <Section>
        <SectionTitle>Shop by Category</SectionTitle>
        <CategoriesGrid
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {featuredCategories.map((category) => (
            <CategoryCard 
              key={category.id}
              variants={itemVariants}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link to={category.link}>
                <CategoryImage src={category.image} alt={category.name} />
                <CategoryName>{category.name}</CategoryName>
              </Link>
            </CategoryCard>
          ))}
        </CategoriesGrid>
      </Section>

      {/* Special Offers */}
      <SpecialOffersSection>
        <SectionTitle>Special Offers</SectionTitle>
        <SpecialOfferCard>
          <SpecialOfferContent>
            <h3>20% OFF</h3>
            <p>On your first order</p>
            <p>Use code: <strong>WELCOME20</strong></p>
            <ShopNowButton to="/products?discount=true">Shop Now</ShopNowButton>
          </SpecialOfferContent>
        </SpecialOfferCard>
      </SpecialOffersSection>
    </HomeContainer>
  );
};

// Styled Components
const HomeContainer = styled.div`
  width: 100%;
`;

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => `${theme.spacing(8)} ${theme.spacing(3)}`};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.light}20 0%, ${({ theme }) => theme.colors.secondary.light}20 100%);
  position: relative;
  overflow: hidden;
  min-height: 80vh;
  justify-content: center;
  text-align: center;

  @media (min-width: 1024px) {
    flex-direction: row;
    text-align: left;
    padding: ${({ theme }) => `${theme.spacing(12)} ${theme.spacing(6)}`};
  }
`;

const HeroContent = styled.div`
  max-width: 600px;
  z-index: 2;
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  @media (min-width: 1024px) {
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.spacing(6)};
  }

  .hero-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: ${({ theme }) => theme.spacing(3)};
    line-height: 1.2;
    color: ${({ theme }) => theme.colors.secondary.main};

    span {
      color: ${({ theme }) => theme.colors.primary.main};
    }

    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }

  .hero-subtitle {
    font-size: 1.25rem;
    color: ${({ theme }) => theme.colors.common.gray[700]};
    margin-bottom: ${({ theme }) => theme.spacing(4)};
    line-height: 1.6;
  }
`;

const HeroImage = styled.img`
  width: 100%;
  max-width: 600px;
  border-radius: ${({ theme }) => theme.shape.borderRadiusLg}px;
  box-shadow: ${({ theme }) => theme.shadows[4]};
  z-index: 1;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Section = styled.section`
  padding: ${({ theme }) => `${theme.spacing(10)} ${theme.spacing(3)}`};
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: ${({ theme }) => theme.spacing(6)};
  color: ${({ theme }) => theme.colors.secondary.main};
  position: relative;
  display: inline-block;
  left: 50%;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.secondary.main});
    border-radius: 2px;
  }
`;

const CategoriesGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(6)};

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const CategoryCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows[2]};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: ${({ theme }) => theme.shadows[4]};
    transform: translateY(-5px);
  }
`;

const CategoryImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const CategoryName = styled.h3`
  padding: ${({ theme }) => theme.spacing(3)};
  text-align: center;
  color: ${({ theme }) => theme.colors.secondary.main};
  font-size: 1.25rem;
  font-weight: 600;
`;

const SpecialOffersSection = styled(Section)`
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => `${theme.spacing(12)} ${theme.spacing(3)}`};
`;

const SpecialOfferCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary.main}, ${({ theme }) => theme.colors.secondary.main});
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  padding: ${({ theme }) => theme.spacing(6)};
  color: white;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: ${({ theme }) => theme.shadows[3]};
`;

const SpecialOfferContent = styled.div`
  h3 {
    font-size: 3rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-weight: 800;
  }

  p {
    font-size: 1.25rem;
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

const Button = styled(Link)`
  display: inline-block;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(4)}`};
  border-radius: ${({ theme }) => theme.shape.borderRadius}px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  margin: ${({ theme }) => `0 ${theme.spacing(2)}`};
`;

const ShopNowButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: 2px solid ${({ theme }) => theme.colors.primary.main};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary.dark};
    border-color: ${({ theme }) => theme.colors.primary.dark};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[2]};
  }
`;

const LearnMoreButton = styled(Button)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary.main};
  border: 2px solid ${({ theme }) => theme.colors.primary.main};

  &:hover {
    background-color: ${({ theme => theme.colors.primary.main})};
    color: white;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows[2]};
  }
`;
