import styled from 'styled-components';

/**
 * Styled components for consistent image display throughout the app
 */

// Product images for cards and listings
export const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background: #f5f5f5;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

// Large product images for detail pages
export const ProductImageLarge = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: #f5f5f5;
`;

// Avatar images (circular)
export const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  background: #e0e0e0;
`;

// Thumbnail images (small, square)
export const ThumbnailImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #f0f0f0;
  background: #f5f5f5;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

// Category card images
export const CategoryImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  background: #f5f5f5;
`;

// Banner images
export const BannerImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  background: #f5f5f5;
  
  @media (max-width: 768px) {
    height: 200px;
  }
`;

// Order item thumbnail
export const OrderItemThumbnail = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #f0f0f0;
  background: #f5f5f5;
`;

// Image placeholder (when image fails to load)
export const ImagePlaceholder = styled.div<{ $height?: string }>`
  width: 100%;
  height: ${({ $height }) => $height || '200px'};
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 3rem;
`;

// Image container with aspect ratio
export const ImageContainer = styled.div<{ $aspectRatio?: string }>`
  position: relative;
  width: 100%;
  padding-bottom: ${({ $aspectRatio }) => {
    switch ($aspectRatio) {
      case '1:1':
        return '100%';
      case '4:3':
        return '75%';
      case '16:9':
        return '56.25%';
      case '3:2':
        return '66.67%';
      default:
        return '100%';
    }
  }};
  overflow: hidden;
  border-radius: 12px;
  background: #f5f5f5;
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Image with loading state
export const ImageWithLoading = styled.img<{ $loaded?: boolean }>`
  opacity: ${({ $loaded }) => ($loaded ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

// Responsive image grid
export const ImageGrid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns || 3}, 1fr);
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;
