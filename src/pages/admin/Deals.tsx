import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dealsService, DealWithProduct } from '../../services/dealsService';
import { productService } from '../../services/productService';
import { storageService } from '../../services/supabaseService';
import { FiPlus, FiTrash2, FiSave, FiEdit2, FiCheckCircle, FiRefreshCw, FiUpload, FiX } from 'react-icons/fi';
import { useRealtime } from '../../hooks/useRealtime';
import { TableLoader } from '../../components/common/GranularLoading';
import { useSettings } from '../../contexts/SettingsContext';

// Styled Components
const PageContainer = styled.div`
  padding: 1.5rem 2rem;
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 0.5rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DealCard = styled.div`
  background: #fff;
  border: 1px solid #E1E8ED;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const ThumbContainer = styled.div`
  position: relative;
  display: inline-block;
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
`;

const Thumb = styled.div`
  width: 60px;
  height: 60px;
  background: #F1F3F5;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  border: 1px solid #E1E8ED;
  
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
`;

const ImageUploadButton = styled.div`
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: #6C9A7F;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
  
  svg {
    color: white;
    width: 14px;
    height: 14px;
  }
  
  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const UploadingIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(108, 154, 127, 0.8);
  color: white;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  
  @media (max-width: 480px) {
    font-size: 0.6rem;
  }
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  
  @media (max-width: 480px) {
    flex: 1;
  }
`;

const Name = styled.div`
  font-weight: 600;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Meta = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const Price = styled.div`
  font-weight: 600;
  color: #6C9A7F;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #d0d7de;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  white-space: nowrap;
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: #6C9A7F;
  color: #fff;
  border-color: #6C9A7F;
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
`;

const SmallButton = styled(Button)`
  padding: 0.35rem 0.6rem;
  
  @media (max-width: 480px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
  }
`;

const DangerButton = styled(SmallButton)`
  border-color: #e03131;
  color: #e03131;
`;

