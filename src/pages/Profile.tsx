import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { Container, Section, Heading, Text, Button, Input, Avatar } from '../components/common';
import { FiUser, FiMail, FiEdit2, FiSave, FiLock, FiClock, FiPackage } from 'react-icons/fi';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      await updateProfile(user.id, { name: formData.name });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProfileContainer>
      <Section>
        <Container>
          <ProfileHeader>
            <Avatar size="xl" src={user.avatar} name={user.name} />
            <div>
              <Heading as="h1" size="2xl">
                {isEditing ? (
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                  />
                ) : (
                  user.name
                )}
              </Heading>
              <Text color="textSecondary">{user.email}</Text>
            </div>
            <Button
              variant={isEditing ? 'primary' : 'outline'}
              onClick={isEditing ? handleSubmit : () => setIsEditing(true)}
              disabled={isLoading}
              startIcon={isEditing ? <FiSave /> : <FiEdit2 />}
            >
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </ProfileHeader>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <ProfileSections>
            <ProfileSection>
              <SectionHeader>
                <FiUser />
                <h2>Account Information</h2>
              </SectionHeader>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Name</InfoLabel>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      fullWidth
                    />
                  ) : (
                    <InfoValue>{user.name}</InfoValue>
                  )}
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{user.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Member Since</InfoLabel>
                  <InfoValue>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
            </ProfileSection>

            <ProfileSection>
              <SectionHeader>
                <FiPackage />
                <h2>Recent Orders</h2>
              </SectionHeader>
              <EmptyState>
                <FiPackage size={48} />
                <Text>No orders yet</Text>
                <Button variant="primary" to="/products">
                  Start Shopping
                </Button>
              </EmptyState>
            </ProfileSection>
          </ProfileSections>
        </Container>
      </Section>
    </ProfileContainer>
  );
};

export default ProfilePage;

const ProfileContainer = styled.div`
  padding: 2rem 0;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  
  ${({ theme }) => theme.breakpoints.md} {
    flex-wrap: nowrap;
  }
`;

const ProfileSections = styled.div`
  display: grid;
  gap: 2rem;
  
  ${({ theme }) => theme.breakpoints.lg} {
    grid-template-columns: 2fr 1fr;
  }
`;

const ProfileSection = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }
  
  svg {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const InfoValue = styled.span`
  font-weight: 500;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  gap: 1rem;
  
  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
    opacity: 0.5;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => `${theme.colors.error}10`};
  color: ${({ theme }) => theme.colors.error};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => `${theme.colors.success}10`};
  color: ${({ theme }) => theme.colors.success};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
