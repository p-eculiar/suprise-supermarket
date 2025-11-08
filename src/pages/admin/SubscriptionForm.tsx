import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FiX, FiPlus, FiTrash2, FiSave } from 'react-icons/fi';

const SubscriptionForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    type: 'household' as 'household' | 'corporate',
    price: '',
    duration: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    description: '',
    active: true,
  });

  const [items, setItems] = useState<Array<{ name: string; quantity: string; unit: string }>>([
    { name: '', quantity: '', unit: 'kg' },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      fetchPlan(id);
    }
  }, [id, isEdit]);

  const fetchPlan = async (planId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        type: data.type,
        price: data.price.toString(),
        duration: data.duration,
        description: data.description || '',
        active: data.active,
      });

      if (data.items && data.items.length > 0) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
      alert('Failed to load plan data');
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', quantity: '', unit: 'kg' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const planData = {
        name: formData.name,
        type: formData.type,
        price: parseFloat(formData.price),
        duration: formData.duration,
        description: formData.description,
        items: items.filter((item) => item.name && item.quantity),
        active: formData.active,
      };

      if (isEdit && id) {
        const { error } = await supabase
          .from('subscription_plans')
          .update(planData)
          .eq('id', id);

        if (error) throw error;
        alert('Plan updated successfully!');
      } else {
        const { error } = await supabase.from('subscription_plans').insert([planData]);

        if (error) throw error;
        alert('Plan created successfully!');
      }

      navigate('/admin/subscriptions');
    } catch (error: any) {
      console.error('Error saving plan:', error);
      alert(`Failed to save plan: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{isEdit ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</Title>
        <CloseButton onClick={() => navigate('/admin/subscriptions')}>
          <FiX />
        </CloseButton>
      </Header>

      <Form onSubmit={handleSubmit}>
        <Section>
          <SectionTitle>Plan Details</SectionTitle>

          <FormRow>
            <FormGroup>
              <Label>Plan Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bronze Family Plan"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Plan Type *</Label>
              <Select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'household' | 'corporate' })
                }
                required
              >
                <option value="household">🏠 Household</option>
                <option value="corporate">🏢 Corporate</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <Label>Price (₦) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="30000"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Duration *</Label>
              <Select
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: e.target.value as 'monthly' | 'quarterly' | 'yearly',
                  })
                }
                required
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <Label>Description *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this plan..."
              rows={4}
              required
            />
          </FormGroup>

          <FormGroup>
            <CheckboxLabel>
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <span>Active (visible to customers)</span>
            </CheckboxLabel>
          </FormGroup>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>Included Items</SectionTitle>
            <AddItemButton type="button" onClick={addItem}>
              <FiPlus />
              Add Item
            </AddItemButton>
          </SectionHeader>

          <ItemsList>
            {items.map((item, index) => (
              <ItemRow key={index}>
                <ItemInput
                  type="text"
                  placeholder="Item name (e.g., Rice)"
                  value={item.name}
                  onChange={(e) => updateItem(index, 'name', e.target.value)}
                />
                <ItemInput
                  type="text"
                  placeholder="Quantity (e.g., 50)"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  style={{ maxWidth: '120px' }}
                />
                <ItemSelect
                  value={item.unit}
                  onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  style={{ maxWidth: '100px' }}
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="liters">liters</option>
                  <option value="pcs">pcs</option>
                  <option value="bags">bags</option>
                  <option value="cartons">cartons</option>
                </ItemSelect>
                {items.length > 1 && (
                  <RemoveItemButton type="button" onClick={() => removeItem(index)}>
                    <FiTrash2 />
                  </RemoveItemButton>
                )}
              </ItemRow>
            ))}
          </ItemsList>
        </Section>

        <Actions>
          <CancelButton type="button" onClick={() => navigate('/admin/subscriptions')}>
            Cancel
          </CancelButton>
          <SaveButton type="submit" disabled={isLoading}>
            <FiSave />
            {isLoading ? 'Saving...' : isEdit ? 'Update Plan' : 'Create Plan'}
          </SaveButton>
        </Actions>
      </Form>
    </Container>
  );
};

export default SubscriptionForm;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
`;

const AddItemButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ItemInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const ItemSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const RemoveItemButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #ffe0e0;
  color: #ff4444;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff4444;
    color: white;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const SaveButton = styled.button`
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
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
