import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import { FaCcVisa, FaCcMastercard, FaCcDiscover, FaCcAmex, FaCcPaypal } from 'react-icons/fa';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        {/* Store Location */}
        <FooterSection>
          <SectionTitle>STORE LOCATION</SectionTitle>
          <ContactItem>
            <IconWrapper>
              <FaPhoneAlt />
            </IconWrapper>
            <ContactDetails>
              <ContactLabel>CALL US 24/7</ContactLabel>
              <ContactValue>(800) 555-0151</ContactValue>
              <ContactEmail>contact@suprise.com</ContactEmail>
            </ContactDetails>
          </ContactItem>
          
          <StoreAddress>
            <strong>Suprise Supermarket</strong><br />
            419 State 414 Rte<br />
            Beaver Dams, New York<br />
            14812, USA
          </StoreAddress>
          
          <StoreHours>
            <strong>Store Hours:</strong><br />
            8:00am - 10:00pm<br />
            Sunday: Closed
          </StoreHours>
        </FooterSection>

        {/* Information */}
        <FooterSection>
          <SectionTitle>INFORMATION</SectionTitle>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/blog">Blog</FooterLink>
          <FooterLink to="/checkout">Checkout</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/services">Service</FooterLink>
        </FooterSection>

        {/* My Account */}
        <FooterSection>
          <SectionTitle>MY ACCOUNT</SectionTitle>
          <FooterLink to="/account">My Account</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/cart">Shopping Cart</FooterLink>
          <FooterLink to="/wishlist">Wishlist</FooterLink>
        </FooterSection>

        {/* Categories */}
        <FooterSection>
          <SectionTitle>CATEGORIES</SectionTitle>
          <FooterLink to="/categories/fruits">Fruit & Vegetables</FooterLink>
          <FooterLink to="/categories/meat">Meat & Fish</FooterLink>
          <FooterLink to="/categories/bread">Bread & Bakery</FooterLink>
          <FooterLink to="/categories/beauty">Beauty & Health</FooterLink>
        </FooterSection>

        {/* Accept Payment & Follow Us */}
        <FooterSection>
          <SectionTitle>ACCEPT PAYMENT</SectionTitle>
          <PaymentIcons>
            <PaymentIcon><FaCcVisa /></PaymentIcon>
            <PaymentIcon><FaCcDiscover /></PaymentIcon>
            <PaymentIcon><FaCcMastercard /></PaymentIcon>
            <PaymentIcon><FaCcAmex /></PaymentIcon>
            <PaymentIcon><FaCcPaypal /></PaymentIcon>
          </PaymentIcons>
          
          <SectionTitle style={{marginTop: '1.5rem'}}>FOLLOW US</SectionTitle>
          <SocialIcons>
            <SocialIcon href="https://facebook.com" aria-label="Facebook">
              <FaFacebookF />
            </SocialIcon>
            <SocialIcon href="https://twitter.com" aria-label="Twitter">
              <FaTwitter />
            </SocialIcon>
            <SocialIcon href="https://instagram.com" aria-label="Instagram">
              <FaInstagram />
            </SocialIcon>
            <SocialIcon href="https://pinterest.com" aria-label="Pinterest">
              <FaPinterestP />
            </SocialIcon>
          </SocialIcons>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <Copyright>Copyright © {currentYear} Suprise Supermarket. All Rights Reserved.</Copyright>
      </FooterBottom>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  background-color: #F8F9FA;
  color: #636E72;
  padding: 4rem 0 0;
  margin-top: auto;
  border-top: 1px solid #E1E8ED;
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 3rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr;
  }
`;

const FooterSection = styled.div``;

const SectionTitle = styled.h4`
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #2D3436;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
`;

const ContactItem = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  background: #6C9A7F;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1rem;
`;

const ContactDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 600;
  color: #636E72;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const ContactValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ContactEmail = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const StoreAddress = styled.div`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #636E72;
  margin-bottom: 1.25rem;
  
  strong {
    color: #2D3436;
  }
`;

const StoreHours = styled.div`
  font-size: 0.875rem;
  line-height: 1.6;
  color: #636E72;
  
  strong {
    color: #2D3436;
  }
`;

const FooterLink = styled(Link)`
  display: block;
  color: #636E72;
  margin-bottom: 0.75rem;
  text-decoration: none;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  
  &:hover {
    color: #6C9A7F;
    padding-left: 0.5rem;
  }
`;

const PaymentIcons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const PaymentIcon = styled.div`
  width: 38px;
  height: 26px;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: #636E72;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6C9A7F;
    transform: translateY(-2px);
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SocialIcon = styled.a`
  width: 32px;
  height: 32px;
  background: #E8F5EC;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  text-decoration: none;
  
  &:hover {
    background: #6C9A7F;
    color: white;
    transform: translateY(-2px);
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding: 1.5rem 2rem;
  background: #FFFFFF;
  border-top: 1px solid #E1E8ED;
`;

const Copyright = styled.p`
  color: #636E72;
  font-size: 0.875rem;
  margin: 0;
`;
