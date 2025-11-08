import React, { useState } from 'react';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';
import toast from '../common/Toast';

interface DeliveryAssignmentProps {
  orderId: string;
  onAssignmentComplete: () => void;
}

const DeliveryAssignment: React.FC<DeliveryAssignmentProps> = ({ 
  orderId, 
  onAssignmentComplete 
}) => {
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driverName.trim() || !driverPhone.trim()) {
      toast.error('Please enter both driver name and phone number');
      return;
    }

    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    if (!window.confirm('Are you sure you want to assign this driver and schedule the delivery?')) {
      return;
    }

    setIsAssigning(true);
    try {
      // Update delivery tracking with driver information and delivery date
      const { error } = await supabase
        .from('delivery_tracking')
        .update({
          driver_name: driverName,
          driver_phone: driverPhone,
          delivery_date: deliveryDate,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId);

      if (error) throw error;

      // Update order status to processing
      await supabase
        .from('orders')
        .update({
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      toast.success('Driver assigned and delivery scheduled successfully');
      onAssignmentComplete();
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      toast.error(`Failed to assign driver: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <AssignmentContainer>
      <Title>Assign Delivery Driver</Title>
      <Form onSubmit={handleAssignDriver}>
        <FormGroup>
          <Label htmlFor="driverName">Driver Name</Label>
          <Input
            id="driverName"
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Enter driver's full name"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="driverPhone">Driver Phone</Label>
          <Input
            id="driverPhone"
            type="tel"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="Enter driver's phone number"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="deliveryDate">Delivery Date & Time</Label>
          <Input
            id="deliveryDate"
            type="datetime-local"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            required
          />
        </FormGroup>

        <Button type="submit" disabled={isAssigning}>
          {isAssigning ? 'Assigning...' : 'Assign Driver & Schedule Delivery'}
        </Button>
      </Form>
    </AssignmentContainer>
  );
};

export default DeliveryAssignment;

// Styled Components
const AssignmentContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 1rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2D3436;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;

  &:disabled {
    background: #B2BEC3;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #5A8470;
    transform: translateY(-2px);
  }
`;