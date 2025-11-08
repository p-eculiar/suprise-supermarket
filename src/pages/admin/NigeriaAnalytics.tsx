import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiTrendingUp, FiMapPin, FiShoppingCart, FiDollarSign, 
  FiAlertCircle, FiDownload, FiRefreshCw 
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { analyticsService, StateData, ProductRecommendation } from '../../services/analyticsService';
import { useSettings } from '../../contexts/SettingsContext';

const NigeriaAnalytics: React.FC = () => {
  const { formatCurrency } = useSettings();
  const [loading, setLoading] = useState(false);
  const [selectedState, setSelectedState] = useState<string>('all');
  const [timeRange, setTimeRange] = useState('30days');
  const [nigeriaStates, setNigeriaStates] = useState<StateData[]>([]);
  const [topRecommendations, setTopRecommendations] = useState<ProductRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'mock' | 'api' | 'database'>('mock');

  // Fetch data using the analytics service
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { states, recommendations, source } = await analyticsService.fetchAnalyticsData();
      setNigeriaStates(states);
      setTopRecommendations(recommendations);
      setDataSource(source);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Create analytics tables
  const createAnalyticsTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await analyticsService.createAnalyticsTables();
      // After creating tables, fetch data again
      await fetchData();
    } catch (err) {
      console.error('Error creating analytics tables:', err);
      setError(err instanceof Error ? err.message : 'Failed to create analytics tables');
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Filter states based on selected region
  const filteredStates = nigeriaStates.filter(state => {
    if (selectedState === 'all') return true;
    
    // Define regions (this is a simplified example)
    const southStates = ['Lagos', 'Ogun', 'Ondo', 'Osun', 'Ekiti', 'Delta', 'Rivers', 'Bayelsa', 'Akwa Ibom', 'Cross River', 'Abuja (FCT)'];
    const northStates = ['Kano', 'Kaduna', 'Katsina', 'Kebbi', 'Sokoto', 'Jigawa', 'Yobe', 'Borno', 'Niger', 'Plateau', 'Bauchi', 'Gombe', 'Adamawa', 'Taraba', 'Nassarawa'];
    const westStates = ['Oyo', 'Ogun', 'Ondo', 'Osun', 'Ekiti', 'Lagos'];
    
    switch (selectedState) {
      case 'south':
        return southStates.includes(state.state);
      case 'north':
        return northStates.includes(state.state);
      case 'west':
        return westStates.includes(state.state);
      default:
        return true;
    }
  });

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Nigeria Market Analytics</Title>
          <Subtitle>State-by-state product performance and recommendations</Subtitle>
          <DataSourceInfo>
            Data source: {dataSource === 'database' ? 'Database' : dataSource === 'api' ? 'External APIs' : 'Mock Data'}
          </DataSourceInfo>
        </HeaderLeft>
        <HeaderActions>
          <TimeRangeSelect value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </TimeRangeSelect>
          <RefreshButton onClick={fetchData} disabled={loading}>
            <FiRefreshCw className={loading ? 'spinning' : ''} />
            Refresh
          </RefreshButton>
          <ExportButton>
            <FiDownload />
            Export Report
          </ExportButton>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          Error: {error}
          <RetryButton onClick={fetchData}>Retry</RetryButton>
        </ErrorMessage>
      )}

      {/* Top Recommendations Section */}
      <RecommendationsSection>
        <SectionTitle>
          <FiTrendingUp />
          National Product Recommendations
        </SectionTitle>
        {loading ? (
          <LoadingMessage>Loading recommendations...</LoadingMessage>
        ) : (
          <RecommendationsGrid>
            {topRecommendations.map((rec, index) => (
              <RecommendationCard
                key={rec.id}
                as={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RecBadge $rank={index + 1}>#{index + 1}</RecBadge>
                <RecProductName>{rec.product_name}</RecProductName>
                <RecStats>
                  <RecStat>
                    <RecStatLabel>Total Sales</RecStatLabel>
                    <RecStatValue>{rec.total_sales.toLocaleString()}</RecStatValue>
                  </RecStat>
                  <RecStat>
                    <RecStatLabel>Avg Price</RecStatLabel>
                    <RecStatValue>{formatCurrency(rec.average_price, 'NGN')}</RecStatValue>
                  </RecStat>
                  <RecStat>
                    <RecStatLabel>Growth</RecStatLabel>
                    <RecStatValue $positive={rec.growth_rate >= 0}>{rec.growth_rate >= 0 ? '+' : ''}{rec.growth_rate}%</RecStatValue>
                  </RecStat>
                  <RecStat>
                    <RecStatLabel>Profit Margin</RecStatLabel>
                    <RecStatValue $positive>{rec.profit_margin}%</RecStatValue>
                  </RecStat>
                </RecStats>
                <RecTopStates>
                  <RecTopStatesLabel>Top States:</RecTopStatesLabel>
                  <StateChips>
                    {Array.isArray(rec.top_states) ? rec.top_states.slice(0, 3).map(state => (
                      <StateChip key={state}>{state}</StateChip>
                    )) : (
                      <StateChip>{String(rec.top_states)}</StateChip>
                    )}
                  </StateChips>
                </RecTopStates>
                <RecommendButton>
                  <FiAlertCircle />
                  Recommended for Stocking
                </RecommendButton>
              </RecommendationCard>
            ))}
          </RecommendationsGrid>
        )}
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

        {loading ? (
          <LoadingMessage>Loading state analytics...</LoadingMessage>
        ) : (
          <StatesGrid>
            {filteredStates.map((state, index) => (
              <StateCard
                key={state.id}
                as={motion.div}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <StateHeader>
                  <StateName>{state.state}</StateName>
                  <StateShare>{state.market_share}% share</StateShare>
                </StateHeader>
                
                <TopProductSection>
                  <TopProductLabel>Top Product</TopProductLabel>
                  <TopProductName>{state.top_product}</TopProductName>
                </TopProductSection>

                <StateMetrics>
                  <Metric>
                    <MetricIcon><FiShoppingCart /></MetricIcon>
                    <MetricInfo>
                      <MetricValue>{state.total_purchases.toLocaleString()}</MetricValue>
                      <MetricLabel>Purchases</MetricLabel>
                    </MetricInfo>
                  </Metric>
                  
                  <Metric>
                    <MetricIcon><FiDollarSign /></MetricIcon>
                    <MetricInfo>
                      <MetricValue>{formatCurrency(state.average_price, 'NGN')}</MetricValue>
                      <MetricLabel>Avg Price</MetricLabel>
                    </MetricInfo>
                  </Metric>
                </StateMetrics>

                <StateFooter>
                  <SupermarketCount>{state.supermarkets_count} supermarkets</SupermarketCount>
                  <TrendBadge $positive={state.trend.startsWith('+')}>{state.trend}</TrendBadge>
                </StateFooter>
              </StateCard>
            ))}
          </StatesGrid>
        )}
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
                <strong>{topRecommendations[0]?.product_name || 'Rice'}</strong> has the highest purchase rate across multiple states with an average price of {formatCurrency(topRecommendations[0]?.average_price || 5.99, 'NGN')} and {topRecommendations[0]?.growth_rate || '23.5'}% growth rate. Consider increasing stock levels.
              </InsightText>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightIcon $color="#4ECDC4">📈</InsightIcon>
            <InsightContent>
              <InsightTitle>Market Opportunity</InsightTitle>
              <InsightText>
                {filteredStates[0]?.state || 'Lagos'} state represents {filteredStates[0]?.market_share || '28.5'}% of total market share. Focus marketing efforts here for maximum ROI.
              </InsightText>
            </InsightContent>
          </InsightCard>

          <InsightCard>
            <InsightIcon $color="#FF9800">⚠️</InsightIcon>
            <InsightContent>
              <InsightTitle>Regional Preference</InsightTitle>
              <InsightText>
                Northern states prefer <strong>Grains</strong> while Southern states prefer <strong>Fresh Produce</strong>. Adjust inventory based on regional demand.
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
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
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
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const HeaderLeft = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #636E72;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const DataSourceInfo = styled.div`
  font-size: 0.875rem;
  color: #6C9A7F;
  margin-top: 0.5rem;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
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
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
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
  white-space: nowrap;
  
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
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
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
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
`;

const RetryButton = styled.button`
  background: #6C9A7F;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #5A8569;
  }
  
  @media (max-width: 480px) {
    align-self: flex-end;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    padding: 1rem;
    font-size: 0.9rem;
  }