const CreateBar = styled.div`
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #E1E8ED;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Empty = styled.div`
  color: #6c757d;
  text-align: center;
  padding: 2rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
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
  
  &:hover {
    border-color: #6C9A7F;
    color: #6C9A7F;
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

const CustomInput = styled.input`
  padding: 0.5rem;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    padding: 0.4rem;
    font-size: 0.85rem;
  }
`;

const CancelButton = styled(SmallButton)`
  border-color: #6c757d;
  color: #6c757d;
`;

const Deals: React.FC = () => {
  const queryClient = useQueryClient();
  const { formatCurrency } = useSettings();
  const { data: deals, isLoading, refetch } = useQuery({
    queryKey: ['deals_of_week'],
    queryFn: () => dealsService.list(),
  });

  const { data: products, refetch: refetchProducts } = useQuery({
    queryKey: ['products', 'select'],
    queryFn: () => productService.getAllProducts(),
  });

  const [localList, setLocalList] = useState<DealWithProduct[]>([]);
  const [newDeal, setNewDeal] = useState<{ 
    product_id: string; 
    active: boolean; 
    starts_at: string; 
    ends_at: string;
    custom_name?: string;
    custom_description?: string;
    custom_price?: number;
    custom_image?: string;
    custom_discount?: number;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<{[key: string]: boolean}>({});

  // Realtime: reflect changes to deals_of_week immediately
  useRealtime<any>({
    table: 'deals_of_week',
    events: ['INSERT','UPDATE','DELETE'],
    onEvent: () => queryClient.invalidateQueries({ queryKey: ['deals_of_week'] }),
    channelName: 'admin-deals',
  });

  useEffect(() => {
    if (deals) setLocalList(deals);
  }, [deals]);

  const createMutation = useMutation({
    mutationFn: dealsService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals_of_week'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DealWithProduct> }) => dealsService.update(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals_of_week'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: dealsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals_of_week'] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; priority: number }[]) => dealsService.reorder(items),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals_of_week'] }),
  });

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    const sourceId = e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    const newOrder = [...localList];
    const sourceIndex = newOrder.findIndex(i => i.id === sourceId);
    const targetIndex = newOrder.findIndex(i => i.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const [moved] = newOrder.splice(sourceIndex, 1);
    newOrder.splice(targetIndex, 0, moved);
    // Recompute priorities starting from 1
    const updated = newOrder.map((item, idx) => ({ ...item, priority: idx + 1 }));
    setLocalList(updated);
  };

  const saveOrder = () => {
    const payload = localList.map(item => ({ id: item.id, priority: item.priority || 1 }));
    reorderMutation.mutate(payload);
  };

  const onCreate = () => {
    // Check if there are products available
    if (!products || products.length === 0) {
      alert('No products available. Please add products first.');
      return;
    }
    
    setNewDeal({ 
      product_id: products[0]?.id || '', 
      active: true, 
      starts_at: '', 
      ends_at: '',
      custom_name: '',
      custom_description: '',
      custom_price: 0,
      custom_image: '',
      custom_discount: 0
    });
  };

  const onConfirmCreate = async () => {
    if (!newDeal?.product_id) {
      alert('Please select a product');
      return;
    }
    
    try {
      await createMutation.mutateAsync({
        product_id: newDeal.product_id,
        active: newDeal.active,
        starts_at: newDeal.starts_at || null,
        ends_at: newDeal.ends_at || null,
        priority: (localList?.length || 0) + 1,
        custom_name: newDeal.custom_name || null,
        custom_description: newDeal.custom_description || null,
        custom_price: newDeal.custom_price || null,
        custom_image_url: newDeal.custom_image || null,
        custom_discount: newDeal.custom_discount || null,
      });
      setNewDeal(null);
    } catch (error) {
      console.error('Error creating deal:', error);
      alert('Failed to create deal. Please try again.');
    }
  };

  const onUpdate = async (id: string, updates: Partial<DealWithProduct>) => {
    try {
      await updateMutation.mutateAsync({ id, updates });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating deal:', error);
      alert('Failed to update deal. Please try again.');
    }
  };

  const onDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deal?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting deal:', error);
        alert('Failed to delete deal. Please try again.');
      }
    }
  };

  const productOptions = useMemo(() => {
    if (!products || products.length === 0) return [];
    return products.map(p => ({ value: p.id, label: p.name }));
  }, [products]);

  // Add refresh function
  const handleRefresh = () => {
    refetch();
    refetchProducts();
  };

  // Handle image upload for deals
  const handleImageUpload = async (file: File, dealId: string) => {
    try {
      setUploadingImage(prev => ({ ...prev, [dealId]: true }));
      const imageUrl = await storageService.uploadProductImage(file, dealId);
      
      // Update the deal with the new image URL
      await updateMutation.mutateAsync({ 
        id: dealId, 
        updates: { custom_image_url: imageUrl } as any 
      });
      
      setUploadingImage(prev => ({ ...prev, [dealId]: false }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingImage(prev => ({ ...prev, [dealId]: false }));
    }
  };

  // Handle image upload for new deal
  const handleNewDealImageUpload = async (file: File) => {
    if (!newDeal) return;
    
    try {
      setUploadingImage(prev => ({ ...prev, 'new': true }));
      // For new deals, we'll store the image URL in state until the deal is created
      const imageUrl = URL.createObjectURL(file);
      setNewDeal({ ...newDeal, custom_image: imageUrl });
      setUploadingImage(prev => ({ ...prev, 'new': false }));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setUploadingImage(prev => ({ ...prev, 'new': false }));
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Deals of the Week</Title>
        <Actions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          <PrimaryButton onClick={onCreate}>
            <FiPlus /> Create Deal
          </PrimaryButton>
        </Actions>
      </Header>

      {isLoading ? (
        <TableLoader rows={5} columns={4} />
      ) : !products || products.length === 0 ? (
        <Empty>
          No products available. Please add products first before creating deals.
          <br />
          <Button onClick={() => refetchProducts()} style={{ marginTop: '1rem' }}>
            <FiRefreshCw /> Refresh Products
          </Button>
        </Empty>
      ) : (
        <List>
          {localList.map((deal) => (
            <DealCard key={deal.id} draggable onDragStart={(e) => onDragStart(e, deal.id)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, deal.id)}>
              <Left>
                <ThumbContainer>
                  <Thumb style={{ backgroundImage: `url(${deal.custom_image_url || deal.product_image_url || ''})` }} />
                  <ImageUploadButton>
                    <label htmlFor={`upload-${deal.id}`}>
                      <FiUpload />
                    </label>
                    <input
                      id={`upload-${deal.id}`}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleImageUpload(e.target.files[0], deal.id);
                        }
                      }}
                    />
                  </ImageUploadButton>
                  {uploadingImage[deal.id] && <UploadingIndicator>Uploading...</UploadingIndicator>}
                </ThumbContainer>
                <Info>
                  <Name>{deal.custom_name || deal.product_name || 'Unknown Product'}</Name>
                  <Meta>Priority #{deal.priority ?? 1} • {deal.active ? 'Active' : 'Inactive'}</Meta>
                  <Price>
                    {deal.custom_price !== null && deal.custom_price !== undefined 
                      ? `${formatCurrency(deal.custom_price)}` 
                        : deal.product_price 
                        ? `${formatCurrency(deal.product_price)}` 
                        : 'N/A'}
                    {deal.custom_discount !== null && deal.custom_discount !== undefined && deal.custom_discount > 0
                      ? ` (${deal.custom_discount}% off)`
                      : deal.product_discount && deal.product_discount > 0
                        ? ` (${deal.product_discount}% off)`
                        : ''}
                  </Price>
                </Info>
              </Left>
              <Right>
                {editingId === deal.id ? (
                  <>
                    <select 
                      value={deal.product_id} 
                      onChange={(e) => setLocalList(prev => prev.map(d => d.id === deal.id ? { ...d, product_id: e.target.value } : d))}
                    >
                      {productOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <label>
                      <input 
                        type="checkbox" 
                        checked={!!deal.active} 
                        onChange={(e) => setLocalList(prev => prev.map(d => d.id === deal.id ? { ...d, active: e.target.checked } : d))} 
                      /> Active
                    </label>
                    <SmallButton onClick={() => onUpdate(deal.id, { product_id: deal.product_id, active: deal.active } as any)}>
                      <FiCheckCircle /> Save
                    </SmallButton>
                  </>
                ) : (
                  <>
                    <SmallButton onClick={() => setEditingId(deal.id)}>
                      <FiEdit2 /> Edit
                    </SmallButton>
                    <DangerButton onClick={() => onDelete(deal.id)}>
                      <FiTrash2 /> Delete
                    </DangerButton>
                  </>
                )}
              </Right>
            </DealCard>
          ))}
        </List>
      )}

      {newDeal && (
        <CreateBar>
          <ThumbContainer>
            <Thumb style={{ backgroundImage: `url(${newDeal.custom_image || ''})` }} />
            <ImageUploadButton>
              <label htmlFor="upload-new">
                <FiUpload />
              </label>
              <input
                id="upload-new"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleNewDealImageUpload(e.target.files[0]);
                  }
                }}
              />
            </ImageUploadButton>
            {uploadingImage['new'] && <UploadingIndicator>Uploading...</UploadingIndicator>}
          </ThumbContainer>
          
          <select 
            value={newDeal.product_id} 
            onChange={(e) => setNewDeal({ ...newDeal, product_id: e.target.value })}
          >
            <option value="">Select a product...</option>
            {productOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          
          <CustomInput 
            type="text" 
            placeholder="Custom Name (optional)" 
            value={newDeal.custom_name || ''} 
            onChange={(e) => setNewDeal({ ...newDeal, custom_name: e.target.value })} 
          />
          
          <CustomInput 
            type="number" 
            placeholder="Custom Price (optional)" 
            value={newDeal.custom_price || ''} 
            onChange={(e) => setNewDeal({ ...newDeal, custom_price: parseFloat(e.target.value) || 0 })} 
          />
          
          <CustomInput 
            type="number" 
            placeholder="Discount % (optional)" 
            value={newDeal.custom_discount || ''} 
            onChange={(e) => setNewDeal({ ...newDeal, custom_discount: parseFloat(e.target.value) || 0 })} 
          />
          
          <label>
            <input 
              type="checkbox" 
              checked={newDeal.active} 
              onChange={(e) => setNewDeal({ ...newDeal, active: e.target.checked })} 
            /> Active
          </label>
          
          <SmallButton onClick={onConfirmCreate}>
            <FiCheckCircle /> Create
          </SmallButton>
          <CancelButton onClick={() => setNewDeal(null)}>
            <FiX /> Cancel
          </CancelButton>
        </CreateBar>
      )}
    </PageContainer>
  );
};

export default Deals;