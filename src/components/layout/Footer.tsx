import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Suprise Supermarket</h3>
          <p>Your one-stop shop for all your grocery needs. Quality products at affordable prices.</p>
          <SocialLinks>
            <a href="https://facebook.com" aria-label="Facebook">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" aria-label="Twitter">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </a>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <h4>Quick Links</h4>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/products">Products</FooterLink>
          <FooterLink to="/services">Services</FooterLink>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterSection>

        <FooterSection>
          <h4>Customer Service</h4>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/shipping-returns">Shipping & Returns</FooterLink>
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="/terms-conditions">Terms & Conditions</FooterLink>
        </FooterSection>

        <FooterSection>
          <h4>Contact Us</h4>
          <ContactInfo>
            <FaMapMarkerAlt />
            <span>123 Grocery St, City, Country</span>
          </ContactInfo>
          <ContactInfo>
            <FaPhone />
            <span>+1 234 567 890</span>
          </ContactInfo>
          <ContactInfo>
            <FaEnvelope />
            <span>info@sursupermarket.com</span>
          </ContactInfo>
          <ContactInfo>
            <FaClock />
            <span>Mon-Sun: 7:00 AM - 10:00 PM</span>
          </ContactInfo>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <p>&copy; {currentYear} Suprise Supermarket. All rights reserved.</p>
        <div>
          <a href="#">Privacy Policy</a>
          <span> | </span>
          <a href="#">Terms of Service</a>
        </div>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.secondary.main};
  color: ${({ theme }) => theme.colors.common.white};
  padding: ${({ theme }) => `${theme.spacing(6)} 0 0`};
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${({ theme }) => theme.spacing(4)};
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const FooterSection = styled.div`
  h3, h4 {
    color: ${({ theme }) => theme.colors.common.white};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: 1.25rem;
  }
  
  p {
    color: ${({ theme }) => theme.colors.common.gray[200]};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    line-height: 1.6;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-top: ${({ theme }) => theme.spacing(3)};
  
  a {
    color: ${({ theme }) => theme.colors.common.white};
    font-size: 1.5rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: ${({ theme }) => theme.colors.common.gray[200]};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
  text-decoration: none;
  transition: color 0.3s ease, padding-left 0.3s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary.main};
    padding-left: ${({ theme }) => theme.spacing(1)};
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.colors.common.gray[200]};
  
  svg {
    margin-right: ${({ theme }) => theme.spacing(1.5)};
    margin-top: ${({ theme }) => theme.spacing(0.5)};
    min-width: 20px;
    color: ${({ theme }) => theme.colors.primary.main};
  }
  
  span {
    line-height: 1.5;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding: ${({ theme }) => `${theme.spacing(4)} ${theme.spacing(3)}`};
  margin-top: ${({ theme }) => theme.spacing(6)};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  
  p, a {
    color: ${({ theme }) => theme.colors.common.gray[300]};
    font-size: 0.875rem;
  }
  
  a {
    text-decoration: none;
    transition: color 0.3s ease;
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary.main};
    }
  }
  
  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;
