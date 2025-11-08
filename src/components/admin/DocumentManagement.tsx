import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { documentService } from '../../services/documentService';
import { FiDownload, FiFile, FiFileText } from 'react-icons/fi';
import toast from '../../components/common/Toast';

const DocumentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts'>('invoices');

  const { data: invoices, refetch: refetchInvoices } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      return await documentService.getAllInvoices();
    }
  });

  const { data: receipts, refetch: refetchReceipts } = useQuery({
    queryKey: ['admin-receipts'],
    queryFn: async () => {
      return await documentService.getAllReceipts();
    }
  });

  const handleDownloadDocument = (type: 'invoice' | 'receipt', data: any) => {
    // In a real application, this would generate a PDF document
    // For now, we'll create a simple text file with the document details
    const content = `${type.toUpperCase()} Details:\n\n${JSON.stringify(data, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${data.order_id || data.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container>
      <Header>
        <Title>Document Management</Title>
      </Header>

      <Tabs>
        <TabButton 
          $active={activeTab === 'invoices'} 
          onClick={() => setActiveTab('invoices')}
        >
          <FiFile /> Invoices
        </TabButton>
        <TabButton 
          $active={activeTab === 'receipts'} 
          onClick={() => setActiveTab('receipts')}
        >
          <FiFileText /> Receipts
        </TabButton>
      </Tabs>

      {activeTab === 'invoices' && (
        <TableContainer className="table-container">
          <Table>
            <thead>
              <tr>
                <TableHeader>Invoice #</TableHeader>
                <TableHeader>Order #</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {invoices && invoices.map((invoice: any) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.orders?.order_number || 'N/A'}</TableCell>
                  <TableCell>{invoice.customer_name}</TableCell>
                  <TableCell>₦{invoice.total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge $status={invoice.status}>
                      {invoice.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {new Date(invoice.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <ActionButton 
                      onClick={() => handleDownloadDocument('invoice', invoice)}
                      title="Download Invoice"
                    >
                      <FiDownload />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          {invoices && invoices.length === 0 && (
            <EmptyState>
              <p>No invoices found</p>
            </EmptyState>
          )}
        </TableContainer>
      )}

      {activeTab === 'receipts' && (
        <TableContainer className="table-container">
          <Table>
            <thead>
              <tr>
                <TableHeader>Receipt #</TableHeader>
                <TableHeader>Order #</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {receipts && receipts.map((receipt: any) => (
                <TableRow key={receipt.id}>
                  <TableCell>{receipt.receipt_number}</TableCell>
                  <TableCell>{receipt.orders?.order_number || 'N/A'}</TableCell>
                  <TableCell>{receipt.customer_name}</TableCell>
                  <TableCell>₦{receipt.total?.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge $status={receipt.payment_status}>
                      {receipt.payment_status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    {new Date(receipt.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <ActionButton 
                      onClick={() => handleDownloadDocument('receipt', receipt)}
                      title="Download Receipt"
                    >
                      <FiDownload />
                    </ActionButton>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
          {receipts && receipts.length === 0 && (
            <EmptyState>
              <p>No receipts found</p>
            </EmptyState>
          )}
        </TableContainer>
      )}
    </Container>
  );
};

export default DocumentManagement;

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
  
  h2 {
    @media (max-width: 480px) {
      font-size: 1.25rem;
    }
  }
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #F0F0F0;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$active ? '#6C9A7F' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#636E72'};
  border: none;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$active ? '#6C9A7F' : '#F8F9FA'};
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  
  /* Force scrollbar to always show for testing */
  overflow-x: scroll;
  
  /* Custom scrollbar styling for WebKit browsers */
  &::-webkit-scrollbar {
    height: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
  
  @media (max-width: 480px) {
    &::-webkit-scrollbar {
      height: 6px;
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  
  @media (max-width: 768px) {
    min-width: 600px;
  }
  
  @media (max-width: 480px) {
    min-width: 400px;
  }
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  border-bottom: 1px solid #F0F0F0;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  color: #2D3436;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    font-size: 0.85rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.8rem;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'paid': return '#4CAF5015';
      case 'pending': return '#FF980015';
      case 'overdue': return '#F4433615';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'overdue': return '#F44336';
      default: return '#636E72';
    }
  }};
  
  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #6C9A7F15;
  color: #6C9A7F;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
    font-size: 0.9rem;
  }
`;