`;

const RecommendationsSection = styled.section`
  margin-bottom: 3rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
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
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
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
  
  @media (max-width: 480px) {
    gap: 1rem;
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
  
  @media (max-width: 480px) {
    padding: 1rem;
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
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
    top: -8px;
    right: 1rem;
  }
`;

const RecProductName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
`;

const RecStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
`;

const RecStat = styled.div``;

const RecStatLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const RecStatValue = styled.div<{ $positive?: boolean }>`
  font-size: 1.125rem;
  font-weight: 700;
  color: ${props => props.$positive ? '#4CAF50' : '#2D3436'};
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const RecTopStates = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const RecTopStatesLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.5rem;
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
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
  
  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
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
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const StateSection = styled.section`
  margin-bottom: 3rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const StateFilter = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
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
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
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
  
  @media (max-width: 480px) {
    gap: 1rem;
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
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
  }
`;

const StateName = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const StateShare = styled.div`
  font-size: 0.75rem;
  color: #6C9A7F;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  background: #6C9A7F15;
  border-radius: 20px;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }
`;

const TopProductSection = styled.div`
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const TopProductLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const TopProductName = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const StateMetrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }
`;

const Metric = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
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
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const MetricInfo = styled.div``;

const MetricValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const MetricLabel = styled.div`
  font-size: 0.75rem;
  color: #999;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const StateFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #F0F0F0;
  
  @media (max-width: 480px) {
    padding-top: 0.75rem;
  }
`;

const SupermarketCount = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const TrendBadge = styled.div<{ $positive?: boolean }>`
  font-weight: 700;
  color: ${props => props.$positive ? '#4CAF50' : '#E74C3C'};
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const InsightsSection = styled.section``;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const InsightCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    gap: 1rem;
  }
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
  
  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
`;

const InsightContent = styled.div`
  flex: 1;
`;

const InsightTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
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
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
