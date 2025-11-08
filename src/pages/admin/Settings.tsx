import React, { useState } from 'react';
import styled from 'styled-components';
import { FiSave, FiPercent, FiDollarSign, FiMail, FiGlobe } from 'react-icons/fi';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    platformFeePercentage: '2.5',
    taxRate: '7.5',
    minimumOrder: '10.00',
    shippingFee: '5.00',
    freeShippingThreshold: '50.00',
    siteName: 'Suprise Supermarket',
    supportEmail: 'support@suprisesuper.com',
    currency: 'USD',
    timezone: 'Africa/Lagos'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving settings:', settings);
    // TODO: Save to Supabase
  };

  return (
    <Container>
      <Header>
        <Title>Platform Settings</Title>
        <SaveButton form="settings-form">
          <FiSave />
          Save Changes
        </SaveButton>
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

            <FormGroup>
              <Label>Tax Rate (%)</Label>
              <InputGroup>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                />
                <InputSuffix>%</InputSuffix>
              </InputGroup>
              <InputHint>Sales tax applied to orders</InputHint>
            </FormGroup>
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

const Form = styled.form``;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const SettingSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
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
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.95rem;
  color: #636E72;
  margin: 0 0 1.5rem 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
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
`;

const InputPrefix = styled.span`
  position: absolute;
  left: 1rem;
  color: #999;
  font-weight: 600;
  pointer-events: none;
`;

const InputSuffix = styled.span`
  position: absolute;
  right: 1rem;
  color: #999;
  font-weight: 600;
  pointer-events: none;
`;

const InputHint = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 0.5rem;
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
`;

const InfoBox = styled.div`
  padding: 1.25rem;
  background: #6C9A7F10;
  border-left: 4px solid #6C9A7F;
  border-radius: 8px;
  margin-bottom: 1.5rem;
`;

const InfoTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #2D3436;
  margin: 0 0 0.5rem 0;
`;

const InfoText = styled.p`
  font-size: 0.875rem;
  color: #636E72;
  margin: 0;
  line-height: 1.6;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
`;
