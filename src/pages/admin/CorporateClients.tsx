import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import {
  FiBriefcase,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiPackage,
  FiSearch,
  FiEye,
  FiRefreshCw
} from 'react-icons/fi';

interface CorporateClient {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  business_type: string;
  address: string;
  credit_limit: number;
  payment_terms: string;
  status: 'pending' | 'approved' | 'rejected';
  total_orders: number;
  total_spent: number;
  created_at: string;
}

const CorporateClients: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Fetch corporate clients
  const { data: clients, isLoading, refetch } = useQuery({
    queryKey: ['corporate-clients', searchTerm, filterStatus],
    queryFn: async () => {
      let query = supabase.from('corporate_clients').select('*');

      if (searchTerm) {
        query = query.or(`company_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as CorporateClient[];
    },
  });

  // Realtime: refresh clients on changes
  useRealtime({
    table: 'corporate_clients',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
    },
    channelName: 'corporate-clients-realtime',
  });

  // Statistics
  const stats = {
    totalClients: clients?.filter((c) => c.status === 'approved').length || 0,
    pendingApprovals: clients?.filter((c) => c.status === 'pending').length || 0,
    totalRevenue:
      clients?.reduce((sum, c) => sum + (c.total_spent || 0), 0) || 0,
  };

  // Approve client mutation
  const approveClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('corporate_clients')
        .update({ status: 'approved' })
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
      alert('Client approved successfully!');
    },
  });

  // Reject client mutation
  const rejectClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('corporate_clients')
        .update({ status: 'rejected' })
        .eq('id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-clients'] });
      alert('Client rejected');
    },
  });

  const handleApprove = (clientId: string) => {
    if (window.confirm('Approve this corporate client?')) {
      approveClientMutation.mutate(clientId);
    }
  };

  const handleReject = (clientId: string) => {
    if (window.confirm('Reject this corporate client application?')) {
      rejectClientMutation.mutate(clientId);
    }
  };

  // Add refresh function
  const handleRefresh = () => {
    refetch();
  };

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Corporate Clients</Title>
          <Subtitle>Manage B2B customers and wholesale accounts</Subtitle>
        </HeaderContent>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
        </HeaderActions>
      </Header>

      {/* Statistics */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#6C9A7F">
            <FiBriefcase />
          </StatIcon>
          <StatInfo>
            <StatLabel>Active Corporate Clients</StatLabel>
            <StatValue>{stats.totalClients}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#FF9800">
            <FiPackage />
          </StatIcon>
          <StatInfo>
            <StatLabel>Pending Approvals</StatLabel>
            <StatValue>{stats.pendingApprovals}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#4ECDC4">
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total B2B Revenue</StatLabel>
            <StatValue>₦{stats.totalRevenue.toLocaleString()}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by company name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterTabs>
          <FilterTab $active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
            All
          </FilterTab>
          <FilterTab $active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')}>
            Pending
          </FilterTab>
          <FilterTab $active={filterStatus === 'approved'} onClick={() => setFilterStatus('approved')}>
            Approved
          </FilterTab>
          <FilterTab $active={filterStatus === 'rejected'} onClick={() => setFilterStatus('rejected')}>
            Rejected
          </FilterTab>
        </FilterTabs>
      </FilterBar>

      {/* Clients Table */}
      <TableContainer>
        <Table>
          <thead>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Business Type</TableHead>
              <TableHead>Credit Limit</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </thead>
          <tbody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading clients...
                </TableCell>
              </TableRow>
            ) : clients && clients.length > 0 ? (
              clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <CompanyInfo>
                      <CompanyName>{client.company_name}</CompanyName>
                      <CompanyEmail>{client.email}</CompanyEmail>
                    </CompanyInfo>
                  </TableCell>
                  <TableCell>
                    <div>{client.contact_person}</div>
                    <SmallText>{client.phone}</SmallText>
                  </TableCell>
                  <TableCell>{client.business_type}</TableCell>
                  <TableCell>₦{client.credit_limit.toLocaleString()}</TableCell>
                  <TableCell>{client.payment_terms}</TableCell>
                  <TableCell>{client.total_orders || 0}</TableCell>
                  <TableCell>₦{(client.total_spent || 0).toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge $status={client.status}>
                      {client.status === 'approved' && '✓ '}
                      {client.status === 'rejected' && '✗ '}
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      {client.status === 'pending' && (
                        <>
                          <ApproveButton onClick={() => handleApprove(client.id)}>
                            <FiCheckCircle />
                          </ApproveButton>
                          <RejectButton onClick={() => handleReject(client.id)}>
                            <FiXCircle />
                          </RejectButton>
                        </>
                      )}
                      <ViewButton>
                        <FiEye />
                      </ViewButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                  No corporate clients found
                </TableCell>
              </TableRow>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CorporateClients;

// Styled Components
const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
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

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
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
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 250px;
  padding: 0.75rem;
  background: #f5f5f5;
  border-radius: 8px;

  svg {
    color: #666;
  }

  input {
    flex: 1;
    border: none;
    background: none;
    font-size: 1rem;
    outline: none;
  }
`;

const FilterTabs = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterTab = styled.button<{ $active: boolean }>`
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

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #eee;

  &:hover {
    background: #f9f9f9;
  }
`;

const TableHead = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #666;
  background: #f9f9f9;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
`;

const CompanyInfo = styled.div``;

const CompanyName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const CompanyEmail = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const SmallText = styled.div`
  font-size: 0.875rem;
  color: #666;
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: ${({ $status }) =>
    $status === 'approved' ? '#D4EDDA' : $status === 'pending' ? '#FFF3CD' : '#F8D7DA'};
  color: ${({ $status }) =>
    $status === 'approved' ? '#155724' : $status === 'pending' ? '#856404' : '#721C24'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ApproveButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #d4edda;
  color: #155724;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #155724;
    color: white;
  }
`;

const RejectButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f8d7da;
  color: #721c24;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #721c24;
    color: white;
  }
`;

const ViewButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f5f5f5;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #6c9a7f;
    color: white;
  }
`;
