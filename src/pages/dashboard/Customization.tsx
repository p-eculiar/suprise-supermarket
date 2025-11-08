import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { userService } from '../../services/userService';
import { Avatar } from '../../components/common/Avatar';
import toast from '../../components/common/Toast';
import { FiUpload, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Customization: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [profileData, setProfileData] = useState({
    fullName: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: user?.user_metadata?.address || '',
    city: user?.user_metadata?.city || '',
    state: user?.user_metadata?.state || '',
    zipCode: user?.user_metadata?.zip_code || '',
    emailNotifications: user?.user_metadata?.email_notifications !== false, // Default to true
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      return null;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    setMessage(null);

    try {
      let avatarUrl = user.user_metadata?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }

      // 1. Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          zip_code: profileData.zipCode,
          avatar_url: avatarUrl,
          email_notifications: profileData.emailNotifications,
        },
      });

      if (authError) throw authError;

      // 2. Update profiles table
      const updateSuccess = await userService.updateProfile(user.id, {
        full_name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        state: profileData.state,
        postal_code: profileData.zipCode,
        avatar_url: avatarUrl,
        email_notifications: profileData.emailNotifications,
      });

      if (!updateSuccess) {
        console.warn('Failed to update profiles table, but auth updated');
      }

      // 3. Refresh user context to update header/nav immediately
      await refreshUser();

      // 4. Show success toast
      toast.success(`Profile updated successfully, ${profileData.fullName}!`);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Profile Settings</Title>
        <Subtitle>Manage your account information and preferences</Subtitle>
      </Header>

      {message && (
        <Message $type={message.type}>
          {message.text}
        </Message>
      )}

      <Content>
        <Section>
          <SectionTitle>Profile Picture</SectionTitle>
          <AvatarSection>
            <AvatarWrapper>
              <Avatar
                src={avatarPreview || undefined}
                name={profileData.fullName || user?.email}
                size="xl"
              />
            </AvatarWrapper>
            <AvatarActions>
              <FileInputLabel>
                <FiUpload />
                <span>Upload New Photo</span>
                <FileInput
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </FileInputLabel>
              <AvatarHint>JPG, PNG or GIF. Max size 2MB</AvatarHint>
            </AvatarActions>
          </AvatarSection>
        </Section>

        <Section>
          <SectionTitle>Personal Information</SectionTitle>
          <Form>
            <FormGroup>
              <Label>
                <FiUser />
                <span>Full Name</span>
              </Label>
              <Input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                <FiMail />
                <span>Email Address</span>
              </Label>
              <Input
                type="email"
                value={profileData.email}
                disabled
                placeholder="john@example.com"
              />
              <InputHint>Email cannot be changed</InputHint>
            </FormGroup>

            <FormGroup>
              <Label>
                <FiPhone />
                <span>Phone Number</span>
              </Label>
              <Input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+234 800 000 0000"
              />
            </FormGroup>
          </Form>
        </Section>

        <Section>
          <SectionTitle>Address Information</SectionTitle>
          <Form>
            <FormGroup>
              <Label>
                <FiMapPin />
                <span>Street Address</span>
              </Label>
              <Input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City</Label>
                <Input
                  type="text"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="Lagos"
                />
              </FormGroup>

              <FormGroup>
                <Label>State</Label>
                <Input
                  type="text"
                  value={profileData.state}
                  onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  placeholder="Lagos State"
                />
              </FormGroup>

              <FormGroup>
                <Label>Zip Code</Label>
                <Input
                  type="text"
                  value={profileData.zipCode}
                  onChange={(e) => setProfileData({ ...profileData, zipCode: e.target.value })}
                  placeholder="100001"
                />
              </FormGroup>
            </FormRow>
          </Form>
        </Section>

        <Section>
          <SectionTitle>Notification Preferences</SectionTitle>
          <Form>
            <NotificationOption>
              <NotificationInfo>
                <NotificationTitle>Email Notifications</NotificationTitle>
                <NotificationDescription>
                  Receive email notifications about new products, special offers, and updates
                </NotificationDescription>
              </NotificationInfo>
              <ToggleSwitch>
                <ToggleInput
                  type="checkbox"
                  checked={profileData.emailNotifications}
                  onChange={(e) => setProfileData({ ...profileData, emailNotifications: e.target.checked })}
                />
                <ToggleSlider />
              </ToggleSwitch>
            </NotificationOption>
          </Form>
        </Section>

        <SaveButton onClick={handleSaveProfile} disabled={isLoading}>
          <FiSave />
          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
        </SaveButton>
      </Content>
    </Container>
  );
};

export default Customization;

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 900px;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Message = styled.div<{ $type: 'success' | 'error' }>`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  background: ${({ $type }) => ($type === 'success' ? '#d4edda' : '#f8d7da')};
  color: ${({ $type }) => ($type === 'success' ? '#155724' : '#721c24')};
  border: 1px solid ${({ $type }) => ($type === 'success' ? '#c3e6cb' : '#f5c6cb')};
`;

const Content = styled.div`
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

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const AvatarWrapper = styled.div``;

const AvatarActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1.125rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const AvatarHint = styled.span`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  
  svg {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary.main}20`};
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.common.gray[100]};
    cursor: not-allowed;
  }
`;

const InputHint = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  align-self: flex-start;
  
  svg {
    font-size: 1.125rem;
  }
  
  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const NotificationOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.common.gray[100]};
  border-radius: 8px;
`;

const NotificationInfo = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const NotificationDescription = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: ${({ theme }) => theme.colors.primary.main};
  }

  &:checked + span:before {
    transform: translateX(30px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 30px;

  &:before {
    position: absolute;
    content: '';
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;
