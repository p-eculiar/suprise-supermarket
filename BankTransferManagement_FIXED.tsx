import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import { documentService, ReceiptData } from '../../services/documentService';
import { FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';
import toast from '../../components/common/Toast';

interface BankTransferOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  bank_transfer_details: {
    bank_name: string;
    account_number: string;
    account_name: string;
  };
  created_at: string;
  payment_status: string;
}

const BankTransferManagement: React.FC = () => {
  const [orders, setOrders] = useState<BankTransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [transactionReference, setTransactionReference] = useState('');

  useEffect(() => {
    loadBankTransferOrders();
  }, []);

  const loadBankTransferOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading bank transfer orders...');
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          customer_email,
          total,
          bank_transfer_details,
          created_at,
          payment_status
        `)
        .eq('payment_method', 'bank_transfer')
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading bank transfer orders:', error);
        throw error;
      }
      
      console.log('Loaded bank transfer orders:', data);
      setOrders(data || []);
    } catch (error: any) {
      console.error('Error loading bank transfer orders:', error);
      toast.error('Failed to load bank transfer orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    if (!transactionReference.trim()) {
      toast.error('Please enter transaction reference');
      return;
    }

    try {
      console.log('Verifying payment for order:', orderId);
      
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Error fetching order:', orderError);
        throw orderError;
      }
      
      // Get the order amount directly from the order data
      const orderAmount = order.total || 0;
      console.log('Order amount:', orderAmount);

      // Update order payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          status: 'processing',
          paid_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }

      // Create payment transaction record
      const { error: transactionError } = await supabase
        .from('payment_transactions')
        .insert([{
          order_id: orderId,
          reference: transactionReference,
          amount: orderAmount,  // Use the order amount directly
          currency: 'NGN',
          provider: 'bank_transfer',
          provider_reference: transactionReference,
          status: 'success'
        }]);

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw transactionError;
      }

      // Generate receipt
      try {
        const receiptData: ReceiptData = {
          order_id: orderId,
          receipt_number: documentService.generateReceiptNumber(),
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          items: order.order_items ? order.order_items.map((item: any) => ({
            product_name: item.product_name || item.name || 'Unknown Product',
            quantity: item.quantity || 1,
            price: item.price || 0,
            subtotal: (item.price || 0) * (item.quantity || 1)
          })) : [],
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          delivery_fee: order.delivery_fee || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          payment_method: 'bank_transfer',
          payment_status: 'paid',
          payment_date: new Date().toISOString(),
          transaction_reference: transactionReference
        };
        
        await documentService.createReceipt(receiptData);
      } catch (receiptError) {
        console.error('Error creating receipt:', receiptError);
        // Don't throw here - we still want to consider the payment verified
        toast.warning('Payment verified but receipt generation failed');
      }

      toast.success('Payment verified successfully');
      setSelectedOrder(null);
      setTransactionReference('');
      loadBankTransferOrders();
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment: ' + (error.message || error.toString()));
      // Reset the form but keep it open so user can try again
    }
  };

  const handleRejectPayment = async (orderId: string) => {
    try {
      console.log('Rejecting payment for order:', orderId);
      
      // Update order payment status
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled'
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error rejecting payment:', error);
        throw error;
      }

      toast.success('Payment rejected successfully');
      loadBankTransferOrders();
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment: ' + (error.message || error.toString()));
    }
  };

  if (loading) {
    return (
      <Container>
        <Loading>Loading bank transfer orders...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Bank Transfer Payments</Title>
        <RefreshButton onClick={loadBankTransferOrders}>
          <FiClock /> Refresh
        </RefreshButton>
      </Header>

      {orders.length === 0 ? (
        <EmptyState>
          <FiAlertCircle />
          <p>No pending bank transfer payments</p>
        </EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <TableHeader>Order ID</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Bank Details</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TableCell>#{order.order_number}</TableCell>
                    <TableCell>
                      <CustomerInfo>
                        <div>{order.customer_name}</div>
                        <CustomerEmail>{order.customer_email}</CustomerEmail>
                      </CustomerInfo>
                    </TableCell>
                    <TableCell>
                      <BankInfo>
                        <div><strong>{order.bank_transfer_details?.bank_name}</strong></div>
                        <div>Acc: {order.bank_transfer_details?.account_number}</div>
                        <div>Name: {order.bank_transfer_details?.account_name}</div>
                      </BankInfo>
                    </TableCell>
                    <TableCell>₦{order.total?.toFixed(2)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton 
                          onClick={() => setSelectedOrder(order.id)}
                          title="Verify Payment"
                        >
                          <FiCheck />
                        </ActionButton>
                        <ActionButton 
                          onClick={() => handleRejectPayment(order.id)}
                          title="Reject Payment"
                          $reject
                        >
                          <FiX />
                        </ActionButton>
                      </ActionButtons>
                    </TableCell>
                  </TableRow>
                  {selectedOrder === order.id && (
                    <tr>
                      <td colSpan={6}>
                        <VerificationPanel>
                          <h3>Verify Bank Transfer Payment</h3>
                          <FormGroup>
                            <Label>Transaction Reference *</Label>
                            <Input
                              type="text"
                              value={transactionReference}
                              onChange={(e) => setTransactionReference(e.target.value)}
                              placeholder="Enter bank transaction reference"
                            />
                          </FormGroup>
                          <ButtonGroup>
                            <CancelButton onClick={() => setSelectedOrder(null)}>
                              Cancel
                            </CancelButton>
                            <VerifyButton onClick={() => handleVerifyPayment(order.id)}>
                              Verify Payment
                            </VerifyButton>
                          </ButtonGroup>
                        </VerificationPanel>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default BankTransferManagement;

// Styled Components
const Container = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin: 0;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 2rem;
  color: #636E72;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  
  svg {
    font-size: 3rem;
    color: #636E72;
    margin-bottom: 1rem;
  }
  
  p {
    color: #636E72;
    margin: 0;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  border-bottom: 1px solid #F0F0F0;
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
`;

const CustomerInfo = styled.div``;

const CustomerEmail = styled.div`
  font-size: 0.8rem;
  color: #636E72;
  margin-top: 0.25rem;
`;

const BankInfo = styled.div`
  font-size: 0.875rem;
  
  div {
    margin-bottom: 0.25rem;
  }
  
  div:last-child {
    margin-bottom: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $reject?: boolean }>`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$reject ? '#F4433615' : '#6C9A7F15'};
  color: ${props => props.$reject ? '#F44336' : '#6C9A7F'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$reject ? '#F44336' : '#6C9A7F'};
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const VerificationPanel = styled.div`
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
  
  h3 {
    margin-top: 0;
    color: #2D3436;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2D3436;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: white;
  color: #636E72;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #F8F9FA;
  }
`;

const VerifyButton = styled.button`
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