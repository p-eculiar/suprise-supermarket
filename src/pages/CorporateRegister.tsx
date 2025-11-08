import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiCheckCircle, FiBriefcase } from 'react-icons/fi';

const CorporateRegister: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    businessType: 'restaurant',
    businessRegistrationNumber: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    creditLimit: '500000',
    paymentTerms: 'Net 30',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.from('corporate_clients').insert([
        {
          user_id: user?.id || null,
          company_name: formData.companyName,
          contact_person: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          business_type: formData.businessType,
          business_registration_number: formData.businessRegistrationNumber,
          tax_id: formData.taxId,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          credit_limit: parseFloat(formData.creditLimit),
          payment_terms: formData.paymentTerms,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting application:', error);
      alert(`Failed to submit application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Container>
        <SuccessCard>
          <SuccessIcon>
            <FiCheckCircle />
          </SuccessIcon>
          <SuccessTitle>Application Submitted Successfully! 🎉</SuccessTitle>
          <SuccessMessage>
            Thank you for applying for a corporate account. Our team will review your application and
            contact you within 1-2 business days.
          </SuccessMessage>
          <SuccessMessage>
            Once approved, you'll have access to:
          </SuccessMessage>
          <BenefitsList>
            <Benefit>✓ Wholesale pricing on all products</Benefit>
            <Benefit>✓ Net 30 payment terms</Benefit>
            <Benefit>✓ Dedicated account manager</Benefit>
            <Benefit>✓ Priority delivery scheduling</Benefit>
            <Benefit>✓ Bulk order discounts</Benefit>
          </BenefitsList>
          <BackButton onClick={() => navigate('/')}>Back to Home</BackButton>
        </SuccessCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Title>Corporate Account Application</Title>
          <Subtitle>Join our B2B program and enjoy wholesale prices and flexible payment terms</Subtitle>
        </HeaderContent>
      </Header>

      <Benefits>
        <BenefitCard>
          <BenefitIcon>💰</BenefitIcon>
          <BenefitTitle>Wholesale Pricing</BenefitTitle>
          <BenefitText>Save up to 30% on bulk orders</BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitIcon>📅</BenefitIcon>
          <BenefitTitle>Flexible Payment</BenefitTitle>
          <BenefitText>Net 7, 14, or 30 payment terms</BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitIcon>🚚</BenefitIcon>
          <BenefitTitle>Priority Delivery</BenefitTitle>
          <BenefitText>Same-day delivery for urgent orders</BenefitText>
        </BenefitCard>
        <BenefitCard>
          <BenefitIcon>👤</BenefitIcon>
          <BenefitTitle>Account Manager</BenefitTitle>
          <BenefitText>Dedicated support for your business</BenefitText>
        </BenefitCard>
      </Benefits>

      <FormContainer>
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>
              <FiBriefcase />
              Business Information
            </SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>Company Name *</Label>
                <Input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g., Delicious Restaurant Ltd"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Business Type *</Label>
                <Select name="businessType" value={formData.businessType} onChange={handleChange} required>
                  <option value="restaurant">Restaurant</option>
                  <option value="hotel">Hotel</option>
                  <option value="catering">Catering Service</option>
                  <option value="school">School</option>
                  <option value="hospital">Hospital</option>
                  <option value="office">Office/Corporate</option>
                  <option value="retail">Retail Store</option>
                  <option value="other">Other</option>
                </Select>
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <Label>Business Registration Number</Label>
                <Input
                  type="text"
                  name="businessRegistrationNumber"
                  value={formData.businessRegistrationNumber}
                  onChange={handleChange}
                  placeholder="RC Number or CAC Registration"
                />
              </FormGroup>

              <FormGroup>
                <Label>Tax Identification Number (TIN)</Label>
                <Input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  placeholder="Tax ID"
                />
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FiUser />
              Contact Information
            </SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>Contact Person *</Label>
                <Input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Email Address *</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@company.com"
                  required
                />
              </FormGroup>
            </FormRow>

            <FormGroup>
              <Label>Phone Number *</Label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 xxx xxx xxxx"
                required
              />
            </FormGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FiMapPin />
              Business Address
            </SectionTitle>

            <FormGroup>
              <Label>Street Address *</Label>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Building number and street name"
                required
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>City *</Label>
                <Input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g., Lagos"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>State *</Label>
                <Select name="state" value={formData.state} onChange={handleChange} required>
                  <option value="">Select State</option>
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja (FCT)</option>
                  <option value="Ogun">Ogun</option>
                  <option value="Rivers">Rivers</option>
                  <option value="Kano">Kano</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Delta">Delta</option>
                  <option value="Kaduna">Kaduna</option>
                  <option value="Anambra">Anambra</option>
                  <option value="Enugu">Enugu</option>
                  <option value="Other">Other</option>
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>

          <FormSection>
            <SectionTitle>
              <FiFileText />
              Credit & Payment Terms
            </SectionTitle>

            <FormRow>
              <FormGroup>
                <Label>Requested Credit Limit *</Label>
                <Select name="creditLimit" value={formData.creditLimit} onChange={handleChange} required>
                  <option value="250000">₦250,000</option>
                  <option value="500000">₦500,000</option>
                  <option value="1000000">₦1,000,000</option>
                  <option value="2000000">₦2,000,000</option>
                  <option value="5000000">₦5,000,000</option>
                </Select>
                <HelpText>Maximum amount you can purchase on credit</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Preferred Payment Terms *</Label>
                <Select name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} required>
                  <option value="Immediate">Immediate Payment</option>
                  <option value="Net 7">Net 7 (Pay within 7 days)</option>
                  <option value="Net 14">Net 14 (Pay within 14 days)</option>
                  <option value="Net 30">Net 30 (Pay within 30 days)</option>
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>

          <InfoBox>
            <InfoTitle>📋 What Happens Next?</InfoTitle>
            <InfoList>
              <InfoItem>✓ We review your application (1-2 business days)</InfoItem>
              <InfoItem>✓ Our team contacts you to verify details</InfoItem>
              <InfoItem>✓ Once approved, you receive login credentials</InfoItem>
              <InfoItem>✓ Start ordering with wholesale pricing immediately</InfoItem>
            </InfoList>
          </InfoBox>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </SubmitButton>

          <Disclaimer>
            By submitting this form, you agree to our corporate account terms and conditions. We may
            request additional documentation for verification purposes.
          </Disclaimer>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default CorporateRegister;

// Styled Components
const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const HeaderContent = styled.div``;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const Benefits = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const BenefitCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const BenefitTitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
`;

const BenefitText = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  padding-bottom: 2rem;
  border-bottom: 2px solid #f0f0f0;
  
  &:last-of-type {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ theme }) => theme.colors.primary.main};
  
  svg {
    font-size: 1.75rem;
  }
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
  font-size: 0.95rem;
  color: #333;
`;

const Input = styled.input`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  padding: 0.875rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const HelpText = styled.small`
  color: #999;
  font-size: 0.875rem;
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
  border: 2px solid #2196F3;
  border-radius: 12px;
  padding: 1.5rem;
`;

const InfoTitle = styled.h4`
  color: #1565C0;
  margin-bottom: 1rem;
  font-size: 1.125rem;
`;

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  color: #0D47A1;
  font-size: 0.95rem;
`;

const SubmitButton = styled.button`
  padding: 1.25rem;
  background: linear-gradient(135deg, #6C9A7F 0%, #5A8569 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(108, 154, 127, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Disclaimer = styled.p`
  text-align: center;
  color: #999;
  font-size: 0.875rem;
  line-height: 1.6;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 4rem auto;
`;

const SuccessIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #4CAF50 0%, #45A049 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
`;

const SuccessTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #333;
`;

const SuccessMessage = styled.p`
  color: #666;
  font-size: 1.125rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
`;

const BenefitsList = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 12px;
  margin: 2rem 0;
  text-align: left;
`;

const Benefit = styled.div`
  padding: 0.5rem 0;
  color: #333;
  font-size: 1rem;
`;

const BackButton = styled.button`
  padding: 1rem 2rem;
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;
