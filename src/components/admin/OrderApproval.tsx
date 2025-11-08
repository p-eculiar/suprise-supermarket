import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCheck, FiX, FiAlertCircle, FiClock } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import toast from '../common/Toast';

interface OrderApprovalProps {
  order: any;
  onApprovalChange: () => void;
}

const OrderApproval: React.FC<OrderApprovalProps> = ({ order, onApprovalChange }) => {
  const [approvalStatus, setApprovalStatus] = useState(order.approval_status || 'pending');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (isProcessing) return;
    
    if (!window.confirm('Are you sure you want to approve this order?')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('orders')
        .update({
          approval_status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_notes: approvalNotes || null,
          status: 'processing', // Move to processing status after approval
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Order approved successfully');
      setApprovalStatus('approved');
      onApprovalChange();
    } catch (error: any) {
      console.error('Error approving order:', error);
      toast.error(`Failed to approve order: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (isProcessing) return;
    
    if (!approvalNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }
    
    if (!window.confirm('Are you sure you want to reject this order? This action cannot be undone.')) {
      return;
    }
    
    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { error } = await supabase
        .from('orders')
        .update({
          approval_status: 'rejected',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          approval_notes: approvalNotes,
          status: 'cancelled', // Cancel order if rejected
        })
        .eq('id', order.id);

      if (error) throw error;

      toast.success('Order rejected successfully');
      setApprovalStatus('rejected');
      onApprovalChange();
    } catch (error: any) {
      console.error('Error rejecting order:', error);
      toast.error(`Failed to reject order: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (approvalStatus === 'approved') {
    return (
      <ApprovedContainer>
        <FiCheck />
        <span>Order Approved</span>
      </ApprovedContainer>
    );
  }

  if (approvalStatus === 'rejected') {
    return (
      <RejectedContainer>
        <FiX />
        <span>Order Rejected</span>
      </RejectedContainer>
    );
  }

  return (
    <ApprovalContainer>
      <StatusHeader>
        <FiAlertCircle />
        <span>Pending Approval</span>
      </StatusHeader>
      
      <NotesSection>
        <label>Approval Notes (Required for Rejection)</label>
        <textarea
          value={approvalNotes}
          onChange={(e) => setApprovalNotes(e.target.value)}
          placeholder="Enter notes about approval decision..."
        />
      </NotesSection>
      
      <ButtonGroup>
        <ApproveButton onClick={handleApprove} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : <><FiCheck /> Approve</>}
        </ApproveButton>
        <RejectButton onClick={handleReject} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : <><FiX /> Reject</>}
        </RejectButton>
      </ButtonGroup>
    </ApprovalContainer>
  );
};

export default OrderApproval;

// Styled Components
const ApprovalContainer = styled.div`
  background: #FFF8E1;
  border: 1px solid #FFECB3;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ApprovedContainer = styled.div`
  background: #E8F5E9;
  border: 1px solid #C8E6C9;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4CAF50;
  font-weight: 600;
`;

const RejectedContainer = styled.div`
  background: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #F44336;
  font-weight: 600;
`;

const StatusHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #FF9800;
`;

const NotesSection = styled.div`
  margin-bottom: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  textarea {
    width: 100%;
    min-height: 80px;
    padding: 0.75rem;
    border: 1px solid #E0E0E0;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.875rem;
    
    &:focus {
      outline: none;
      border-color: #6C9A7F;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const ApproveButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #43A047;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const RejectButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background: #F44336;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #E53935;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;