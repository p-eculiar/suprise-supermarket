import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSearch, FiFilter, FiUserPlus, FiEdit2, FiTrash2, FiMail, FiShoppingBag } from 'react-icons/fi';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'vendor';
  status: 'active' | 'inactive' | 'banned';
  totalOrders: number;
  totalSpent: number;
  joinedDate: string;
  lastActive: string;
}

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data - will be replaced with Supabase data
  const users: User[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'customer',
      status: 'active',
      totalOrders: 24,
      totalSpent: 1256.50,
      joinedDate: '2024-01-15',
      lastActive: '2 hours ago'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'customer',
      status: 'active',
      totalOrders: 18,
      totalSpent: 892.30,
      joinedDate: '2024-02-20',
      lastActive: '1 day ago'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.j@example.com',
      role: 'vendor',
      status: 'active',
      totalOrders: 156,
      totalSpent: 8920.00,
      joinedDate: '2023-11-10',
      lastActive: '5 hours ago'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      email: 'sarah.w@example.com',
      role: 'admin',
      status: 'active',
      totalOrders: 0,
      totalSpent: 0,
      joinedDate: '2023-09-05',
      lastActive: '30 minutes ago'
    },
  ];

  const stats = {
    totalUsers: 3547,
    activeUsers: 3421,
    newThisMonth: 234,
    totalRevenue: 125840
  };

  return (
    <Container>
      <Header>
        <Title>Users Management</Title>
        <AddUserButton>
          <FiUserPlus />
          Add New User
        </AddUserButton>
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
          <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
          <StatLabel>Total Revenue</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Filters */}
      <FilterBar>
        <SearchBox>
          <FiSearch />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterGroup>
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="vendor">Vendors</option>
            <option value="admin">Admins</option>
          </Select>

          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </Select>
        </FilterGroup>
      </FilterBar>

      {/* Users Table */}
      <UsersTable>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Total Spent</TableHead>
            <TableHead>Joined Date</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>
                <UserInfo>
                  <UserAvatar>{user.name.charAt(0)}</UserAvatar>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserEmail>{user.email}</UserEmail>
                  </UserDetails>
                </UserInfo>
              </TableCell>
              <TableCell>
                <RoleBadge $role={user.role}>{user.role}</RoleBadge>
              </TableCell>
              <TableCell>
                <StatusBadge $status={user.status}>{user.status}</StatusBadge>
              </TableCell>
              <TableCell>{user.totalOrders}</TableCell>
              <TableCell>
                <Amount>${user.totalSpent.toLocaleString()}</Amount>
              </TableCell>
              <TableCell>{new Date(user.joinedDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <LastActive>{user.lastActive}</LastActive>
              </TableCell>
              <TableCell>
                <ActionButtons>
                  <ActionButton title="Send Email">
                    <FiMail />
                  </ActionButton>
                  <ActionButton title="Edit User">
                    <FiEdit2 />
                  </ActionButton>
                  <ActionButton $danger title="Delete User">
                    <FiTrash2 />
                  </ActionButton>
                </ActionButtons>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </UsersTable>
    </Container>
  );
};

export default AdminUsers;

const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
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
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 1.75rem;
  font-weight: 700;
  color: #6C9A7F;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const FilterBar = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
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
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 1rem;
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
`;

const UsersTable = styled.table`
  width: 100%;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background: #F8F9FA;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #F0F0F0;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #F8F9FA;
  }
`;

const TableHead = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #636E72;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2D3436;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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
`;

const UserDetails = styled.div``;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const UserEmail = styled.div`
  font-size: 0.875rem;
  color: #999;
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
`;

const Amount = styled.div`
  font-weight: 600;
  color: #6C9A7F;
`;

const LastActive = styled.div`
  font-size: 0.875rem;
  color: #999;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
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
`;
