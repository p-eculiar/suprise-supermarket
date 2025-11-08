import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { FiSearch, FiFilter, FiRefreshCw, FiCheck, FiX, FiClock, FiTruck, FiMapPin, FiEye, FiDownload, FiBarChart2 } from 'react-icons/fi';
import OrderApproval from '../../components/admin/OrderApproval';
import DeliveryAssignment from '../../components/admin/DeliveryAssignment';
import { orderTrackingService } from '../../services/orderTrackingService';
import toast from '../../components/common/Toast';
import { useSettings } from '../../contexts/SettingsContext';

// Explicitly export the icons to ensure they're properly defined
const IconFiSearch = FiSearch;
const IconFiFilter = FiFilter;
const IconFiRefreshCw = FiRefreshCw;
const IconFiCheck = FiCheck;
const IconFiX = FiX;
const IconFiClock = FiClock;
const IconFiTruck = FiTruck;
const IconFiMapPin = FiMapPin;
const IconFiEye = FiEye;
const IconFiDownload = FiDownload;
const IconFiBarChart2 = FiBarChart2;

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<{[key: string]: any}>({});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const queryClient = useQueryClient();
  const { formatCurrency } = useSettings();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch orders with better caching
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin-orders', debouncedSearchTerm, statusFilter, approvalFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      // Apply search filter
      if (debouncedSearchTerm) {
        query = query.or(`order_number.ilike.%${debouncedSearchTerm}%,customer_name.ilike.%${debouncedSearchTerm}%,customer_email.ilike.%${debouncedSearchTerm}%`);
      }

      // Apply status filter
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Apply approval filter
      if (approvalFilter !== 'all') {
        query = query.eq('approval_status', approvalFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false,
  });

  // Set up real-time subscription for orders with better error handling
  useEffect(() => {
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          toast.info('New order received');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          toast.info('Order updated');
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          toast.info('Order deleted');
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to orders real-time updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to orders real-time updates:', err);
          toast.error('Failed to subscribe to real-time updates');
        } else if (status === 'CLOSED') {
          console.log('Closed subscription to orders real-time updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Mutation for updating order status with optimistic updates
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status, description }: { orderId: string; status: string; description: string }) => {
      return await orderTrackingService.updateOrderStatus(orderId, status as any);
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin-orders'] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['admin-orders']);

      // Optimistically update to the new value
      queryClient.setQueryData(['admin-orders'], (old: any[] | undefined) => {
        if (!old) return old;
        return old.map(order => 
          order.id === orderId ? { ...order, status } : order
        );
      });

      // Return a context object with the snapshotted value
      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value
      if (context?.previousOrders) {
        queryClient.setQueryData(['admin-orders'], context.previousOrders);
      }
      toast.error('Failed to update order status');
    },
    onSuccess: () => {
      toast.success('Order status updated successfully');
    },
    onSettled: () => {
      // Refetch orders after mutation
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  // Mutation for bulk approval/rejection
  const bulkApprovalMutation = useMutation({
    mutationFn: async ({ orderIds, approvalStatus, notes }: { orderIds: string[]; approvalStatus: string; notes?: string }) => {
      // Get current user ID
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`);
      }
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      const userId = user.id;
      
      const updates = orderIds.map(orderId => 
        supabase
          .from('orders')
          .update({
            approval_status: approvalStatus,
            approved_by: userId,
            approved_at: new Date().toISOString(),
            approval_notes: notes || null,
            status: approvalStatus === 'approved' ? 'processing' : 'cancelled',
          })
          .eq('id', orderId)
      );
      
      const results = await Promise.all(updates);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        throw new Error(`Failed to update ${errors.length} orders`);
      }
      
      return results;
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully updated ${variables.orderIds.length} orders`);
      // Clear selection
      setSelectedOrders([]);
      setShowBulkActions(false);
    },
    onError: (error: any) => {
      toast.error(`Bulk update failed: ${error.message || 'Unknown error'}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  useEffect(() => {
    if (data) {
      setOrders(data);
    }
  }, [data]);

  // Debounce hook
  function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  const handleApprovalChange = () => {
    refetch();
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string, description: string) => {
    if (!window.confirm(`Are you sure you want to update this order to "${status}" status?`)) {
      return;
    }
    
    updateOrderStatusMutation.mutate({ orderId, status, description });
  };

  const handleViewTracking = async (orderId: string) => {
    setSelectedOrder(orderId);
    try {
      const tracking = await orderTrackingService.getOrderTrackingEvents(orderId);
      setTrackingData(prev => ({ ...prev, [orderId]: tracking }));
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      toast.error('Failed to load tracking data');
    }
  };

  const handleBulkApprove = () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');
      return;
    }
    
    const notes = window.prompt('Enter approval notes (optional):') || '';
    bulkApprovalMutation.mutate({ 
      orderIds: selectedOrders, 
      approvalStatus: 'approved', 
      notes 
    });
  };

  const handleBulkReject = () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select at least one order');
      return;
    }
    
    const notes = window.prompt('Enter rejection notes (required):');
    if (!notes) {
      toast.error('Rejection notes are required');
      return;
    }
    
    bulkApprovalMutation.mutate({ 
      orderIds: selectedOrders, 
      approvalStatus: 'rejected', 
      notes 
    });
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map(order => order.id));
    }
  };

  const exportOrders = () => {
    try {
      const csvContent = [
        ['Order ID', 'Order Number', 'Customer Name', 'Customer Email', 'Total', 'Status', 'Approval Status', 'Created At'],
        ...orders.map(order => [
          order.id,
          order.order_number,
          order.customer_name,
          order.customer_email,
          order.total,
          order.status,
          order.approval_status,
          new Date(order.created_at).toLocaleString()
        ])
      ]
        .map(row => row.join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: '#FF9800', icon: <FiClock /> },
      processing: { color: '#2196F3', icon: <FiClock /> },
      shipped: { color: '#FF9800', icon: <FiClock /> },
      delivered: { color: '#4CAF50', icon: <FiCheck /> },
      cancelled: { color: '#F44336', icon: <FiX /> },
      confirmed: { color: '#4CAF50', icon: <FiCheck /> },
    };

    const config = statusConfig[status] || { color: '#9E9E9E', icon: <FiClock /> };
    
    return (
      <StatusBadge $color={config.color}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </StatusBadge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const paymentConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: '#FF9800', icon: <FiClock /> },
      paid: { color: '#4CAF50', icon: <FiCheck /> },
      failed: { color: '#F44336', icon: <FiX /> },
    };

    const config = paymentConfig[status] || { color: '#9E9E9E', icon: <FiClock /> };
    
    return (
      <PaymentBadge $color={config.color}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </PaymentBadge>
    );
  };

  const getApprovalBadge = (status: string) => {
    const approvalConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { color: '#FF9800', icon: <FiClock /> },
      approved: { color: '#4CAF50', icon: <FiCheck /> },
      rejected: { color: '#F44336', icon: <FiX /> },
    };

    const config = approvalConfig[status] || { color: '#9E9E9E', icon: <FiClock /> };
    
    return (
      <ApprovalBadge $color={config.color}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </ApprovalBadge>
    );
  };

  if (isError) {
    return (
      <Container>
        <ErrorState>
          <h2>Error Loading Orders</h2>
          <p>{error?.message || 'An unknown error occurred'}</p>
          <RefreshButton onClick={() => refetch()}>
            <FiRefreshCw />
            Try Again
          </RefreshButton>
        </ErrorState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Order Management</Title>
        <Actions>
          <SearchContainer>
            <IconFiSearch />
            <SearchInput
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <FilterContainer>
            <IconFiFilter />
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </FilterContainer>
          <FilterContainer>
            <IconFiFilter />
            <Select value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
              <option value="all">All Approvals</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </FilterContainer>
          <RefreshButton onClick={() => refetch()}>
            <IconFiRefreshCw />
          </RefreshButton>
          <ActionButton onClick={exportOrders} title="Export Orders">
            <IconFiDownload />
          </ActionButton>
          <ActionButton as="a" href="/admin/orders/analytics" title="View Analytics">
            <IconFiBarChart2 />
          </ActionButton>
        </Actions>
      </Header>

      {showBulkActions && (
        <BulkActionsBar>
          <span>{selectedOrders.length} orders selected</span>
          <BulkActions>
            <BulkActionButton onClick={handleBulkApprove}>
              <IconFiCheck /> Approve
            </BulkActionButton>
            <BulkActionButton onClick={handleBulkReject} $reject>
              <IconFiX /> Reject
            </BulkActionButton>
            <BulkActionButton onClick={() => setShowBulkActions(false)}>
              Cancel
            </BulkActionButton>
          </BulkActions>

        </BulkActionsBar>
      )}

      {isLoading ? (
        <LoadingSkeletons />
      ) : (
        <TableContainer className="table-container">
          <Table>
            <thead>
              <tr>
                <TableHeader style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHeader>
                <TableHeader>Order ID</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Items</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Driver</TableHeader>
                <TableHeader>Payment</TableHeader>
                <TableHeader>Approval</TableHeader>
                <TableHeader>Actions</TableHeader>
                <TableHeader>Date</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                      />
                    </TableCell>
                    <TableCell>#{order.order_number || order.id.slice(0, 8)}</TableCell>
                    <TableCell>
                      <CustomerInfo>
                        <div>{order.customer_name}</div>
                        <CustomerEmail>{order.customer_email}</CustomerEmail>
                      </CustomerInfo>
                    </TableCell>
                    <TableCell>{order.order_items?.length || 0} items</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.driver_id ? (
                        <DriverInfo>
                          <div>Driver ID: {order.driver_id.slice(0, 8)}</div>
                          <div>Assigned</div>
                        </DriverInfo>
                      ) : (
                        <NoDriver>Not assigned</NoDriver>
                      )}
                    </TableCell>
                    <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                    <TableCell>{getApprovalBadge(order.approval_status)}</TableCell>
                    <TableCell>
                      <ActionButtons>
                        <ActionButton 
                          onClick={() => handleViewTracking(order.id)}
                          title="View Tracking"
                        >
                          <IconFiEye />
                        </ActionButton>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                          <StatusUpdateButton 
                            onClick={() => handleUpdateOrderStatus(order.id, 'processing', 'Order is being processed')}
                            title="Mark as Processing"
                          >
                            <IconFiClock />
                          </StatusUpdateButton>
                        )}
                      </ActionButtons>
                    </TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  </TableRow>
                  {order.approval_status === 'pending' && (
                    <tr>
                      <td colSpan={10}>
                        <OrderApproval order={order} onApprovalChange={handleApprovalChange} />
                      </td>
                    </tr>
                  )}
                  {order.approval_status === 'approved' && order.status === 'pending' && (
                    <tr>
                      <td colSpan={10}>
                        <DeliveryAssignment orderId={order.id} onAssignmentComplete={handleApprovalChange} />
                      </td>
                    </tr>
                  )}
                  {selectedOrder === order.id && trackingData[order.id] && (
                    <tr>
                      <td colSpan={10}>
                        <TrackingSection>
                          <TrackingHeader>
                            <h3>Order Tracking History</h3>
                            <CloseButton onClick={() => setSelectedOrder(null)}>
                              <IconFiX />
                            </CloseButton>
                          </TrackingHeader>
                          <TrackingList>
                            {trackingData[order.id].map((event: any, index: number) => (
                              <TrackingEvent key={index}>
                                <TrackingIcon $status={event.status}>
                                  <IconFiTruck />
                                </TrackingIcon>
                                <TrackingContent>
                                  <TrackingStatus>{event.status.replace('_', ' ').toUpperCase()}</TrackingStatus>
                                  <TrackingDescription>{event.description}</TrackingDescription>
                                  <TrackingTime>{new Date(event.created_at).toLocaleString()}</TrackingTime>
                                </TrackingContent>
                              </TrackingEvent>
                            ))}
                          </TrackingList>
                        </TrackingSection>
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
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  svg {
    color: #636E72;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  svg {
    color: #636E72;
    margin-right: 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
  }
`;

const Select = styled.select`
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.9rem;
  cursor: pointer;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const RefreshButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: white;
  border: 1px solid #E1E8ED;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #6C9A7F;
    color: white;
    border-color: #6C9A7F;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.1rem;
  color: #636E72;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
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
  min-width: 1000px;
  
  @media (max-width: 768px) {
    min-width: 900px;
  }
  
  @media (max-width: 480px) {
    min-width: 800px;
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

const CustomerInfo = styled.div``;

const CustomerEmail = styled.div`
  font-size: 0.8rem;
  color: #636E72;
  margin-top: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const StatusBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  
  @media (max-width: 480px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
`;

// Add new styled component for payment badge
const PaymentBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  
  @media (max-width: 480px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
`;

const ApprovalBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => `${props.$color}15`};
  color: ${props => props.$color};
  
  @media (max-width: 480px) {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
`;

// New styled components for tracking features
const DriverInfo = styled.div`
  font-size: 0.875rem;
  
  div:first-child {
    font-weight: 600;
    color: #2D3436;
  }
  
  div:last-child {
    font-size: 0.75rem;
    color: #636E72;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    
    div:last-child {
      font-size: 0.7rem;
    }
  }
`;

const NoDriver = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  font-style: italic;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.25rem;
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

const StatusUpdateButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2196F315;
  color: #2196F3;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #2196F3;
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

const TrackingSection = styled.div`
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 8px;
  margin: 1rem 0;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const TrackingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    color: #2D3436;
    font-size: 1.125rem;
  }
  
  @media (max-width: 480px) {
    h3 {
      font-size: 1rem;
    }
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E1E8ED;
  color: #636E72;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #D1D8DD;
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

const TrackingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TrackingEvent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #6C9A7F;
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    gap: 0.75rem;
  }
`;

const TrackingIcon = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${props => {
    switch (props.$status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#FF9800';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#6C9A7F';
    }
  }};
  color: white;
  border-radius: 50%;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const TrackingContent = styled.div`
  flex: 1;
`;

const TrackingStatus = styled.div`
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const TrackingDescription = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  margin-bottom: 0.25rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const TrackingTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

// Add new styled components
const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;

  h2 {
    color: #2D3436;
    margin-bottom: 1rem;
  }

  p {
    color: #636E72;
    margin-bottom: 2rem;
    max-width: 500px;
  }
`;

const BulkActionsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #6C9A7F;
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
    padding: 0.75rem;
  }
`;

const BulkActions = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const BulkActionButton = styled.button<{ $reject?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.$reject ? '#F44336' : 'white'};
  color: ${props => props.$reject ? 'white' : '#6C9A7F'};
  border: 1px solid ${props => props.$reject ? '#F44336' : 'white'};
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$reject ? '#E53935' : '#F8F9FA'};
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
  }
`;

const LoadingSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 1rem;
`;

const SkeletonRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SkeletonBox = styled.div<{ width?: string; height?: string }>`
  background: #F0F0F0;
  border-radius: 4px;
  width: ${props => props.width || '100%'};
  height: ${props => props.height || '20px'};
  animation: pulse 1.5s ease-in-out infinite alternate;
  
  @keyframes pulse {
    from { opacity: 0.7; }
    to { opacity: 1; }
  }
`;

const LoadingSkeletons = () => (
  <div>
    {[...Array(5)].map((_, i) => (
      <LoadingSkeleton key={i}>
        <SkeletonRow>
          <SkeletonBox width="40px" height="40px" />
          <SkeletonBox width="120px" />
          <SkeletonBox width="150px" />
          <SkeletonBox width="80px" />
          <SkeletonBox width="100px" />
          <SkeletonBox width="120px" />
          <SkeletonBox width="150px" />
          <SkeletonBox width="120px" />
          <SkeletonBox width="100px" />
          <SkeletonBox width="120px" />
        </SkeletonRow>
      </LoadingSkeleton>
    ))}
  </div>
);

export default Orders;
