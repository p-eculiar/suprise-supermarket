import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { LoadingSkeletons } from './LoadingSkeletons';

// Shimmer animation for granular loading
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const GranularSkeletonBase = styled.div`
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #f8f8f8 50%,
    #f0f0f0 100%
  );
  background-size: 1000px 100%;
  animation: ${css`${shimmer} 2s infinite linear`};
  border-radius: 4px;
`;

// Product Card Loader
export const ProductCardLoader: React.FC = () => (
  <ProductCardLoaderWrapper>
    <ProductImageLoader />
    <ProductInfoLoader>
      <LoaderLine $width="80%" $height="16px" $marginBottom="8px" />
      <LoaderLine $width="60%" $height="14px" $marginBottom="12px" />
      <LoaderLine $width="40%" $height="20px" />
    </ProductInfoLoader>
  </ProductCardLoaderWrapper>
);

const ProductCardLoaderWrapper = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ProductImageLoader = styled(GranularSkeletonBase)`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0;
`;

const ProductInfoLoader = styled.div`
  padding: 1rem;
`;

interface LoaderLineProps {
  $width?: string;
  $height?: string;
  $marginBottom?: string;
}

const LoaderLine = styled(GranularSkeletonBase)<LoaderLineProps>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
`;

// Home Page Loader
export const HomePageLoader: React.FC = () => (
  <HomePageLoaderWrapper>
    <HeaderLoader>
      <LoaderLine $width="200px" $height="32px" />
    </HeaderLoader>
    <CategoryLoader>
      <LoaderLine $width="100%" $height="40px" />
    </CategoryLoader>
    <ProductGridLoader>
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardLoader key={index} />
      ))}
    </ProductGridLoader>
  </HomePageLoaderWrapper>
);

const HomePageLoaderWrapper = styled.div`
  padding: 1rem;
`;

const HeaderLoader = styled.div`
  margin-bottom: 2rem;
  padding: 1rem 0;
`;

const CategoryLoader = styled.div`
  margin-bottom: 2rem;
`;

const ProductGridLoader = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

// Products Page Loader
export const ProductsPageLoader: React.FC = () => (
  <ProductsPageLoaderWrapper>
    <FilterLoader>
      <LoaderLine $width="150px" $height="24px" $marginBottom="1rem" />
      <div style={{ display: 'flex', gap: '1rem' }}>
        <LoaderLine $width="120px" $height="36px" />
        <LoaderLine $width="120px" $height="36px" />
      </div>
    </FilterLoader>
    <ProductGridLoader>
      {Array.from({ length: 8 }).map((_, index) => (
        <ProductCardLoader key={index} />
      ))}
    </ProductGridLoader>
  </ProductsPageLoaderWrapper>
);

const ProductsPageLoaderWrapper = styled.div`
  padding: 1rem;
`;

const FilterLoader = styled.div`
  margin-bottom: 2rem;
  padding: 1rem 0;
`;

// Table Loader
export const TableLoader: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <TableLoaderWrapper>
    <thead>
      <tr>
        {Array.from({ length: columns }).map((_, index) => (
          <th key={index}>
            <LoaderLine $width="80%" $height="16px" />
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex}>
              <LoaderLine $width="90%" $height="16px" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </TableLoaderWrapper>
);

const TableLoaderWrapper = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    border-bottom: 1px solid #eee;
  }
`;

// Form Loader
export const FormLoader: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <FormLoaderWrapper>
    {Array.from({ length: fields }).map((_, index) => (
      <FormFieldLoader key={index}>
        <LoaderLine $width="120px" $height="14px" $marginBottom="8px" />
        <LoaderLine $width="100%" $height="40px" />
      </FormFieldLoader>
    ))}
    <ButtonLoader>
      <LoaderLine $width="100%" $height="40px" />
    </ButtonLoader>
  </FormLoaderWrapper>
);

const FormLoaderWrapper = styled.div`
  padding: 1rem;
`;

const FormFieldLoader = styled.div`
  margin-bottom: 1.5rem;
`;

const ButtonLoader = styled.div`
  margin-top: 1rem;
`;

// Admin Products Loader
export const AdminProductsLoader: React.FC = () => (
  <AdminProductsLoaderWrapper>
    <HeaderLoader>
      <LoaderLine $width="250px" $height="32px" $marginBottom="1rem" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LoaderLine $width="300px" $height="40px" />
        <LoaderLine $width="120px" $height="40px" />
      </div>
    </HeaderLoader>
    <ProductGridLoader>
      {Array.from({ length: 6 }).map((_, index) => (
        <ProductCardLoader key={index} />
      ))}
    </ProductGridLoader>
  </AdminProductsLoaderWrapper>
);

const AdminProductsLoaderWrapper = styled.div`
  padding: 1rem;
`;

// Inline Loader
export const InlineLoader: React.FC<{ width?: string; height?: string }> = ({ 
  width = '100%', 
  height = '20px' 
}) => (
  <InlineLoaderWrapper $width={width} $height={height} />
);

const InlineLoaderWrapper = styled(GranularSkeletonBase)<{ $width: string; $height: string }>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height};
`;

// Export all loaders
export const GranularLoading = {
  ProductCard: ProductCardLoader,
  HomePage: HomePageLoader,
  ProductsPage: ProductsPageLoader,
  Table: TableLoader,
  Form: FormLoader,
  AdminProducts: AdminProductsLoader,
  Inline: InlineLoader,
};

export default GranularLoading;