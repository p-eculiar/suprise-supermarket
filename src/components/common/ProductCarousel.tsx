import React from 'react';
import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName?: string;
}

interface ProductCarouselProps {
  products: Product[];
  slidesPerView?: number;
  autoplay?: boolean;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  products,
  slidesPerView = 4,
  autoplay = true,
}) => {
  const navigate = useNavigate();
  const { formatCurrency } = useSettings();

  return (
    <CarouselContainer>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={autoplay ? { delay: 3000, disableOnInteraction: false } : false}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: slidesPerView },
        }}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard onClick={() => navigate(`/products/${product.id}`)}>
              <ProductImage src={product.imageUrl} alt={product.name} />
              <ProductInfo>
                {product.categoryName && <ProductCategory>{product.categoryName}</ProductCategory>}
                <ProductName>{product.name}</ProductName>
                <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
              </ProductInfo>
            </ProductCard>
          </SwiperSlide>
        ))}
      </Swiper>
    </CarouselContainer>
  );
};

const CarouselContainer = styled.div`
  width: 100%;
  
  .swiper {
    padding: 1rem 0 3rem 0;
  }
  
  .swiper-button-next,
  .swiper-button-prev {
    color: ${({ theme }) => theme.colors.primary.main};
    background: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &::after {
      font-size: 20px;
    }
  }
  
  .swiper-pagination-bullet {
    background: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductCategory = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.5rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;
