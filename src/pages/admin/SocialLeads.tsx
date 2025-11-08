import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import {
  FiTwitter,
  FiFacebook,
  FiMessageCircle,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiExternalLink,
  FiCheckCircle,
} from 'react-icons/fi';

interface SocialLead {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'whatsapp';
  author_name: string;
  author_handle: string;
  post_content: string;
  post_url: string;
  contact_info?: string;
  keywords_matched: string[];
  sentiment: 'positive' | 'neutral' | 'urgent';
  status: 'new' | 'contacted' | 'converted' | 'ignored';
  created_at: string;
}

const SocialLeads: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'twitter' | 'facebook' | 'instagram' | 'whatsapp'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'new' | 'contacted' | 'converted' | 'ignored'>('all');
  const [isScanning, setIsScanning] = useState(false);

  // Fetch social leads
  const { data: leads, isLoading } = useQuery({
    queryKey: ['social-leads', selectedPlatform, selectedStatus],
    queryFn: async () => {
      let query = supabase.from('social_leads').select('*');

      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform);
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data as SocialLead[];
    },
  });

  // Statistics
  const stats = {
    totalLeads: leads?.length || 0,
    newLeads: leads?.filter((l) => l.status === 'new').length || 0,
    contacted: leads?.filter((l) => l.status === 'contacted').length || 0,
    converted: leads?.filter((l) => l.status === 'converted').length || 0,
  };

  // Update lead status mutation
  const updateLeadMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: string }) => {
      const { error } = await supabase
        .from('social_leads')
        .update({ status })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-leads'] });
    },
  });

  // Scan for new leads
  const handleScanLeads = async () => {
    setIsScanning(true);
    
    try {
      // This would typically call a backend API that scrapes social media
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In production, you would call:
      // const response = await fetch('/api/scan-social-leads', { method: 'POST' });
      // const newLeads = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ['social-leads'] });
      alert('Scan completed! Check for new leads.');
    } catch (error) {
      console.error('Error scanning leads:', error);
      alert('Failed to scan for leads');
    } finally {
      setIsScanning(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return <FiTwitter />;
      case 'facebook':
        return <FiFacebook />;
      case 'whatsapp':
        return <FiMessageCircle />;
      default:
        return <FiMessageCircle />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'twitter':
        return '#1DA1F2';
      case 'facebook':
        return '#4267B2';
      case 'instagram':
        return '#E4405F';
      case 'whatsapp':
        return '#25D366';
      default:
        return '#6C9A7F';
    }
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Social Media Leads</Title>
          <Subtitle>Find and contact people looking for groceries or bulk orders</Subtitle>
        </HeaderContent>
        <ScanButton onClick={handleScanLeads} disabled={isScanning}>
          <FiRefreshCw className={isScanning ? 'spinning' : ''} />
          {isScanning ? 'Scanning...' : 'Scan for New Leads'}
        </ScanButton>
      </Header>

      {/* Statistics */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#FF9800">
            <FiMessageCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Leads</StatLabel>
            <StatValue>{stats.totalLeads}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4ECDC4">
            <FiCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>New Leads</StatLabel>
            <StatValue>{stats.newLeads}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#9B59B6">
            <FiMail />
          </StatIcon>
          <StatInfo>
            <StatLabel>Contacted</StatLabel>
            <StatValue>{stats.contacted}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>Converted</StatLabel>
            <StatValue>{stats.converted}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <FilterSection>
          <FilterLabel>Platform:</FilterLabel>
          <FilterButtons>
            <FilterButton $active={selectedPlatform === 'all'} onClick={() => setSelectedPlatform('all')}>
              All
            </FilterButton>
            <FilterButton $active={selectedPlatform === 'twitter'} onClick={() => setSelectedPlatform('twitter')}>
              Twitter
            </FilterButton>
            <FilterButton $active={selectedPlatform === 'facebook'} onClick={() => setSelectedPlatform('facebook')}>
              Facebook
            </FilterButton>
            <FilterButton $active={selectedPlatform === 'instagram'} onClick={() => setSelectedPlatform('instagram')}>
              Instagram
            </FilterButton>
            <FilterButton $active={selectedPlatform === 'whatsapp'} onClick={() => setSelectedPlatform('whatsapp')}>
              WhatsApp
            </FilterButton>
          </FilterButtons>
        </FilterSection>

        <FilterSection>
          <FilterLabel>Status:</FilterLabel>
          <FilterButtons>
            <FilterButton $active={selectedStatus === 'all'} onClick={() => setSelectedStatus('all')}>
              All
            </FilterButton>
            <FilterButton $active={selectedStatus === 'new'} onClick={() => setSelectedStatus('new')}>
              New
            </FilterButton>
            <FilterButton $active={selectedStatus === 'contacted'} onClick={() => setSelectedStatus('contacted')}>
              Contacted
            </FilterButton>
            <FilterButton $active={selectedStatus === 'converted'} onClick={() => setSelectedStatus('converted')}>
              Converted
            </FilterButton>
          </FilterButtons>
        </FilterSection>
      </FilterBar>

      {/* Leads List */}
      <LeadsContainer>
        {isLoading ? (
          <LoadingText>Loading leads...</LoadingText>
        ) : leads && leads.length > 0 ? (
          leads.map((lead) => (
            <LeadCard key={lead.id}>
              <LeadHeader>
                <PlatformBadge $color={getPlatformColor(lead.platform)}>
                  {getPlatformIcon(lead.platform)}
                  {lead.platform}
                </PlatformBadge>
                <LeadDate>{new Date(lead.created_at).toLocaleDateString()}</LeadDate>
              </LeadHeader>

              <AuthorInfo>
                <AuthorName>{lead.author_name}</AuthorName>
                <AuthorHandle>@{lead.author_handle}</AuthorHandle>
              </AuthorInfo>

              <PostContent>{lead.post_content}</PostContent>

              {lead.keywords_matched && lead.keywords_matched.length > 0 && (
                <Keywords>
                  <KeywordLabel>Matched keywords:</KeywordLabel>
                  {lead.keywords_matched.map((keyword, idx) => (
                    <Keyword key={idx}>{keyword}</Keyword>
                  ))}
                </Keywords>
              )}

              {lead.contact_info && (
                <ContactInfo>
                  <FiPhone /> {lead.contact_info}
                </ContactInfo>
              )}

              <LeadActions>
                <ActionButton
                  href={lead.post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiExternalLink /> View Post
                </ActionButton>

                <StatusSelect
                  value={lead.status}
                  onChange={(e) =>
                    updateLeadMutation.mutate({
                      leadId: lead.id,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="ignored">Ignored</option>
                </StatusSelect>

                <ContactButton
                  href={`https://wa.me/${lead.contact_info?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiMessageCircle /> Contact
                </ContactButton>
              </LeadActions>
            </LeadCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              <FiMessageCircle />
            </EmptyIcon>
            <EmptyText>No leads found</EmptyText>
            <EmptySubtext>Click "Scan for New Leads" to find potential customers</EmptySubtext>
          </EmptyState>
        )}
      </LeadsContainer>

      {/* Info Box */}
      <InfoBox>
        <InfoTitle>🔍 How This Works</InfoTitle>
        <InfoText>
          This feature scans social media platforms for posts containing keywords like:
          <ul>
            <li>"need groceries"</li>
            <li>"bulk order"</li>
            <li>"foodstuff supplier"</li>
            <li>"office pantry"</li>
            <li>"send groceries to Nigeria"</li>
          </ul>
          Click "Scan for New Leads" to search for potential customers in real-time.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default SocialLeads;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
`;

const ScanButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
`;

const FilterBar = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const FilterLabel = styled.div`
  font-weight: 600;
  min-width: 80px;
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1rem;
  background: ${({ $active, theme }) => ($active ? theme.colors.primary.main : '#f5f5f5')};
  color: ${({ $active }) => ($active ? 'white' : '#666')};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LeadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 3rem;
  color: #666;
`;

const LeadCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const PlatformBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${({ $color }) => `${$color}20`};
  color: ${({ $color }) => $color};
  text-transform: capitalize;
`;

const LeadDate = styled.span`
  font-size: 0.875rem;
  color: #666;
`;

const AuthorInfo = styled.div`
  margin-bottom: 1rem;
`;

const AuthorName = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
`;

const AuthorHandle = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const PostContent = styled.p`
  color: #333;
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 3px solid ${({ theme }) => theme.colors.primary.main};
`;

const Keywords = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const KeywordLabel = styled.span`
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
`;

const Keyword = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #fff3cd;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-weight: 600;
  color: #856404;
`;

const LeadActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f5f5f5;
  color: #666;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const StatusSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ContactButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #25d366;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ccc;
  margin-bottom: 1rem;
`;

const EmptyText = styled.h3`
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const EmptySubtext = styled.p`
  color: #999;
`;

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 2px solid #1565c0;
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoTitle = styled.h3`
  color: #1565c0;
  margin-bottom: 1rem;
`;

const InfoText = styled.div`
  color: #0d47a1;
  line-height: 1.6;
  
  ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  li {
    margin: 0.25rem 0;
  }
`;
