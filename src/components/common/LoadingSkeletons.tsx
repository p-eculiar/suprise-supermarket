import React from 'react';
import styled, { css, keyframes } from 'styled-components';

// Shimmer animation
const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const SkeletonBase = styled.div`
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

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <ProductCardSkeletonWrapper>
    <ProductImageSkeleton />
    <ProductInfoSkeleton>
      <SkeletonLine $width="80%" $height="16px" $marginBottom="8px" />
      <SkeletonLine $width="60%" $height="14px" $marginBottom="12px" />
      <SkeletonLine $width="40%" $height="20px" />
    </ProductInfoSkeleton>
  </ProductCardSkeletonWrapper>
);

const ProductCardSkeletonWrapper = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ProductImageSkeleton = styled(SkeletonBase)`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0;
`;

const ProductInfoSkeleton = styled.div`
  padding: 1rem;
`;

interface SkeletonLineProps {
  $width?: string;
  $height?: string;
  $marginBottom?: string;
}

const SkeletonLine = styled(SkeletonBase)<SkeletonLineProps>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '16px'};
  margin-bottom: ${({ $marginBottom }) => $marginBottom || '0'};
`;

// Product Grid Skeleton
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <ProductGridSkeletonWrapper>
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </ProductGridSkeletonWrapper>
);

const ProductGridSkeletonWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

// Order Card Skeleton
export const OrderCardSkeleton: React.FC = () => (
  <OrderCardSkeletonWrapper>
    <div>
      <SkeletonLine $width="120px" $height="20px" $marginBottom="8px" />
      <SkeletonLine $width="200px" $height="14px" />
    </div>
    <div>
      <SkeletonLine $width="80px" $height="24px" />
    </div>
  </OrderCardSkeletonWrapper>
);

const OrderCardSkeletonWrapper = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <TableRowSkeletonWrapper>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <SkeletonLine $width="90%" $height="16px" />
      </td>
    ))}
  </TableRowSkeletonWrapper>
);

const TableRowSkeletonWrapper = styled.tr`
  td {
    padding: 1rem;
  }
`;

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => (
  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
    <tbody>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton key={index} columns={columns} />
      ))}
    </tbody>
  </table>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <StatsCardSkeletonWrapper>
    <SkeletonCircle />
    <div>
      <SkeletonLine $width="80px" $height="12px" $marginBottom="8px" />
      <SkeletonLine $width="60px" $height="24px" />
    </div>
  </StatsCardSkeletonWrapper>
);

const StatsCardSkeletonWrapper = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SkeletonCircle = styled(SkeletonBase)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
`;

// Profile Header Skeleton
export const ProfileHeaderSkeleton: React.FC = () => (
  <ProfileHeaderSkeletonWrapper>
    <SkeletonCircle />
    <div>
      <SkeletonLine $width="200px" $height="24px" $marginBottom="8px" />
      <SkeletonLine $width="150px" $height="16px" />
    </div>
  </ProfileHeaderSkeletonWrapper>
);

const ProfileHeaderSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
`;

// Text Skeleton
export const TextSkeleton: React.FC<{ 
  lines?: number; 
  width?: string;
}> = ({ lines = 3, width = '100%' }) => (
  <TextSkeletonWrapper>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonLine 
        key={index} 
        $width={index === lines - 1 ? '60%' : width} 
        $height="14px" 
        $marginBottom="8px" 
      />
    ))}
  </TextSkeletonWrapper>
);

const TextSkeletonWrapper = styled.div`
  padding: 1rem 0;
`;

// Image Skeleton
export const ImageSkeleton: React.FC<{ 
  width?: string; 
  height?: string;
  aspectRatio?: string;
}> = ({ width = '100%', height, aspectRatio }) => (
  <ImageSkeletonWrapper 
    $width={width} 
    $height={height} 
    $aspectRatio={aspectRatio}
  />
);

const ImageSkeletonWrapper = styled(SkeletonBase)<{
  $width?: string;
  $height?: string;
  $aspectRatio?: string;
}>`
  width: ${({ $width }) => $width};
  height: ${({ $height }) => $height || 'auto'};
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || 'auto'};
  border-radius: 8px;
`;

// List Item Skeleton
export const ListItemSkeleton: React.FC = () => (
  <ListItemSkeletonWrapper>
    <SkeletonCircle style={{ width: '40px', height: '40px' }} />
    <div style={{ flex: 1 }}>
      <SkeletonLine $width="80%" $height="16px" $marginBottom="6px" />
      <SkeletonLine $width="50%" $height="12px" />
    </div>
  </ListItemSkeletonWrapper>
);

const ListItemSkeletonWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
`;

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <FormSkeletonWrapper>
    {Array.from({ length: fields }).map((_, index) => (
      <FormFieldSkeleton key={index}>
        <SkeletonLine $width="120px" $height="14px" $marginBottom="8px" />
        <SkeletonLine $width="100%" $height="40px" />
      </FormFieldSkeleton>
    ))}
  </FormSkeletonWrapper>
);

const FormSkeletonWrapper = styled.div`
  padding: 1rem;
`;

const FormFieldSkeleton = styled.div`
  margin-bottom: 1.5rem;
`;

// Page Loading Skeleton
export const PageLoadingSkeleton: React.FC = () => (
  <PageLoadingWrapper>
    <SkeletonLine $width="300px" $height="32px" $marginBottom="2rem" />
    <ProductGridSkeleton count={6} />
  </PageLoadingWrapper>
);

const PageLoadingWrapper = styled.div`
  padding: 2rem;
`;

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <DashboardSkeletonWrapper>
    <StatsGrid>
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </StatsGrid>
    <SkeletonLine $width="200px" $height="24px" $marginBottom="1rem" />
    <OrderCardSkeleton />
    <OrderCardSkeleton />
    <OrderCardSkeleton />
  </DashboardSkeletonWrapper>
);

const DashboardSkeletonWrapper = styled.div`
  padding: 2rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// Export all components
export const LoadingSkeletons = {
  ProductCard: ProductCardSkeleton,
  ProductGrid: ProductGridSkeleton,
  OrderCard: OrderCardSkeleton,
  TableRow: TableRowSkeleton,
  Table: TableSkeleton,
  StatsCard: StatsCardSkeleton,
  ProfileHeader: ProfileHeaderSkeleton,
  Text: TextSkeleton,
  Image: ImageSkeleton,
  ListItem: ListItemSkeleton,
  Form: FormSkeleton,
  Page: PageLoadingSkeleton,
  Dashboard: DashboardSkeleton,
};

export default LoadingSkeletons;
