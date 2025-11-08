import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { FiSearch, FiEdit2, FiTrash2, FiRefreshCw, FiX, FiSend } from 'react-icons/fi';
import BulkEmailModal from '../../components/admin/BulkEmailModal';
import toast from '../../components/common/Toast';
import { TableLoader } from '../../components/common/GranularLoading';
import { useSettings } from '../../contexts/SettingsContext';

// Explicitly export the icons to ensure they're properly defined
const IconFiSearch = FiSearch;
const IconFiEdit2 = FiEdit2;
const IconFiTrash2 = FiTrash2;
const IconFiRefreshCw = FiRefreshCw;
const IconFiX = FiX;
const IconFiSend = FiSend;

// Explicitly export the components to ensure they're properly defined
const ComponentTableLoader = TableLoader;
const ComponentBulkEmailModal = BulkEmailModal;

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
  avatar_url?: string;
  totalOrders: number;
  totalSpent: number;
  created_at: string;
  updated_at: string;
}

const AdminUsers: React.FC = () => {
  const { formatCurrency } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkEmailModalOpen, setIsBulkEmailModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Add these functions for user management
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      toast.success('User deleted successfully');
      setConfirmDeleteUser(null);
      
      // Refresh the data
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${(error as Error).message}`);
    }
  };



  const handleSaveUser = async (updatedUser: User) => {
    try {
      // Update user profile - only update fields that exist in the database
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updatedUser.full_name,
          role: updatedUser.role,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedUser.id);

      if (profileError) throw profileError;
      
      // Close modal and refresh data
      setIsModalOpen(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      
      // Show success message
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(`Failed to update user: ${(error as Error).message}`);
    }
  };

  // Add bulk email functionality
  const handleBulkEmail = () => {
    setIsBulkEmailModalOpen(true);
  };

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAllUsers = () => {
    if (usersData && selectedUsers.size === usersData.length) {
      // Deselect all
      setSelectedUsers(new Set());
    } else {
      // Select all
      const allUserIds = new Set<string>(usersData?.map((user: User) => user.id) as string[] || []);
      setSelectedUsers(allUserIds);
    }
  };

  const handleEmailSent = () => {
    // Reset selection after successful email send
    setSelectedUsers(new Set());
  };

  // Handle refresh with loading state and feedback
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      await refetch();
      toast.success('Users data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fetch users from Supabase with proper joins to get email from auth.users
  const { data: usersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', searchTerm, filterRole],
    queryFn: async () => {
      try {
        console.log('Fetching users data...');
      
        // Fetch profiles data with avatar_url
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.log('Profiles query error:', profilesError);
          return [];
        }
      
        console.log('Profiles data:', profilesData);
        if (profilesData && profilesData.length > 0) {
          console.log('First profile:', profilesData[0]);
          console.log('First profile has avatar_url:', profilesData[0].avatar_url);
        }
      
        // Fetch all orders data in a single query
        const { data: allOrdersData, error: ordersError } = await supabase
          .from('orders')
          .select('user_id, total, status');
      
        if (ordersError) {
          console.error('Error fetching orders:', ordersError);
          // If we can't fetch orders, return users with zero stats
          return profilesData?.map((profile: any) => ({
            ...profile,
            totalOrders: 0,
            totalSpent: 0
          })) || [];
        }
      
        // Group orders by user_id for efficient lookup
        const ordersByUser = allOrdersData?.reduce((acc: any, order: any) => {
          if (!acc[order.user_id]) {
            acc[order.user_id] = [];
          }
          acc[order.user_id].push(order);
          return acc;
        }, {}) || {};
      
        // Map profiles to include order statistics
        const usersWithStats: User[] = profilesData?.map((profile: any) => {
          const userOrders = ordersByUser[profile.id] || [];
          const totalOrders = userOrders.length;
          const totalSpent = userOrders.reduce((sum: number, order: any) => 
            sum + (parseFloat(order.total) || 0), 0);
        
          const userWithStats = {
            ...profile,
            totalOrders,
            totalSpent
          };
          
          console.log('Mapped user:', userWithStats);
          console.log('Mapped user keys:', Object.keys(userWithStats));
          
          return userWithStats;
        }) || [];
      
        // Apply search and filter logic
        let filteredData: User[] = usersWithStats;
      
        // Apply search term filter
        if (searchTerm) {
          filteredData = filteredData.filter((user: User) =>
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      
        // Apply role filter
        if (filterRole && filterRole !== 'all') {
          filteredData = filteredData.filter((user: User) => user.role === filterRole);
        }
      
        return filteredData;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  // Realtime: refresh users list on profile changes using the useRealtime hook
  useRealtime({
    table: 'profiles',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    channelName: 'admin-users-realtime',
  });

  // Add realtime subscription for orders to update user statistics
  useRealtime({
    table: 'orders',
    events: ['INSERT', 'UPDATE', 'DELETE'],
    onEvent: (payload) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    channelName: 'admin-orders-realtime',
  });

  // Memoize stats calculation to prevent unnecessary recalculations
  const stats = React.useMemo(() => {
    return {
      totalUsers: usersData?.length || 0,
      activeUsers: usersData?.length || 0,
      newThisMonth: usersData?.filter((user: any) => {
        const createdDate = new Date(user.created_at);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length || 0,
      totalRevenue: usersData?.reduce((sum: number, user: any) => sum + (user.totalSpent || 0), 0) || 0
    };
  }, [usersData]);

  return (
    <Container>
      <Header>
        <Title>Users Management</Title>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh} disabled={isLoading || isRefreshing}>
            <FiRefreshCw className={isRefreshing ? 'spinning' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
          <BulkEmailButton 
            onClick={handleBulkEmail}
            disabled={selectedUsers.size === 0 && !usersData?.length}
            title={selectedUsers.size === 0 ? 'Select users to send emails' : 'Send bulk email to selected users'}
          >
            <IconFiSend />
            Send Bulk Email ({selectedUsers.size})
          </BulkEmailButton>
        </HeaderActions>
      </Header>

      {/* Stats Overview */}
      <StatsGrid>
        <StatCard>
          <StatValue>{stats.totalUsers.toLocaleString()}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.activeUsers.toLocaleString()}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>+{stats.newThisMonth}</StatValue>
          <StatLabel>New This Month</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{formatCurrency(stats.totalRevenue)}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <SearchBox>
          <IconFiSearch />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading}
          />
        </SearchBox>

        <FilterGroup>
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} disabled={isLoading}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </Select>
        </FilterGroup>
      </FilterBar>

      {/* Users Table */}
      <UsersTableContainer className="table-container">
        <UsersTable>
          <TableHeader>
            <TableRow>
              <TableHead style={{ width: '40px' }}>
                <input
                  type="checkbox"
                  checked={usersData ? selectedUsers.size === usersData.length && usersData.length > 0 : false}
                  onChange={handleSelectAllUsers}
                />
              </TableHead>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Total Orders</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <ComponentTableLoader rows={10} columns={8} />
                </TableCell>
              </TableRow>
            ) : usersData && (usersData as User[]).length > 0 ? (
              (usersData as User[]).map((user: User) => (
                <TableRow key={user.id} $selected={selectedUsers.has(user.id)}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <UserInfo>
                      <UserAvatar>
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.full_name || 'User'} onError={(e) => {
                            console.log('Avatar failed to load:', user.avatar_url);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }} />
                        ) : (
                          <span>{user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
                        )}
                      </UserAvatar>
                      <UserDetails>
                        <UserName>{user.full_name || 'Unnamed User'}</UserName>
                        <UserEmail>{user.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>
                    <RoleBadge $role={user.role}>{user.role}</RoleBadge>
                  </TableCell>
                  <TableCell>{user.totalOrders}</TableCell>
                  <TableCell>
                    <Amount>{formatCurrency(user.totalSpent)}</Amount>
                  </TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <LastActive>{new Date(user.updated_at).toLocaleDateString()}</LastActive>
                  </TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton title="Edit User" onClick={() => handleEditUser(user)}>
                        <IconFiEdit2 />
                      </ActionButton>
                      <ActionButton $danger title="Delete User" onClick={() => setConfirmDeleteUser(user.id)}>
                        <IconFiTrash2 />
                      </ActionButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </UsersTable>
      </UsersTableContainer>

      {/* User Edit Modal */}
      {isModalOpen && editingUser && (
        <ModalOverlay onClick={() => setIsModalOpen(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <h2>Edit User</h2>
              <CloseButton onClick={() => setIsModalOpen(false)}>
                <IconFiX />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              <FormRow>
                <Label>User ID</Label>
                <Input
                  type="text"
                  value={editingUser.id || ''}
                  disabled
                />
              </FormRow>
              <FormRow>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                />
              </FormRow>
              <FormRow>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editingUser.email || ''}
                  disabled
                />
              </FormRow>
              <FormRow>
                <Label>Role</Label>
                <Select
                  value={editingUser.role || 'customer'}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as any})}
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormRow>
              <FormRow>
                <Label>Member Since</Label>
                <Input
                  type="text"
                  value={editingUser.created_at ? new Date(editingUser.created_at).toLocaleDateString() : ''}
                  disabled
                />
              </FormRow>
              <FormRow>
                <Label>Total Orders</Label>
                <Input
                  type="text"
                  value={editingUser.totalOrders || 0}
                  disabled
                />
              </FormRow>
              <FormRow>
                <Label>Total Spent</Label>
                <Input
                  type="text"
                  value={formatCurrency(editingUser.totalSpent || 0)}
                  disabled
                />
              </FormRow>
              <FormActions>
                <Button $secondary onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleSaveUser(editingUser)}>
                  Save Changes
                </Button>
              </FormActions>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Bulk Email Modal */}
      {isBulkEmailModalOpen && (
        <ComponentBulkEmailModal
          isOpen={isBulkEmailModalOpen}
          selectedUsers={(usersData || []).filter((user: User) => selectedUsers.has(user.id))}
          allUsers={usersData || []}
          onClose={() => setIsBulkEmailModalOpen(false)}
          onEmailSent={handleEmailSent}
        />
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteUser && (
        <ModalOverlay onClick={() => setConfirmDeleteUser(null)}>
          <ConfirmModalContent onClick={(e) => e.stopPropagation()}>
            <ConfirmModalHeader>
              <h2>Confirm Delete</h2>
              <CloseButton onClick={() => setConfirmDeleteUser(null)}>
                <FiX />
              </CloseButton>
            </ConfirmModalHeader>
            <ConfirmModalBody>
              <ConfirmMessage>
                Are you sure you want to delete this user? This action cannot be undone.
              </ConfirmMessage>
              <ConfirmActions>
                <Button $secondary onClick={() => setConfirmDeleteUser(null)}>
                  Cancel
                </Button>
                <Button $danger onClick={() => handleDeleteUser(confirmDeleteUser)}>
                  Delete User
                </Button>
              </ConfirmActions>
            </ConfirmModalBody>
          </ConfirmModalContent>
        </ModalOverlay>
      )}

    </Container>
  );
};

export default AdminUsers;

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
    align-items: flex-start;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
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

const AddUserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;
const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
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
  
  &:hover:not(:disabled) {
    border-color: #6C9A7F;
    color: #6C9A7F;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
    
    &.spinning {
      animation: spin 1s linear infinite;
    }
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin-bottom: 1rem;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #6C9A7F;
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
`;

const SearchBox = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  padding: 0 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  svg {
    color: #999;
    width: 20px;
    height: 20px;
  }
  
  input {
    flex: 1;
    border: none;
    outline: none;
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    input {
      padding: 0.75rem;
      font-size: 0.9rem;
    }
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const Select = styled.select`
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  outline: none;
  
  &:focus {
    border-color: #6C9A7F;
  }
  
  @media (max-width: 768px) {
    flex: 1;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const UsersTableContainer = styled.div`
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

const UsersTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 900px;
  
  @media (max-width: 768px) {
    min-width: 800px;
  }
  
  @media (max-width: 480px) {
    min-width: 700px;
  }
`;

const TableHeader = styled.thead`
  background: #F8F9FA;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $selected?: boolean }>`
  border-bottom: 1px solid #F0F0F0;
  
  ${props => props.$selected && `
    background: #3498DB10;
  `}
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: ${props => props.$selected ? '#3498DB15' : '#F8F9FA'};
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.75rem;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
  white-space: nowrap;
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    font-size: 0.85rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.5rem;
  }
`;

const UserAvatar = styled.div`
  width: 45px;
  height: 45px;
  background: #6C9A7F;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: #999;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const RoleBadge = styled.span<{ $role: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$role) {
      case 'admin': return '#9B59B615';
      case 'vendor': return '#4ECDC415';
      case 'customer': return '#6C9A7F15';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$role) {
      case 'admin': return '#9B59B6';
      case 'vendor': return '#4ECDC4';
      case 'customer': return '#6C9A7F';
      default: return '#636E72';
    }
  }};
  text-transform: capitalize;
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.6rem;
  }
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'active': return '#4CAF5015';
      case 'inactive': return '#FF980015';
      case 'banned': return '#E74C3C15';
      default: return '#E1E8ED';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'banned': return '#E74C3C';
      default: return '#636E72';
    }
  }};
  text-transform: capitalize;
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.65rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.2rem 0.4rem;
    font-size: 0.6rem;
  }
