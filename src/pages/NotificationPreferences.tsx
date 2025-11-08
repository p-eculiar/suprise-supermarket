import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { FiBell, FiMail, FiSmartphone, FiCheck } from 'react-icons/fi';

const NotificationPreferences: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch user notification preferences
  const { data: preferences = [], isLoading } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: () => notificationService.getDetailedNotificationPreferences(user?.id || ''),
    enabled: !!user?.id,
  });

  // Update notification preference mutation
  const updatePreferenceMutation = useMutation({
    mutationFn: ({ preferenceType, category, enabled }: { preferenceType: string; category: string; enabled: boolean }) => 
      notificationService.updateNotificationPreference(user?.id || '', preferenceType, category, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });

  // Initialize state with fetched preferences
  const [emailPreferences, setEmailPreferences] = useState({
    orders: true,
    products: true,
    promotions: true,
    system: true,
  });

  const [pushPreferences, setPushPreferences] = useState({
    orders: true,
    products: true,
    promotions: true,
    system: true,
  });

  useEffect(() => {
    if (preferences.length > 0) {
      const emailPrefs = { orders: true, products: true, promotions: true, system: true };
      const pushPrefs = { orders: true, products: true, promotions: true, system: true };

      preferences.forEach(pref => {
        if (pref.preference_type === 'email') {
          (emailPrefs as any)[pref.category] = pref.enabled;
        } else if (pref.preference_type === 'push') {
          (pushPrefs as any)[pref.category] = pref.enabled;
        }
      });

      setEmailPreferences(emailPrefs);
      setPushPreferences(pushPrefs);
    }
  }, [preferences]);

  const handleEmailPreferenceChange = (category: string, enabled: boolean) => {
    setEmailPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
    
    updatePreferenceMutation.mutate({
      preferenceType: 'email',
      category,
      enabled
    });
  };

  const handlePushPreferenceChange = (category: string, enabled: boolean) => {
    setPushPreferences(prev => ({
      ...prev,
      [category]: enabled
    }));
    
    updatePreferenceMutation.mutate({
      preferenceType: 'push',
      category,
      enabled
    });
  };

  if (!user) {
    return (
      <Container>
        <EmptyState>
          <FiBell size={48} />
          <h3>Please login to manage notification preferences</h3>
          <p>You need to be logged in to customize your notification settings.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Notification Preferences</Title>
        <Subtitle>Customize how you want to be notified</Subtitle>
      </Header>

      {isLoading ? (
        <LoadingState>
          <FiBell className="spinner" />
          <p>Loading preferences...</p>
        </LoadingState>
      ) : (
        <>
          <PreferenceSection>
            <SectionHeader>
              <SectionIcon $bgColor="#6C9A7F">
                <FiMail />
              </SectionIcon>
              <SectionTitle>Email Notifications</SectionTitle>
            </SectionHeader>
            
            <PreferenceGroup>
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Order Updates</PreferenceTitle>
                  <PreferenceDescription>Get notified about your order status changes</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={emailPreferences.orders}
                  onChange={(e) => handleEmailPreferenceChange('orders', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Product Alerts</PreferenceTitle>
                  <PreferenceDescription>Be notified when products go on sale or are back in stock</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={emailPreferences.products}
                  onChange={(e) => handleEmailPreferenceChange('products', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Promotions & Offers</PreferenceTitle>
                  <PreferenceDescription>Receive exclusive deals and special offers</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={emailPreferences.promotions}
                  onChange={(e) => handleEmailPreferenceChange('promotions', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>System Notifications</PreferenceTitle>
                  <PreferenceDescription>Important updates about your account and platform changes</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={emailPreferences.system}
                  onChange={(e) => handleEmailPreferenceChange('system', e.target.checked)}
                />
              </PreferenceItem>
            </PreferenceGroup>
          </PreferenceSection>

          <PreferenceSection>
            <SectionHeader>
              <SectionIcon $bgColor="#3498DB">
                <FiSmartphone />
              </SectionIcon>
              <SectionTitle>Push Notifications</SectionTitle>
            </SectionHeader>
            
            <PreferenceGroup>
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Order Updates</PreferenceTitle>
                  <PreferenceDescription>Get notified about your order status changes</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={pushPreferences.orders}
                  onChange={(e) => handlePushPreferenceChange('orders', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Product Alerts</PreferenceTitle>
                  <PreferenceDescription>Be notified when products go on sale or are back in stock</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={pushPreferences.products}
                  onChange={(e) => handlePushPreferenceChange('products', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>Promotions & Offers</PreferenceTitle>
                  <PreferenceDescription>Receive exclusive deals and special offers</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={pushPreferences.promotions}
                  onChange={(e) => handlePushPreferenceChange('promotions', e.target.checked)}
                />
              </PreferenceItem>
              
              <PreferenceItem>
                <PreferenceLabel>
                  <PreferenceTitle>System Notifications</PreferenceTitle>
                  <PreferenceDescription>Important updates about your account and platform changes</PreferenceDescription>
                </PreferenceLabel>
                <ToggleSwitch
                  checked={pushPreferences.system}
                  onChange={(e) => handlePushPreferenceChange('system', e.target.checked)}
                />
              </PreferenceItem>
            </PreferenceGroup>
          </PreferenceSection>

          <SaveStatus>
            {updatePreferenceMutation.isSuccess && (
              <SuccessMessage>
                <FiCheck /> Preferences saved successfully
              </SuccessMessage>
            )}
            {updatePreferenceMutation.isError && (
              <ErrorMessage>
                Failed to save preferences. Please try again.
              </ErrorMessage>
            )}
          </SaveStatus>
        </>
      )}
    </Container>
  );
};

export default NotificationPreferences;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #636E72;
  margin: 0;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  color: #636E72;
  
  .spinner {
    font-size: 3rem;
    margin-bottom: 1rem;
    animation: spin 1s linear infinite;
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: #636E72;
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2D3436;
  }
  
  p {
    margin: 0;
    max-width: 400px;
  }
`;

const PreferenceSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const SectionIcon = styled.div<{ $bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bgColor}15;
  color: ${props => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0;
`;

const PreferenceGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #E1E8ED;
  
  &:hover {
    background: #F8F9FA;
  }
`;

const PreferenceLabel = styled.div`
  flex: 1;
`;

const PreferenceTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 0.25rem 0;
`;

const PreferenceDescription = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0;
`;

const ToggleSwitch = styled.input.attrs({ type: 'checkbox' })`
  position: relative;
  width: 50px;
  height: 24px;
  appearance: none;
  background: #DFE6E9;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:checked {
    background: #6C9A7F;
  }

  &:checked::before {
    transform: translateX(26px);
  }

  &::before {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const SaveStatus = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #4CAF5015;
  color: #4CAF50;
  border-radius: 8px;
  font-weight: 600;
`;

const ErrorMessage = styled.div`
  padding: 0.75rem;
  background: #F4433615;
  color: #F44336;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
`;