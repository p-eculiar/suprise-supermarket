import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiSave, FiPercent, FiDollarSign, FiMail, FiGlobe, FiRefreshCw } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { useRealtime } from '../../hooks/useRealtime';
import { useSettings } from '../../contexts/SettingsContext';
import toast from '../../components/common/Toast';

const AdminSettings: React.FC = () => {
  const { settings: currentSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState({
    platformFeePercentage: '2.5',
    taxRate: '7.5',
    minimumOrder: '10.00',
    shippingFee: '5.00',
    freeShippingThreshold: '50.00',
    siteName: 'Suprise Supermarket',
    supportEmail: 'support@suprisesuper.com',
    currency: 'NGN',
    timezone: 'Africa/Lagos'
  });
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current settings from platform_settings (single row)
  const loadSettings = async () => {
    try {
      setLoading(true);
      // Make sure we're getting the correct row by ID
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) {
        // Handle "no rows" error by creating default settings
        if (error.code === 'PGRST116' || error.message?.includes('Results contain 0 rows')) {
          console.log('No settings found, creating default settings...');
          await createDefaultSettings();
        } 
        // Handle "table not found" error by creating the table and default settings
        else if (error.message?.includes('could not find the table') || error.message?.includes('platform_settings')) {
          console.log('Platform settings table not found, will use default settings...');
          // Use default settings in state but don't show error to user
          setSettings({
            platformFeePercentage: '2.5',
            taxRate: '7.5',
            minimumOrder: '10.00',
            shippingFee: '5.00',
            freeShippingThreshold: '50.00',
            siteName: 'Suprise Supermarket',
            supportEmail: 'support@suprisesuper.com',
            currency: 'NGN',
            timezone: 'Africa/Lagos',
          });
        } else {
          // For other errors, throw to show error message
          throw new Error(error.message || 'Unknown error occurred');
        }
      } else if (data) {
        console.log('Processing admin settings data:', data);
        setSettings({
          platformFeePercentage: String(data.platform_fee_percentage ?? '2.5'),
          taxRate: String(data.tax_rate ?? '7.5'),
          minimumOrder: String(data.minimum_order ?? '10.00'),
          shippingFee: String(data.shipping_fee ?? '5.00'),
          freeShippingThreshold: String(data.free_shipping_threshold ?? '50.00'),
          siteName: data.site_name ?? 'Suprise Supermarket',
          supportEmail: data.support_email && data.support_email.trim() !== '' ? data.support_email : 'support@suprisesuper.com',
          currency: data.currency ?? 'NGN',
          timezone: data.timezone ?? 'Africa/Lagos',
        });
      }
    } catch (error: any) {
      console.error('Failed to load settings', error);
      // Only show error toast for actual errors, not missing data or missing table
      if (!error.message?.includes('Results contain 0 rows') && 
          !error.message?.includes('PGRST116') && 
          !error.message?.includes('could not find the table') && 
          !error.message?.includes('platform_settings')) {
        toast.error(`Failed to load settings: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize with current settings from context
  useEffect(() => {
    setSettings({
      platformFeePercentage: String(currentSettings.platformFeePercentage),
      taxRate: String(currentSettings.taxRate),
      minimumOrder: String(currentSettings.minimumOrder),
      shippingFee: String(currentSettings.shippingFee),
      freeShippingThreshold: String(currentSettings.freeShippingThreshold),
      siteName: currentSettings.siteName,
      supportEmail: currentSettings.supportEmail,
      currency: currentSettings.currency,
      timezone: currentSettings.timezone,
    });
  }, [currentSettings]);

  // Create default settings table and record
  const createDefaultSettings = async () => {
    try {
      const defaultSettings = {
        id: '00000000-0000-0000-0000-000000000001',
        platform_fee_percentage: 2.5,
        tax_rate: 7.5,
        minimum_order: 10.00,
        shipping_fee: 5.00,
        free_shipping_threshold: 50.00,
        site_name: 'Suprise Supermarket',
        support_email: 'support@suprisesuper.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos'
      };
      
      const { data: insertedData, error: insertError } = await supabase
        .from('platform_settings')
        .upsert(defaultSettings, { onConflict: 'id' })
        .select()
        .single();
      console.log('Inserted default settings data:', insertedData);
      if (insertError) {
        throw new Error(`Failed to create default settings: ${insertError.message}`);
      }
      
      setSettings({
        platformFeePercentage: String(insertedData.platform_fee_percentage ?? '2.5'),
        taxRate: String(insertedData.tax_rate ?? '7.5'),
        minimumOrder: String(insertedData.minimum_order ?? '10.00'),
        shippingFee: String(insertedData.shipping_fee ?? '5.00'),
        freeShippingThreshold: String(insertedData.free_shipping_threshold ?? '50.00'),
        siteName: insertedData.site_name ?? 'Suprise Supermarket',
        supportEmail: insertedData.support_email && insertedData.support_email.trim() !== '' ? insertedData.support_email : 'support@suprisesuper.com',
        currency: insertedData.currency ?? 'NGN',
        timezone: insertedData.timezone ?? 'Africa/Lagos',
      });
    } catch (error: any) {
      console.error('Failed to create default settings', error);
      // Use default settings in state but don't show error to user
      setSettings({
        platformFeePercentage: '2.5',
        taxRate: '7.5',
        minimumOrder: '10.00',
        shippingFee: '5.00',
        freeShippingThreshold: '50.00',
        siteName: 'Suprise Supermarket',
        supportEmail: 'support@suprisesuper.com',
        currency: 'NGN',
        timezone: 'Africa/Lagos',
      });
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Realtime: pick up settings changes made elsewhere
  useRealtime<any>({
    table: 'platform_settings',
    events: ['UPDATE'],
    filter: { column: 'id', value: '00000000-0000-0000-0000-000000000001' }, // Add filter to only listen for updates to our settings row
    onEvent: async (payload) => {
      try {
        // Only update if it's not our own change to avoid conflicts
        if (payload.eventType === 'UPDATE' && !saving) {
          // Make sure we're getting the correct row by ID
          const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .eq('id', '00000000-0000-0000-0000-000000000001')
            .single();
          console.log('Processing realtime admin settings data:', data);
          if (!error && data) {
            setSettings({
              platformFeePercentage: String(data.platform_fee_percentage ?? '2.5'),
              taxRate: String(data.tax_rate ?? '7.5'),
              minimumOrder: String(data.minimum_order ?? '10.00'),
              shippingFee: String(data.shipping_fee ?? '5.00'),
              freeShippingThreshold: String(data.free_shipping_threshold ?? '50.00'),
              siteName: data.site_name ?? 'Suprise Supermarket',
              supportEmail: data.support_email ?? 'support@suprisesuper.com',
              currency: data.currency ?? 'NGN',
              timezone: data.timezone ?? 'Africa/Lagos',
            });
            // Only show success toast if it's an actual update from another user
            if (payload.new?.id !== '00000000-0000-0000-0000-000000000001') {
              toast.success('Settings updated by another administrator');
            }
          }
        }
      } catch (error: any) {
        console.error('Failed to handle realtime update', error);
        // Don't show error toast for real-time updates to avoid spam
        // Especially don't show errors if table doesn't exist
      }
    },
    channelName: 'admin-platform-settings',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        id: '00000000-0000-0000-0000-000000000001', // Use the default settings ID
        platform_fee_percentage: Number(settings.platformFeePercentage),
        tax_rate: Number(settings.taxRate),
        minimum_order: Number(settings.minimumOrder),
        shipping_fee: Number(settings.shippingFee),
        free_shipping_threshold: Number(settings.freeShippingThreshold),
        site_name: settings.siteName,
        support_email: settings.supportEmail,
        currency: settings.currency,
        timezone: settings.timezone,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase.from('platform_settings').upsert(payload, { onConflict: 'id' });
      if (error) {
        // If table doesn't exist, show a more user-friendly message
        if (error.message?.includes('could not find the table') || error.message?.includes('platform_settings')) {
          throw new Error('Settings table not found. Please contact system administrator.');
        }
        throw error;
      }
      toast.success('Settings saved successfully!');
    } catch (err: any) {
      console.error('Failed to save settings', err);
      toast.error(`Failed to save settings: ${err.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  // Add refresh function
  const handleRefresh = () => {
    loadSettings();
  };

  return (
    <Container>
      <Header>
        <Title>Platform Settings</Title>
        <HeaderActions>
          <RefreshButton onClick={handleRefresh}>
            <FiRefreshCw />
            Refresh
          </RefreshButton>
          <SaveButton form="settings-form" disabled={saving}>
            {saving ? (
              <>
                <FiRefreshCw className="spinning" />
                Saving...
              </>
            ) : (
              <>
                <FiSave />
                Save Changes
              </>
            )}
          </SaveButton>
        </HeaderActions>
      </Header>

      <Form id="settings-form" onSubmit={handleSubmit}>
        <SettingsGrid>
          {/* Revenue Settings */}
          <SettingSection>
            <SectionHeader>
              <SectionIcon><FiPercent /></SectionIcon>
              <SectionTitle>Revenue & Fees</SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Configure platform commission rates and transaction fees
            </SectionDescription>

            <FormGroup>
              <Label>Platform Fee Percentage (%)</Label>
              <InputGroup>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.platformFeePercentage}
                  onChange={(e) => setSettings({ ...settings, platformFeePercentage: e.target.value })}
                />
                <InputSuffix>%</InputSuffix>
              </InputGroup>
              <InputHint>Commission charged on each transaction</InputHint>
            </FormGroup>

            {/* Tax Rate setting removed as per requirement */}
          </SettingSection>

          {/* Order Settings */}
          <SettingSection>
            <SectionHeader>
              <SectionIcon><FiDollarSign /></SectionIcon>
              <SectionTitle>Order Configuration</SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Set minimum order amounts and shipping policies
            </SectionDescription>

            <FormGroup>
              <Label>Minimum Order Amount</Label>
              <InputGroup>
                <InputPrefix>$</InputPrefix>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.minimumOrder}
                  onChange={(e) => setSettings({ ...settings, minimumOrder: e.target.value })}
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label>Standard Shipping Fee</Label>
              <InputGroup>
                <InputPrefix>$</InputPrefix>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.shippingFee}
                  onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
                />
              </InputGroup>
            </FormGroup>

            <FormGroup>
              <Label>Free Shipping Threshold</Label>
              <InputGroup>
                <InputPrefix>$</InputPrefix>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                />
              </InputGroup>
              <InputHint>Orders above this amount get free shipping</InputHint>
            </FormGroup>
          </SettingSection>

          {/* General Settings */}
          <SettingSection>
            <SectionHeader>
              <SectionIcon><FiGlobe /></SectionIcon>
              <SectionTitle>General Information</SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Basic platform configuration and branding
            </SectionDescription>

            <FormGroup>
              <Label>Site Name</Label>
              <Input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Support Email</Label>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </FormGroup>

            <FormGroup>
              <Label>Currency</Label>
              <Select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="NGN">NGN - Nigerian Naira</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Timezone</Label>
              <Select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              >
                <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </Select>
            </FormGroup>
          </SettingSection>

          {/* Email Settings */}
          <SettingSection>
            <SectionHeader>
              <SectionIcon><FiMail /></SectionIcon>
              <SectionTitle>Email Configuration</SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Configure email notifications and templates
            </SectionDescription>

            <InfoBox>
              <InfoTitle>Email Notifications</InfoTitle>
              <InfoText>
                Email notifications are sent for order confirmations, shipping updates, 
                and account activities. Configure your SMTP settings in the environment variables.
              </InfoText>
            </InfoBox>

            <CheckboxGroup>
              <Checkbox>
                <input type="checkbox" defaultChecked />
                <span>Send order confirmation emails</span>
              </Checkbox>
              <Checkbox>
                <input type="checkbox" defaultChecked />
                <span>Send shipping notification emails</span>
              </Checkbox>
              <Checkbox>
                <input type="checkbox" defaultChecked />
                <span>Send promotional emails</span>
              </Checkbox>
              <Checkbox>
                <input type="checkbox" />
                <span>Send weekly analytics reports</span>
              </Checkbox>
            </CheckboxGroup>
          </SettingSection>
        </SettingsGrid>
      </Form>
    </Container>
  );
};

export default AdminSettings;

const Container = styled.div`
  padding: 2rem;
  background: #F8F9FA;
  min-height: 100vh;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
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

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    width: 100%;
    flex-direction: column;
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
    justify-content: center;
  }
`;

const SaveButton = styled.button`
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
  
  &:hover:not(:disabled) {
    background: #5A8569;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(108, 154, 127, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    justify-content: center;
  }
`;

const Form = styled.form``;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

const SettingSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const SectionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: #6C9A7F15;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6C9A7F;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const SectionDescription = styled.p`
  font-size: 0.95rem;
  color: #636E72;
  margin: 0 0 1.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const InputGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const InputPrefix = styled.span`
  position: absolute;
  left: 1rem;
  color: #999;
  font-weight: 600;
  pointer-events: none;
  
  @media (max-width: 480px) {
    left: 0.75rem;
    font-size: 0.9rem;
  }
`;

const InputSuffix = styled.span`
  position: absolute;
  right: 1rem;
  color: #999;
  font-weight: 600;
  pointer-events: none;
  
  @media (max-width: 480px) {
    right: 0.75rem;
    font-size: 0.9rem;
  }
`;

const InputHint = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid #E1E8ED;
  border-radius: 8px;
  font-size: 0.95rem;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: #6C9A7F;
    box-shadow: 0 0 0 3px rgba(108, 154, 127, 0.1);
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    font-size: 0.9rem;
  }
`;

const InfoBox = styled.div`
  padding: 1.25rem;
  background: #6C9A7F10;
  border-left: 4px solid #6C9A7F;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const InfoTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0;
  line-height: 1.6;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  span {
    font-size: 0.95rem;
    color: #2D3436;
  }
  
  @media (max-width: 480px) {
    gap: 0.5rem;
    
    input[type="checkbox"] {
      width: 16px;
      height: 16px;
    }
    
    span {
      font-size: 0.85rem;
    }
  }
`;