`;

const Amount = styled.div`
  font-weight: 600;
  color: #6C9A7F;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const LastActive = styled.div`
  font-size: 0.875rem;
  color: #999;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.25rem;
  }
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$danger ? '#E74C3C15' : '#6C9A7F15'};
  color: ${props => props.$danger ? '#E74C3C' : '#6C9A7F'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.$danger ? '#E74C3C' : '#6C9A7F'};
    color: white;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
  
  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

const ModalOverlay = styled.div`
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
  
  @media (max-width: 480px) {
    padding: 0.5rem;
    align-items: flex-start;
    overflow-y: auto;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #636E72;
  
  &:hover {
    color: #2D3436;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const FormRow = styled.div`
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2D3436;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #6C9A7F;
  }
  
  &:disabled {
    background: #F8F9FA;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  }
`;

const Button = styled.button<{ $secondary?: boolean; $danger?: boolean }>`
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.$danger ? '#E74C3C' : props.$secondary ? '#95A5A6' : '#6C9A7F'};
  color: white;
  white-space: nowrap;
  
  &:hover {
    background: ${props => props.$danger ? '#C0392B' : props.$secondary ? '#7F8C8D' : '#5A8569'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    background: #BDC3C7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
`;

const BulkEmailButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  &:disabled {
    background: #BDC3C7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
`;

// Confirmation Modal Styles
const ConfirmModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 480px) {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 8px;
  }
`;

const ConfirmModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #E1E8ED;
  
  h2 {
    color: #E74C3C;
    font-size: 1.25rem;
    margin: 0;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    
    h2 {
      font-size: 1.1rem;
    }
  }
`;

const ConfirmModalBody = styled.div`
  padding: 2rem 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

const ConfirmMessage = styled.p`
  font-size: 1rem;
  color: #2D3436;
  line-height: 1.6;
  margin: 0 0 2rem 0;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
  }
`;

const ConfirmActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;
