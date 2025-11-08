import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHeart, FiShoppingCart, FiMinus, FiPlus, FiStar,
  FiFacebook, FiTwitter, FiInstagram, FiLink
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { productService } from '../services/productService';
import toast from '../components/common/Toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  tags: string[];
  sku: string;
  inStock: boolean;
  additionalInfo?: Record<string, string>;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedWeight, setSelectedWeight] = useState('1kg');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'additional' | 'reviews'>('description');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch real product from database
        const dbProduct = await productService.getProductById(id);
        
        if (!dbProduct) {
          toast.error('Product not found');
          navigate('/products');
          return;
        }

        // Transform database product to component format
        const transformedProduct: Product = {
          id: dbProduct.id,
          name: dbProduct.name,
          description: dbProduct.description || 'No description available.',
          price: dbProduct.price,
          comparePrice: dbProduct.discount ? dbProduct.price / (1 - dbProduct.discount / 100) : undefined,
          rating: dbProduct.rating || 4.5,
          reviews: 0, // Can be added to DB later
          images: dbProduct.image_url ? [dbProduct.image_url] : ['https://via.placeholder.com/600'],
          category: dbProduct.category,
          tags: [dbProduct.category], // Can expand this later
          sku: dbProduct.id.slice(0, 12).toUpperCase(),
          inStock: dbProduct.stock > 0,
          additionalInfo: {
            'Product Type': dbProduct.category,
            'Stock Available': `${dbProduct.stock} units`,
            'Status': dbProduct.stock > 0 ? 'In Stock' : 'Out of Stock',
          }
        };
        
        setProduct(transformedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.comparePrice,
      imageUrl: product.images[0],
      categoryName: product.category,
      stock: 100
    }, quantity);
  };

  const discount = product?.comparePrice 
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (loading) return <LoadingContainer>Loading...</LoadingContainer>;
  if (!product) return <ErrorContainer>Product not found</ErrorContainer>;

  return (
    <Container>
      <Breadcrumb>
        <BreadcrumbLink to="/">Home</BreadcrumbLink> / 
        <BreadcrumbLink to="/products">Shop</BreadcrumbLink> / 
        <BreadcrumbCurrent>{product.name}</BreadcrumbCurrent>
      </Breadcrumb>

      <ProductSection>
        <ImageGallery>
          <MainImageContainer as={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <MainImage src={product.images[selectedImage]} alt={product.name} />
            {discount > 0 && <DiscountBadge>-{discount}%</DiscountBadge>}
          </MainImageContainer>
          <Thumbnails>
            {product.images.map((image, index) => (
              <Thumbnail key={index} $active={selectedImage === index} onClick={() => setSelectedImage(index)}>
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </Thumbnail>
            ))}
          </Thumbnails>
        </ImageGallery>

        <ProductInfo>
          <ProductCategory>{product.category}</ProductCategory>
          <ProductName>{product.name}</ProductName>
          <RatingContainer>
            <Stars>
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} fill={i < Math.floor(product.rating) ? '#FFB800' : 'none'} 
                  color={i < Math.floor(product.rating) ? '#FFB800' : '#DDD'} />
              ))}
            </Stars>
            <RatingText>{product.rating} ({product.reviews} Reviews)</RatingText>
          </RatingContainer>
          <PriceContainer>
            <CurrentPrice>${product.price.toFixed(2)}</CurrentPrice>
            {product.comparePrice && <OriginalPrice>${product.comparePrice.toFixed(2)}</OriginalPrice>}
          </PriceContainer>
          <ProductDescription>{product.description}</ProductDescription>
          
          <WeightSection>
            <SectionLabel>Weight</SectionLabel>
            <WeightOptions>
              {['250g', '1kg', '2kg', '5kg'].map((weight) => (
                <WeightOption key={weight} $active={selectedWeight === weight} onClick={() => setSelectedWeight(weight)}>
                  {weight}
                </WeightOption>
              ))}
            </WeightOptions>
          </WeightSection>

          <ActionsRow>
            <QuantitySelector>
              <QuantityButton onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></QuantityButton>
              <QuantityDisplay>{quantity}</QuantityDisplay>
              <QuantityButton onClick={() => setQuantity(quantity + 1)}><FiPlus /></QuantityButton>
            </QuantitySelector>
            <AddToCartButton onClick={handleAddToCart}><FiShoppingCart />Add to Cart</AddToCartButton>
            <BuyNowButton onClick={() => { handleAddToCart(); navigate('/cart'); }}>Buy Now</BuyNowButton>
            <WishlistButton onClick={() => addToWishlist({ id: product.id, name: product.name, price: product.price, originalPrice: product.comparePrice, imageUrl: product.images[0], categoryName: product.category, stock: 100 })} $active={isInWishlist(product.id)}>
              <FiHeart />
            </WishlistButton>
          </ActionsRow>

          <ProductMeta>
            <MetaItem><MetaLabel>SKU:</MetaLabel><MetaValue>{product.sku}</MetaValue></MetaItem>
            <MetaItem><MetaLabel>Category:</MetaLabel><MetaValue>{product.category}</MetaValue></MetaItem>
            <MetaItem><MetaLabel>Tags:</MetaLabel><MetaValue>{product.tags.join(', ')}</MetaValue></MetaItem>
          </ProductMeta>

          <ShareSection>
            <ShareLabel>Share:</ShareLabel>
            <SocialIcons>
              {[FiFacebook, FiTwitter, FiInstagram, FiLink].map((Icon, i) => (
                <SocialIcon key={i}><Icon /></SocialIcon>
              ))}
            </SocialIcons>
          </ShareSection>
        </ProductInfo>
      </ProductSection>

      <TabsSection>
        <TabsHeader>
          {(['description', 'additional', 'reviews'] as const).map((tab) => (
            <Tab key={tab} $active={activeTab === tab} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'reviews' && `(${product.reviews})`}
            </Tab>
          ))}
        </TabsHeader>
        <TabContent>
          {activeTab === 'description' && <DescriptionContent><p>{product.description}</p></DescriptionContent>}
          {activeTab === 'additional' && (
            <AdditionalInfo>
              <InfoTable><tbody>
                {Object.entries(product.additionalInfo || {}).map(([key, value]) => (
                  <InfoRow key={key}><InfoLabel>{key}:</InfoLabel><InfoValue>{value}</InfoValue></InfoRow>
                ))}
              </tbody></InfoTable>
            </AdditionalInfo>
          )}
          {activeTab === 'reviews' && <ReviewsPlaceholder>No reviews yet. Be the first!</ReviewsPlaceholder>}
        </TabContent>
      </TabsSection>

      <RelatedSection>
        <SectionTitle>Explore <HighlightText>Related Products</HighlightText></SectionTitle>
        <RelatedGrid>
          {[1, 2, 3, 4].map((item) => (
            <RelatedProductCard key={item} onClick={() => navigate(`/products/${item}`)}>
              <RelatedBadge>25% off</RelatedBadge>
              <RelatedImage src="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300" alt="Related" />
              <RelatedInfo>
                <RelatedCategory>Fruits</RelatedCategory>
                <RelatedName>Fresh Strawberry</RelatedName>
                <RelatedRating><FiStar fill="#FFB800" color="#FFB800" /><span>4.8</span></RelatedRating>
                <RelatedPrice><span className="current">$8.00</span><span className="original">$10.00</span></RelatedPrice>
              </RelatedInfo>
            </RelatedProductCard>
          ))}
        </RelatedGrid>
      </RelatedSection>
    </Container>
  );
};

