import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../lib/supabase';
import toast from '../../components/common/Toast';
import { FiCreditCard, FiDownload, FiCheckCircle, FiXCircle, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';

interface PaymentTransaction {
  id: string;
  order_id: string;
  amount: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference: string;
  created_at: string;
}

const Payment: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useSettings();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Fetch payment transactions for the user's orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);
      
      if (ordersError) throw ordersError;
      
      // If user has no orders, return empty array
      if (!ordersData || ordersData.length === 0) {
        setTransactions([]);
        return;
      }
      
      // Get order IDs
      const orderIds = ordersData.map(order => order.id);
      
      // Fetch payment transactions for these orders
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .in('order_id', orderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      // Only show error toast if it's not a table doesn't exist error
      if (!error.message.includes('does not exist')) {
        toast.error('Failed to load payment history');
      }
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#27AE60';
      case 'pending':
        return '#F39C12';
      case 'failed':
        return '#E74C3C';
      case 'refunded':
        return '#3498DB';
      default:
        return '#95A5A6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle />;
      case 'pending':
        return <FiClock />;
      case 'failed':
        return <FiXCircle />;
      case 'refunded':
        return <FiDollarSign />;
      default:
        return <FiCreditCard />;
    }
  };

  const handleDownloadReceipt = (transaction: PaymentTransaction) => {
    // Generate receipt data
    const formattedAmount = formatCurrency(transaction.amount);
    const receiptData = `
SURPRISE SUPERMARKET
Payment Receipt
=====================================

Transaction ID: ${transaction.reference}
Order ID: ${transaction.order_id}
Date: ${new Date(transaction.created_at).toLocaleString()}
Amount: ${formattedAmount}
Payment Method: ${transaction.payment_method}
Status: ${transaction.status.toUpperCase()}

=====================================
Thank you for shopping with us!
    `;

    // Create download
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${transaction.reference}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Receipt downloaded!');
  };

  const filteredTransactions = filterStatus === 'all'
    ? transactions
    : transactions.filter(t => t.status === filterStatus);

  const totalSpent = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const successfulTransactions = transactions.filter(t => t.status === 'completed').length;

  if (loading) {
    return (
      <Container>
        <LoadingState>
          <Spinner />
          <p>Loading payment history...</p>
        </LoadingState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Payment History</Title>
          <Subtitle>Track all your payment transactions</Subtitle>
        </div>
      </Header>

      {/* Stats Cards */}
      <StatsGrid>
        <StatCard>
          <StatIcon $color="#27AE60">
            <FiDollarSign />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Spent</StatLabel>
            <StatValue>{formatCurrency(totalSpent)}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#3498DB">
            <FiCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatLabel>Successful Transactions</StatLabel>
            <StatValue>{successfulTransactions}</StatValue>
          </StatInfo>
        </StatCard>

        <StatCard>
          <StatIcon $color="#F39C12">
            <FiCreditCard />
          </StatIcon>
          <StatInfo>
            <StatLabel>Total Transactions</StatLabel>
            <StatValue>{transactions.length}</StatValue>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Filter Bar */}
      <FilterBar>
        <FilterButton $active={filterStatus === 'all'} onClick={() => setFilterStatus('all')}>
          All
        </FilterButton>
        <FilterButton $active={filterStatus === 'completed'} onClick={() => setFilterStatus('completed')}>
          Completed
        </FilterButton>
        <FilterButton $active={filterStatus === 'pending'} onClick={() => setFilterStatus('pending')}>
          Pending
        </FilterButton>
        <FilterButton $active={filterStatus === 'failed'} onClick={() => setFilterStatus('failed')}>
          Failed
        </FilterButton>
        <FilterButton $active={filterStatus === 'refunded'} onClick={() => setFilterStatus('refunded')}>
          Refunded
        </FilterButton>
      </FilterBar>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <EmptyState>
          <FiCreditCard />
          <h3>No transactions found</h3>
          <p>Your payment history will appear here once you make a purchase</p>
        </EmptyState>
      ) : (
        <TransactionsList>
          {filteredTransactions.map((transaction) => (
            <TransactionCard key={transaction.id}>
              <TransactionHeader>
                <TransactionInfo>
                  <TransactionIcon $color={getStatusColor(transaction.status)}>
                    {getStatusIcon(transaction.status)}
                  </TransactionIcon>
                  <div>
                    <TransactionRef>Ref: {transaction.reference}</TransactionRef>
                    <TransactionOrder>Order: {transaction.order_id.slice(0, 8)}</TransactionOrder>
                  </div>
                </TransactionInfo>
                <StatusBadge $color={getStatusColor(transaction.status)}>
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </StatusBadge>
              </TransactionHeader>

              <TransactionBody>
                <TransactionDetail>
                  <DetailIcon><FiDollarSign /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Amount</DetailLabel>
                    <DetailValue>{formatCurrency(transaction.amount)}</DetailValue>
                  </DetailInfo>
                </TransactionDetail>

                <TransactionDetail>
                  <DetailIcon><FiCreditCard /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Payment Method</DetailLabel>
                    <DetailValue>{transaction.payment_method}</DetailValue>
                  </DetailInfo>
                </TransactionDetail>

                <TransactionDetail>
                  <DetailIcon><FiCalendar /></DetailIcon>
                  <DetailInfo>
                    <DetailLabel>Date</DetailLabel>
                    <DetailValue>
                      {new Date(transaction.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </DetailValue>
                  </DetailInfo>
                </TransactionDetail>
              </TransactionBody>

              <TransactionFooter>
                <DownloadButton onClick={() => handleDownloadReceipt(transaction)}>
                  <FiDownload /> Download Receipt
                </DownloadButton>
                <ViewDetailsButton onClick={() => setSelectedTransaction(transaction)}>
                  View Details
                </ViewDetailsButton>
              </TransactionFooter>
            </TransactionCard>
          ))}
        </TransactionsList>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal onClick={() => setSelectedTransaction(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <div>
                <h2>Transaction Details</h2>
                <StatusBadge $color={getStatusColor(selectedTransaction.status)}>
                  {getStatusIcon(selectedTransaction.status)}
                  {selectedTransaction.status}
                </StatusBadge>
              </div>
              <ModalCloseButton onClick={() => setSelectedTransaction(null)}>×</ModalCloseButton>
            </ModalHeader>

            <ModalBody>
              <DetailSection>
                <DetailRow>
                  <DetailLabel>Transaction Reference</DetailLabel>
                  <DetailValue>{selectedTransaction.reference}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Order ID</DetailLabel>
                  <DetailValue>{selectedTransaction.order_id}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Amount Paid</DetailLabel>
                  <DetailValue style={{ color: '#27AE60', fontWeight: 700 }}>
                    {formatCurrency(selectedTransaction.amount)}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Payment Method</DetailLabel>
                  <DetailValue>{selectedTransaction.payment_method}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Transaction Date</DetailLabel>
                  <DetailValue>{new Date(selectedTransaction.created_at).toLocaleString()}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Status</DetailLabel>
                  <DetailValue>
                    <StatusBadge $color={getStatusColor(selectedTransaction.status)}>
                      {getStatusIcon(selectedTransaction.status)}
                      {selectedTransaction.status}
                    </StatusBadge>
                  </DetailValue>
                </DetailRow>
              </DetailSection>

              <ModalActions>
                <DownloadButton onClick={() => handleDownloadReceipt(selectedTransaction)}>
                  <FiDownload /> Download Receipt
                </DownloadButton>
              </ModalActions>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Payment;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #636E72;
  font-size: 1rem;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 60px;
  height: 60px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2D3436;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 0.625rem 1.25rem;
  background: ${({ $active }) => ($active ? '#6C9A7F' : 'white')};
  color: ${({ $active }) => ($active ? 'white' : '#636E72')};
  border: 2px solid ${({ $active }) => ($active ? '#6C9A7F' : '#DFE6E9')};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${({ $active }) => ($active ? '#5A8470' : '#F8F9FA')};
  }
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const TransactionCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #F8F9FA;
`;

const TransactionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TransactionIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const TransactionRef = styled.div`
  font-weight: 600;
  color: #2D3436;
  font-size: 1rem;
`;

const TransactionOrder = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-top: 0.25rem;
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ $color }) => $color}20;
  color: ${({ $color }) => $color};
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: capitalize;
`;

const TransactionBody = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: #F8F9FA;
`;

const TransactionDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const DetailIcon = styled.div`
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
`;

const DetailInfo = styled.div``;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: #636E72;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 600;
  color: #2D3436;
`;

const TransactionFooter = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  justify-content: flex-end;
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #6C9A7F;
  border: 2px solid #6C9A7F;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #6C9A7F;
    color: white;
  }
`;

const ViewDetailsButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #5A8470;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;

  svg {
    font-size: 4rem;
    color: #DFE6E9;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    color: #2D3436;
    margin-bottom: 0.5rem;
  }

  p {
    color: #636E72;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;

  p {
    margin-top: 1rem;
    color: #636E72;
  }
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6C9A7F;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #DFE6E9;

  > div {
    h2 {
      font-size: 1.5rem;
      color: #2D3436;
      margin: 0 0 0.5rem 0;
    }
  }
`;

const ModalCloseButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  background: #F8F9FA;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636E72;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: #DFE6E9;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DetailSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #F8F9FA;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
  border-top: 1px solid #DFE6E9;
`;
