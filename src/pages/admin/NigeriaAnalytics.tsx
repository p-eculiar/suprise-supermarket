import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiTrendingUp, FiMapPin, FiShoppingCart, FiDollarSign, 
  FiAlertCircle, FiDownload, FiRefreshCw 
} from 'react-icons/fi';
import { motion } from 'framer-motion';

interface StateData {
  state: string;
  topProduct: string;
  totalPurchases: number;
  averagePrice: number;
  trend: string;
  marketShare: number;
  supermarkets: number;
}

interface ProductRecommendation {
  productName: string;
  averagePrice: number;
  totalSales: number;
  topStates: string[];
  growthRate: number;
  profitMargin: number;
}

const NigeriaAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('30days');

  // Mock data - will be replaced with real Supabase data
  const nigeriaStates: StateData[] = [
    {
      state: 'Lagos',
      topProduct: 'Organic Tomatoes',
      totalPurchases: 15420,
      averagePrice: 5.99,
      trend: '+23%',
      marketShare: 28.5,
      supermarkets: 342
    },
    {
      state: 'Abuja (FCT)',
      topProduct: 'Fresh Strawberries',
      totalPurchases: 8960,
      averagePrice: 7.50,
      trend: '+18%',
      marketShare: 16.8,
      supermarkets: 156
    },
    {
      state: 'Rivers',
      topProduct: 'Organic Tomatoes',
      totalPurchases: 6540,
      averagePrice: 6.25,
      trend: '+15%',
      marketShare: 12.3,
      supermarkets: 98
    },
    {
      state: 'Kano',
      topProduct: 'Green Peas',
      totalPurchases: 5890,
      averagePrice: 2.99,
      trend: '+12%',
      marketShare: 11.0,
      supermarkets: 124
    },
    {
      state: 'Oyo',
      topProduct: 'Organic Tomatoes',
      totalPurchases: 4320,
      averagePrice: 5.75,
      trend: '+20%',
      marketShare: 8.1,
      supermarkets: 87
    },
    {
      state: 'Delta',
      topProduct: 'Fresh Strawberries',
      totalPurchases: 3780,
      averagePrice: 6.99,
      trend: '+14%',
      marketShare: 7.1,
      supermarkets: 65
    },
  ];

  // National top product recommendations
  const topRecommendations: ProductRecommendation[] = [
    {
      productName: 'Organic Tomatoes',
      averagePrice: 5.99,
      totalSales: 26280,
      topStates: ['Lagos', 'Rivers', 'Oyo', 'Enugu', 'Kaduna'],
      growthRate: 23.5,
      profitMargin: 35.2
    },
    {
      productName: 'Fresh Strawberries',
      averagePrice: 7.25,
      totalSales: 12740,
      topStates: ['Abuja', 'Delta', 'Lagos', 'Anambra'],
      growthRate: 18.3,
      profitMargin: 42.8
    },
    {
      productName: 'Green Peas',
      averagePrice: 2.99,
      totalSales: 10450,
      topStates: ['Kano', 'Kaduna', 'Sokoto', 'Katsina'],
      growthRate: 15.7,
      profitMargin: 28.5
    },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    // TODO: Implement Supabase API call
    // const { data, error } = await supabase
    //   .from('product_analytics')
    //   .select('*')
    //   .eq('time_range', timeRange);
    
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Nigeria Market Analytics</Title>
          <Subtitle>State-by-state product performance and recommendations</Subtitle>
        </HeaderLeft>
        <HeaderActions>
          <TimeRangeSelect value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </TimeRangeSelect>
          <RefreshButton onClick={fetchAnalytics} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            Refresh
          </RefreshButton>
          <ExportButton>
            <FiDownload />
            Export Report
          </ExportButton>
        </HeaderActions>
      </Header>

      {/* Top Recommendations Section */}
      <RecommendationsSection>
        <SectionTitle>
          <FiTrendingUp />
          National Product Recommendations
        </SectionTitle>
        <RecommendationsGrid>
          {topRecommendations.map((rec, index) => (
            <RecommendationCard
              key={index}
              as={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <RecBadge $rank={index + 1}>#{index + 1}</RecBadge>
              <RecProductName>{rec.productName}</RecProductName>
              <RecStats>
                <RecStat>
                  <RecStatLabel>Total Sales</RecStatLabel>
                  <RecStatValue>{rec.totalSales.toLocaleString()}</RecStatValue>
                </RecStat>
                <RecStat>
                  <RecStatLabel>Avg Price</RecStatLabel>
                  <RecStatValue>${rec.averagePrice}</RecStatValue>
                </RecStat>
                <RecStat>
                  <RecStatLabel>Growth</RecStatLabel>
                  <RecStatValue $positive>+{rec.growthRate}%</RecStatValue>
                </RecStat>
                <RecStat>
                  <RecStatLabel>Profit Margin</RecStatLabel>
                  <RecStatValue $positive>{rec.profitMargin}%</RecStatValue>
                </RecStat>
              </RecStats>
              <RecTopStates>
                <RecTopStatesLabel>Top States:</RecTopStatesLabel>
                <StateChips>
                  {rec.topStates.map(state => (
                    <StateChip key={state}>{state}</StateChip>
                  ))}
                </StateChips>
              </RecTopStates>
              <RecommendButton>
                <FiAlertCircle />
                Recommended for Stocking
              </RecommendButton>
            </RecommendationCard>
          ))}
        </RecommendationsGrid>
      </RecommendationsSection>

      {/* State Analysis Section */}
      <StateSection>
        <SectionTitle>
          <FiMapPin />
          State-by-State Analysis
        </SectionTitle>

        <StateFilter>
          <FilterButton $active={selectedState === 'all'} onClick={() => setSelectedState('all')}>
            All States
          </FilterButton>
          <FilterButton $active={selectedState === 'south'} onClick={() => setSelectedState('south')}>
            South Region
          </FilterButton>
          <FilterButton $active={selectedState === 'north'} onClick={() => setSelectedState('north')}>
            North Region
          </FilterButton>
          <FilterButton $active={selectedState === 'west'} onClick={() => setSelectedState('west')}>
            West Region
          </FilterButton>
        </StateFilter>

        <StatesGrid>
          {nigeriaStates.map((state, index) => (
            <StateCard
              key={state.state}
              as={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <StateHeader>
                <StateName>{state.state}</StateName>
                <StateShare>{state.marketShare}% share</StateShare>
              </StateHeader>
              
              <TopProductSection>
                <TopProductLabel>Top Product</TopProductLabel>
                <TopProductName>{state.topProduct}</TopProductName>
              </TopProductSection>

              <StateMetrics>
                <Metric>
                  <MetricIcon><FiShoppingCart /></MetricIcon>
                  <MetricInfo>
                    <MetricValue>{state.totalPurchases.toLocaleString()}</MetricValue>
                    <MetricLabel>Purchases</MetricLabel>
                  </MetricInfo>
                </Metric>
                
                <Metric>
                  <MetricIcon><FiDollarSign /></MetricIcon>
                  <MetricInfo>
                    <MetricValue>${state.averagePrice}</MetricValue>
                    <MetricLabel>Avg Price</MetricLabel>
                  </MetricInfo>
                </Metric>
              </StateMetrics>

              <StateFooter>
                <SupermarketCount>{state.supermarkets} supermarkets</SupermarketCount>
                <TrendBadge $positive>{state.trend}</TrendBadge>
              </StateFooter>
            </StateCard>
          ))}
        </StatesGrid>
      </StateSection>

      {/* Insights Section */}
      <InsightsSection>
        <SectionTitle>
          <FiAlertCircle />
          Key Insights & Recommendations
        </SectionTitle>
        <InsightsList>
          <InsightCard>
            <InsightIcon $color="#6C9A7F">💡</InsightIcon>
            <InsightContent>
              <InsightTitle>Top Performing Product</InsightTitle>
              <InsightText>
                <strong>Organic Tomatoes</strong> has the highest purchase rate across 5 states with an average price of $5.99 and 23.5% growth rate. Consider increasing stock levels.
              </InsightText>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightIcon $color="#4ECDC4">📈</InsightIcon>
            <InsightContent>
              <InsightTitle>Market Opportunity</InsightTitle>
              <InsightText>
                Lagos state represents 28.5% of total market share. Focus marketing efforts here for maximum ROI.
              </InsightText>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightIcon $color="#FF9800">⚠️</InsightIcon>
            <InsightContent>
              <InsightTitle>Regional Preference</InsightTitle>
              <InsightText>
                Northern states prefer <strong>Green Peas</strong> while Southern states prefer <strong>Strawberries</strong>. Adjust inventory based on regional demand.
              </InsightText>
            </InsightContent>
          </InsightCard>
        </InsightsList>
      </InsightsSection>
    </Container>
  );
};

export default NigeriaAnalytics;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 3rem;
  
  @media (max-width: 1024px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #636E72;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
`;

const TimeRangeSelect = styled.select`
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const RecommendationsSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
  
  svg {
    color: #6C9A7F;
    width: 24px;
    height: 24px;
  }
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecommendationCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid #6C9A7F;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const RecBadge = styled.div<{ $rank: number }>`
  position: absolute;
  top: -12px;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #FFD700, #FFA500)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #C0C0C0, #A8A8A8)';
    return 'linear-gradient(135deg, #CD7F32, #B87333)';
  }};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const RecProductName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const RecStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const RecStat = styled.div``;

const RecStatLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const RecStatValue = styled.div<{ $positive?: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$positive ? '#4CAF50' : '#2D3436'};
`;

const RecTopStates = styled.div`
  margin-bottom: 1.5rem;
`;

const RecTopStatesLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const StateChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const StateChip = styled.span`
  padding: 0.375rem 0.75rem;
  background: #6C9A7F15;
  color: #6C9A7F;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const RecommendButton = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const StateSection = styled.section`
  margin-bottom: 3rem;
`;

const StateFilter = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#6C9A7F' : 'white'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border: 1px solid ${props => props.$active ? '#6C9A7F' : '#E1E8ED'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #6C9A7F;
    color: ${props => props.$active ? 'white' : '#6C9A7F'};
  }
`;

const StatesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StateCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;

const StateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StateName = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const StateShare = styled.div`
  font-size: 0.75rem;
  color: #6C9A7F;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: #6C9A7F15;
  border-radius: 20px;
`;

const TopProductSection = styled.div`
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TopProductLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
`;

const TopProductName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
`;

const StateMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Metric = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const MetricIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #6C9A7F15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const MetricInfo = styled.div``;

const MetricValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
`;

const StateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #F0F0F0;
`;

const SupermarketCount = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const TrendBadge = styled.div<{ $positive?: boolean }>`
  font-weight: 700;
  color: ${props => props.$positive ? '#4CAF50' : '#E74C3C'};
`;

const InsightsSection = styled.section``;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InsightCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1.5rem;
`;

const InsightIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${props => `${props.$color}15`};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const InsightText = styled.p`
  font-size: 0.95rem;
  color: #636E72;
  line-height: 1.6;
  margin: 0;
  
  strong {
    color: #6C9A7F;
    font-weight: 700;
  }
`;
