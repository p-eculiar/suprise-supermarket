import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';

const WishlistIcon: React.FC = () => {
  const { wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <WishlistContainer>
      <WishlistButton
        onClick={() => (window.location.href = '/wishlist')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiHeart />
        {wishlistItems.length > 0 && (
          <WishlistBadge>{wishlistItems.length}</WishlistBadge>
        )}
      </WishlistButton>
    </WishlistContainer>
  );
};

export default WishlistIcon;

// Styled Components
const WishlistContainer = styled.div`
  position: relative;
`;

const WishlistButton = styled(motion.button)`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  svg {
    width: 20px;
    height: 20px;
    color: #636E72;
  }

  &:hover {
    background: #6C9A7F;
    border-color: #6C9A7F;
    
    svg {
      color: white;
    }
  }
`;

const WishlistBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: #E74C3C;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
`;