export default ProductDetail;

// Styled Components
const Container = styled.div`max-width: 1400px; margin: 0 auto; padding: 2rem; @media (max-width: 768px) { padding: 1rem; }`;
const LoadingContainer = styled.div`display: flex; justify-content: center; align-items: center; min-height: 400px; font-size: 1.25rem; color: #6C9A7F;`;
const ErrorContainer = styled.div`display: flex; justify-content: center; align-items: center; min-height: 400px; font-size: 1.25rem; color: #E74C3C;`;
const Breadcrumb = styled.div`display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; font-size: 0.875rem; color: #636E72;`;
const BreadcrumbLink = styled(Link)`color: #636E72; text-decoration: none; transition: color 0.3s; &:hover { color: #6C9A7F; }`;
const BreadcrumbCurrent = styled.span`color: #6C9A7F; font-weight: 600;`;
const ProductSection = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-bottom: 4rem; @media (max-width: 1024px) { grid-template-columns: 1fr; gap: 2rem; }`;
const ImageGallery = styled.div`display: flex; flex-direction: column; gap: 1rem;`;
const MainImageContainer = styled.div`position: relative; background: #F8F9FA; border-radius: 12px; overflow: hidden; aspect-ratio: 1;`;
const MainImage = styled.img`width: 100%; height: 100%; object-fit: cover;`;
const DiscountBadge = styled.div`position: absolute; top: 1rem; left: 1rem; background: #6C9A7F; color: white; padding: 0.5rem 1rem; border-radius: 25px; font-weight: 700; font-size: 0.875rem;`;
const Thumbnails = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;`;
const Thumbnail = styled.div<{ $active: boolean }>`aspect-ratio: 1; border-radius: 8px; overflow: hidden; cursor: pointer; border: 2px solid ${p => p.$active ? '#6C9A7F' : 'transparent'}; transition: all 0.3s; &:hover { border-color: #6C9A7F; } img { width: 100%; height: 100%; object-fit: cover; }`;
const ProductInfo = styled.div`display: flex; flex-direction: column; gap: 1.5rem;`;
const ProductCategory = styled.div`color: #6C9A7F; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;`;
const ProductName = styled.h1`font-size: 2.5rem; font-weight: 700; color: #2D3436; margin: 0; line-height: 1.2; @media (max-width: 768px) { font-size: 2rem; }`;
const RatingContainer = styled.div`display: flex; align-items: center; gap: 0.75rem;`;
const Stars = styled.div`display: flex; gap: 0.25rem; svg { width: 18px; height: 18px; }`;
const RatingText = styled.span`font-size: 0.95rem; color: #636E72;`;
const PriceContainer = styled.div`display: flex; align-items: center; gap: 1rem;`;
const CurrentPrice = styled.div`font-size: 2rem; font-weight: 700; color: #6C9A7F;`;
const OriginalPrice = styled.div`font-size: 1.25rem; color: #999; text-decoration: line-through;`;
const ProductDescription = styled.p`font-size: 1rem; line-height: 1.8; color: #636E72; margin: 0;`;
const WeightSection = styled.div``;
const SectionLabel = styled.div`font-weight: 600; color: #2D3436; margin-bottom: 0.75rem;`;
const WeightOptions = styled.div`display: flex; gap: 0.75rem;`;
const WeightOption = styled.button<{ $active: boolean }>`padding: 0.75rem 1.5rem; border: 2px solid ${p => p.$active ? '#6C9A7F' : '#E1E8ED'}; background: ${p => p.$active ? '#6C9A7F' : 'white'}; color: ${p => p.$active ? 'white' : '#2D3436'}; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s; &:hover { border-color: #6C9A7F; }`;
const ActionsRow = styled.div`display: flex; gap: 1rem; align-items: center; @media (max-width: 768px) { flex-wrap: wrap; }`;
const QuantitySelector = styled.div`display: flex; align-items: center; border: 2px solid #E1E8ED; border-radius: 8px; overflow: hidden;`;
const QuantityButton = styled.button`width: 45px; height: 50px; background: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; &:hover { background: #F8F9FA; } svg { width: 18px; height: 18px; }`;
const QuantityDisplay = styled.div`width: 60px; text-align: center; font-weight: 600; font-size: 1.125rem;`;
const AddToCartButton = styled.button`flex: 1; padding: 1rem 2rem; background: #6C9A7F; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.75rem; transition: all 0.3s; &:hover { background: #5A8569; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3); } svg { width: 20px; height: 20px; }`;
const BuyNowButton = styled.button`padding: 1rem 2rem; background: #FFB800; color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.3s; &:hover { background: #E5A500; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255, 184, 0, 0.3); }`;
const WishlistButton = styled.button<{ $active: boolean }>`width: 50px; height: 50px; background: ${p => p.$active ? '#6C9A7F' : 'white'}; color: ${p => p.$active ? 'white' : '#2D3436'}; border: 2px solid ${p => p.$active ? '#6C9A7F' : '#E1E8ED'}; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; &:hover { background: #6C9A7F; color: white; border-color: #6C9A7F; } svg { width: 20px; height: 20px; }`;
const ProductMeta = styled.div`display: flex; flex-direction: column; gap: 0.75rem; padding-top: 1.5rem; border-top: 1px solid #E1E8ED;`;
const MetaItem = styled.div`display: flex; gap: 0.5rem; font-size: 0.95rem;`;
const MetaLabel = styled.span`color: #636E72; font-weight: 600; min-width: 80px;`;
const MetaValue = styled.span`color: #2D3436;`;
const ShareSection = styled.div`display: flex; align-items: center; gap: 1rem;`;
const ShareLabel = styled.span`font-weight: 600; color: #2D3436;`;
const SocialIcons = styled.div`display: flex; gap: 0.75rem;`;
const SocialIcon = styled.button`width: 40px; height: 40px; border-radius: 50%; border: 1px solid #E1E8ED; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s; &:hover { background: #6C9A7F; color: white; border-color: #6C9A7F; } svg { width: 18px; height: 18px; }`;
const TabsSection = styled.div`margin-bottom: 4rem;`;
const TabsHeader = styled.div`display: flex; gap: 2rem; border-bottom: 2px solid #E1E8ED; margin-bottom: 2rem; @media (max-width: 768px) { gap: 1rem; }`;
const Tab = styled.button<{ $active: boolean }>`padding: 1rem 0; background: none; border: none; font-size: 1rem; font-weight: 600; color: ${p => p.$active ? '#6C9A7F' : '#636E72'}; border-bottom: 3px solid ${p => p.$active ? '#6C9A7F' : 'transparent'}; margin-bottom: -2px; cursor: pointer; transition: all 0.3s; &:hover { color: #6C9A7F; }`;
const TabContent = styled.div`padding: 2rem; background: #F8F9FA; border-radius: 12px;`;
const DescriptionContent = styled.div`p { margin: 0 0 1rem 0; line-height: 1.8; color: #636E72; &:last-child { margin-bottom: 0; } }`;
const AdditionalInfo = styled.div``;
const InfoTable = styled.table`width: 100%; border-collapse: collapse;`;
const InfoRow = styled.tr`border-bottom: 1px solid #E1E8ED; &:last-child { border-bottom: none; }`;
const InfoLabel = styled.td`padding: 1rem; font-weight: 600; color: #2D3436; width: 200px;`;
const InfoValue = styled.td`padding: 1rem; color: #636E72;`;
const ReviewsPlaceholder = styled.div`text-align: center; padding: 3rem; color: #999; font-size: 1.125rem;`;
const RelatedSection = styled.div``;
const SectionTitle = styled.h2`font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 2rem; color: #2D3436;`;
const HighlightText = styled.span`color: #6C9A7F;`;
const RelatedGrid = styled.div`display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); } @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 480px) { grid-template-columns: 1fr; }`;
const RelatedProductCard = styled.div`background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); position: relative; transition: all 0.3s; cursor: pointer; &:hover { transform: translateY(-5px); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1); }`;
const RelatedBadge = styled.div`position: absolute; top: 1rem; left: 1rem; background: #6C9A7F; color: white; padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; z-index: 1;`;
const RelatedImage = styled.img`width: 100%; aspect-ratio: 1; object-fit: cover;`;
const RelatedInfo = styled.div`padding: 1.25rem;`;
const RelatedCategory = styled.div`font-size: 0.75rem; color: #999; margin-bottom: 0.5rem;`;
const RelatedName = styled.h4`font-size: 1rem; font-weight: 600; color: #2D3436; margin: 0 0 0.5rem 0;`;
const RelatedRating = styled.div`display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; svg { width: 16px; height: 16px; } span { font-size: 0.875rem; color: #636E72; }`;
const RelatedPrice = styled.div`display: flex; align-items: center; gap: 0.75rem; .current { font-size: 1.125rem; font-weight: 700; color: #6C9A7F; } .original { font-size: 0.95rem; color: #999; text-decoration: line-through; }`;
