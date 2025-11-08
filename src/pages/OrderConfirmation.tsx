import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { documentService } from '../services/documentService';
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiClock, FiAlertCircle, FiDownload } from 'react-icons/fi';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [showAdminContact, setShowAdminContact] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_tracking (
            delivery_date,
            driver_name,
            driver_phone,
            status
          ),
          order_items (*)
        `)
        .eq('id', orderId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: invoice } = useQuery({
    queryKey: ['invoice', orderId],
    queryFn: async () => {
      return await documentService.getInvoiceByOrderId(orderId!);
    },
    enabled: !!orderId
  });

  const { data: receipt } = useQuery({
    queryKey: ['receipt', orderId],
    queryFn: async () => {
      return await documentService.getReceiptByOrderId(orderId!);
    },
    enabled: !!orderId
  });

  // Check if approval is taking too long (more than 24 hours)
  useEffect(() => {
    if (order && order.approval_status === 'pending') {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        setShowAdminContact(true);
      }
    }
  }, [order]);

  const handleDownloadDocument = (type: 'invoice' | 'receipt', data: any) => {
    // In a real application, this would generate a PDF document
    // For now, we'll create a simple text file with the document details
    const content = `${type.toUpperCase()} Details:\n\n${JSON.stringify(data, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${data.order_id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingMessage>Loading order details...</LoadingMessage>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <ErrorMessage>Order not found</ErrorMessage>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </Container>
    );
  }

  // Show waiting for approval message
  if (order.approval_status === 'pending') {
    return (
      <Container>
        <SuccessIcon>
          <FiClock />
        </SuccessIcon>
        
        <Title>Order Received!</Title>
        <Subtitle>Thank you for your purchase</Subtitle>
        
        <OrderNumber>Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}</OrderNumber>
        
        {order.payment_status === 'pending' && order.bank_transfer_details ? (
          <InfoCard>
            <InfoIcon>
              <FiClock />
            </InfoIcon>
            <InfoTitle>Bank Transfer Instructions</InfoTitle>
            <InfoMessage>
              Please complete your bank transfer using the details below:
            </InfoMessage>
            <BankDetails>
              <BankDetail><strong>Bank Name:</strong> {order.bank_transfer_details.bank_name}</BankDetail>
              <BankDetail><strong>Account Number:</strong> {order.bank_transfer_details.account_number}</BankDetail>
              <BankDetail><strong>Account Name:</strong> {order.bank_transfer_details.account_name}</BankDetail>
              <BankDetail><strong>Amount:</strong> ₦{order.total.toFixed(2)}</BankDetail>
              <BankDetail><strong>Reference:</strong> ORDER-{order.order_number || order.id.slice(0, 8).toUpperCase()}</BankDetail>
            </BankDetails>
            <InfoMessage>
              <strong>Important:</strong> After making the transfer, please keep your transaction reference number and notify us via the contact form or email.
            </InfoMessage>
          </InfoCard>
        ) : (
          <InfoCard>
            <InfoIcon>
              <FiClock />
            </InfoIcon>
            <InfoTitle>Waiting for Approval</InfoTitle>
            <InfoMessage>
              Your order is currently pending admin approval. This usually takes a few hours.
            </InfoMessage>
            <InfoDetail>
              Order placed: {new Date(order.created_at).toLocaleString()}
            </InfoDetail>
          </InfoCard>
        )}

        {showAdminContact && (
          <WarningCard>
            <WarningIcon>
              <FiAlertCircle />
            </WarningIcon>
            <WarningTitle>Approval Taking Longer Than Expected</WarningTitle>
            <WarningMessage>
              If your order approval is taking longer than 24 hours, please contact our admin team.
            </WarningMessage>
            <WarningDetail>
              Admin Email: support@suprisesuper.com
            </WarningDetail>
          </WarningCard>
        )}

        <StatusTimeline>
          <TimelineItem $active>
            <TimelineIcon><FiCheckCircle /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Order Placed</TimelineTitle>
              <TimelineDate>{new Date(order.created_at).toLocaleDateString()}</TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelineIcon><FiPackage /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Approved & Processing</TimelineTitle>
              <TimelineDate>Waiting for admin approval</TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelineIcon><FiTruck /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Out for Delivery</TimelineTitle>
              <TimelineDate>After processing</TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelineIcon><FiHome /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Delivered</TimelineTitle>
              <TimelineDate>After dispatch</TimelineDate>
            </TimelineContent>
          </TimelineItem>
        </StatusTimeline>

        <OrderDetails>
          <DetailsSection>
            <DetailsTitle>Shipping Information</DetailsTitle>
            <DetailsList>
              <DetailsItem>
                <strong>Name:</strong> {order.customer_name}
              </DetailsItem>
              <DetailsItem>
                <strong>Email:</strong> {order.customer_email}
              </DetailsItem>
              <DetailsItem>
                <strong>Phone:</strong> {order.customer_phone}
              </DetailsItem>
              <DetailsItem>
                <strong>Address:</strong> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}
              </DetailsItem>
            </DetailsList>
          </DetailsSection>

          <DetailsSection>
            <DetailsTitle>Payment Summary</DetailsTitle>
            <DetailsList>
              <SummaryRow>
                <span>Subtotal</span>
                <span>₦{order.subtotal?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Tax</span>
                <span>₦{order.tax?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping</span>
                <span>₦{order.delivery_fee?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Discount</span>
                <span>₦{order.discount?.toFixed(2)}</span>
              </SummaryRow>
              <Divider />
              <SummaryRow $total>
                <span>Total</span>
                <span>₦{order.total?.toFixed(2)}</span>
              </SummaryRow>
            </DetailsList>
          </DetailsSection>

          {(invoice || receipt) && (
            <DetailsSection>
              <DetailsTitle>Documents</DetailsTitle>
              <DocumentActions>
                {invoice && (
                  <DocumentButton onClick={() => handleDownloadDocument('invoice', invoice)}>
                    <FiDownload /> Download Invoice
                  </DocumentButton>
                )}
                {receipt && (
                  <DocumentButton onClick={() => handleDownloadDocument('receipt', receipt)}>
                    <FiDownload /> Download Receipt
                  </DocumentButton>
                )}
              </DocumentActions>
            </DetailsSection>
          )}

          <DetailsSection>
            <DetailsTitle>Order Items</DetailsTitle>
            {order.order_items && order.order_items.map((item: any, index: number) => (
              <OrderItem key={index}>
                <ItemImage src={item.product_image_url} alt={item.product_name} />
                <ItemDetails>
                  <ItemName>{item.product_name}</ItemName>
                  <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
                </ItemDetails>
                <ItemPrice>₦{(item.price * item.quantity).toFixed(2)}</ItemPrice>
              </OrderItem>
            ))}
          </DetailsSection>
        </OrderDetails>

        <ActionButtons>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          <Button onClick={() => navigate('/dashboard/history')} variant="secondary">
            View Order History
          </Button>
        </ActionButtons>
      </Container>
    );
  }

  // Show delivery information after approval
  if (order.approval_status === 'approved') {
    return (
      <Container>
        <SuccessIcon>
          <FiCheckCircle />
        </SuccessIcon>
        
        <Title>Order Approved!</Title>
        <Subtitle>Thank you for your purchase</Subtitle>
        
        <OrderNumber>Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}</OrderNumber>
        
        {order.delivery_tracking?.delivery_date ? (
          <InfoCard $success>
            <InfoIcon $success>
              <FiTruck />
            </InfoIcon>
            <InfoTitle>Delivery Scheduled</InfoTitle>
            <InfoMessage>
              Your order has been approved and is scheduled for delivery.
            </InfoMessage>
            <InfoDetail>
              Delivery Date: {new Date(order.delivery_tracking.delivery_date).toLocaleString()}
            </InfoDetail>
          </InfoCard>
        ) : (
          <InfoCard>
            <InfoIcon>
              <FiClock />
            </InfoIcon>
            <InfoTitle>Order Approved</InfoTitle>
            <InfoMessage>
              Your order has been approved. Delivery date will be scheduled soon.
            </InfoMessage>
          </InfoCard>
        )}

        {order.delivery_tracking?.driver_name && (
          <DriverInfoCard>
            <DriverIcon>
              <FiTruck />
            </DriverIcon>
            <DriverTitle>Delivery Driver Assigned</DriverTitle>
            <DriverDetails>
              <DriverName>{order.delivery_tracking.driver_name}</DriverName>
              {order.delivery_tracking.driver_phone && (
                <DriverPhone>Phone: {order.delivery_tracking.driver_phone}</DriverPhone>
              )}
            </DriverDetails>
          </DriverInfoCard>
        )}

        <StatusTimeline>
          <TimelineItem $active>
            <TimelineIcon><FiCheckCircle /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Order Placed</TimelineTitle>
              <TimelineDate>{new Date(order.created_at).toLocaleDateString()}</TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem $active>
            <TimelineIcon><FiPackage /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Approved</TimelineTitle>
              <TimelineDate>{order.approved_at ? new Date(order.approved_at).toLocaleDateString() : 'Approved'}</TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelineIcon><FiTruck /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Out for Delivery</TimelineTitle>
              <TimelineDate>
                {order.delivery_tracking?.delivery_date 
                  ? new Date(order.delivery_tracking.delivery_date).toLocaleDateString()
                  : 'Scheduled soon'}
              </TimelineDate>
            </TimelineContent>
          </TimelineItem>
          
          <TimelineItem>
            <TimelineIcon><FiHome /></TimelineIcon>
            <TimelineContent>
              <TimelineTitle>Delivered</TimelineTitle>
              <TimelineDate>After dispatch</TimelineDate>
            </TimelineContent>
          </TimelineItem>
        </StatusTimeline>

        <OrderDetails>
          <DetailsSection>
            <DetailsTitle>Shipping Information</DetailsTitle>
            <DetailsList>
              <DetailsItem>
                <strong>Name:</strong> {order.customer_name}
              </DetailsItem>
              <DetailsItem>
                <strong>Email:</strong> {order.customer_email}
              </DetailsItem>
              <DetailsItem>
                <strong>Phone:</strong> {order.customer_phone}
              </DetailsItem>
              <DetailsItem>
                <strong>Address:</strong> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}
              </DetailsItem>
            </DetailsList>
          </DetailsSection>

          <DetailsSection>
            <DetailsTitle>Payment Summary</DetailsTitle>
            <DetailsList>
              <SummaryRow>
                <span>Subtotal</span>
                <span>₦{order.subtotal?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Tax</span>
                <span>₦{order.tax?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping</span>
                <span>₦{order.delivery_fee?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Discount</span>
                <span>₦{order.discount?.toFixed(2)}</span>
              </SummaryRow>
              <Divider />
              <SummaryRow $total>
                <span>Total</span>
                <span>₦{order.total?.toFixed(2)}</span>
              </SummaryRow>
            </DetailsList>
          </DetailsSection>

          {(invoice || receipt) && (
            <DetailsSection>
              <DetailsTitle>Documents</DetailsTitle>
              <DocumentActions>
                {invoice && (
                  <DocumentButton onClick={() => handleDownloadDocument('invoice', invoice)}>
                    <FiDownload /> Download Invoice
                  </DocumentButton>
                )}
                {receipt && (
                  <DocumentButton onClick={() => handleDownloadDocument('receipt', receipt)}>
                    <FiDownload /> Download Receipt
                  </DocumentButton>
                )}
              </DocumentActions>
            </DetailsSection>
          )}

          <DetailsSection>
            <DetailsTitle>Order Items</DetailsTitle>
            {order.order_items && order.order_items.map((item: any, index: number) => (
              <OrderItem key={index}>
                <ItemImage src={item.product_image_url} alt={item.product_name} />
                <ItemDetails>
                  <ItemName>{item.product_name}</ItemName>
                  <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
                </ItemDetails>
                <ItemPrice>₦{(item.price * item.quantity).toFixed(2)}</ItemPrice>
              </OrderItem>
            ))}
          </DetailsSection>
        </OrderDetails>

        <ActionButtons>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          <Button onClick={() => navigate('/dashboard/history')} variant="secondary">
            View Order History
          </Button>
        </ActionButtons>
      </Container>
    );
  }

  // Show rejection message if order was rejected
  if (order.approval_status === 'rejected') {
    return (
      <Container>
        <ErrorIcon>
          <FiAlertCircle />
        </ErrorIcon>
        
        <Title>Order Rejected</Title>
        <Subtitle>We're sorry, but your order was not approved</Subtitle>
        
        <OrderNumber>Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}</OrderNumber>
        
        <InfoCard $error>
          <InfoIcon $error>
            <FiAlertCircle />
          </InfoIcon>
          <InfoTitle>Order Rejected</InfoTitle>
          <InfoMessage>
            {order.approval_notes || 'Your order was rejected by admin.'}
          </InfoMessage>
          <InfoDetail>
            Rejected on: {new Date(order.approved_at).toLocaleString()}
          </InfoDetail>
        </InfoCard>

        <OrderDetails>
          <DetailsSection>
            <DetailsTitle>Shipping Information</DetailsTitle>
            <DetailsList>
              <DetailsItem>
                <strong>Name:</strong> {order.customer_name}
              </DetailsItem>
              <DetailsItem>
                <strong>Email:</strong> {order.customer_email}
              </DetailsItem>
              <DetailsItem>
                <strong>Phone:</strong> {order.customer_phone}
              </DetailsItem>
              <DetailsItem>
                <strong>Address:</strong> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}
              </DetailsItem>
            </DetailsList>
          </DetailsSection>

          <DetailsSection>
            <DetailsTitle>Payment Summary</DetailsTitle>
            <DetailsList>
              <SummaryRow>
                <span>Subtotal</span>
                <span>₦{order.subtotal?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Tax</span>
                <span>₦{order.tax?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Shipping</span>
                <span>₦{order.delivery_fee?.toFixed(2)}</span>
              </SummaryRow>
              <SummaryRow>
                <span>Discount</span>
                <span>₦{order.discount?.toFixed(2)}</span>
              </SummaryRow>
              <Divider />
              <SummaryRow $total>
                <span>Total</span>
                <span>₦{order.total?.toFixed(2)}</span>
              </SummaryRow>
            </DetailsList>
          </DetailsSection>

          <DetailsSection>
            <DetailsTitle>Order Items</DetailsTitle>
            {order.order_items && order.order_items.map((item: any, index: number) => (
              <OrderItem key={index}>
                <ItemImage src={item.product_image_url} alt={item.product_name} />
                <ItemDetails>
                  <ItemName>{item.product_name}</ItemName>
                  <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
                </ItemDetails>
                <ItemPrice>₦{(item.price * item.quantity).toFixed(2)}</ItemPrice>
              </OrderItem>
            ))}
          </DetailsSection>
        </OrderDetails>

        <ActionButtons>
          <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          <Button onClick={() => navigate('/dashboard/history')} variant="secondary">
            View Order History
          </Button>
        </ActionButtons>
      </Container>
    );
  }

  return (
    <Container>
      <SuccessIcon>
        <FiCheckCircle />
      </SuccessIcon>
      
      <Title>Order Confirmed!</Title>
      <Subtitle>Thank you for your purchase</Subtitle>
      
      <OrderNumber>Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}</OrderNumber>
      
      <InfoCard>
        <InfoIcon>
          <FiClock />
        </InfoIcon>
        <InfoTitle>Order Processing</InfoTitle>
        <InfoMessage>
          Your order has been received and is being processed.
        </InfoMessage>
        <InfoDetail>
          Estimated delivery time: 2 hours after approval
        </InfoDetail>
      </InfoCard>

      <StatusTimeline>
        <TimelineItem $active>
          <TimelineIcon><FiCheckCircle /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Order Placed</TimelineTitle>
            <TimelineDate>{new Date(order.created_at).toLocaleDateString()}</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiPackage /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Approved & Processing</TimelineTitle>
            <TimelineDate>Pending admin approval</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiTruck /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Out for Delivery</TimelineTitle>
            <TimelineDate>After processing</TimelineDate>
          </TimelineContent>
        </TimelineItem>
        
        <TimelineItem>
          <TimelineIcon><FiHome /></TimelineIcon>
          <TimelineContent>
            <TimelineTitle>Delivered</TimelineTitle>
            <TimelineDate>Estimated 2 hours after dispatch</TimelineDate>
          </TimelineContent>
        </TimelineItem>
      </StatusTimeline>

      <OrderDetails>
        <DetailsSection>
          <DetailsTitle>Shipping Information</DetailsTitle>
          <DetailsList>
            <DetailsItem>
              <strong>Name:</strong> {order.customer_name}
            </DetailsItem>
            <DetailsItem>
              <strong>Email:</strong> {order.customer_email}
            </DetailsItem>
            <DetailsItem>
              <strong>Phone:</strong> {order.customer_phone}
            </DetailsItem>
            <DetailsItem>
              <strong>Address:</strong> {order.delivery_address}, {order.delivery_city}, {order.delivery_state} {order.delivery_postal_code}
            </DetailsItem>
          </DetailsList>
        </DetailsSection>

        <DetailsSection>
          <DetailsTitle>Payment Summary</DetailsTitle>
          <DetailsList>
            <SummaryRow>
              <span>Subtotal</span>
              <span>₦{order.subtotal?.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax</span>
              <span>₦{order.tax?.toFixed(2)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>₦{order.delivery_fee?.toFixed(2)}</span>
            </SummaryRow>
            <Divider />
            <SummaryRow $total>
              <span>Total</span>
              <span>₦{order.total?.toFixed(2)}</span>
            </SummaryRow>
          </DetailsList>
        </DetailsSection>

        <DetailsSection>
          <DetailsTitle>Order Items</DetailsTitle>
          {order.order_items && order.order_items.map((item: any, index: number) => (
            <OrderItem key={index}>
              <ItemImage src={item.product_image_url} alt={item.product_name} />
              <ItemDetails>
                <ItemName>{item.product_name}</ItemName>
                <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
              </ItemDetails>
              <ItemPrice>₦{(item.price * item.quantity).toFixed(2)}</ItemPrice>
            </OrderItem>
          ))}
        </DetailsSection>
      </OrderDetails>

      <ActionButtons>
        <Button onClick={() => navigate('/')}>Continue Shopping</Button>
        <Button onClick={() => navigate('/dashboard/history')} variant="secondary">
          View Order History
        </Button>
      </ActionButtons>
    </Container>
  );
};

export default OrderConfirmation;

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
`;

const LoadingMessage = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.status.error};
  margin-bottom: 2rem;
`;

const SuccessIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 2rem;
  
  svg {
    font-size: 3rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const OrderNumber = styled.div`
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: ${({ theme }) => theme.colors.common.gray[100]};
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 3rem;
`;

const InfoCard = styled.div<{ $success?: boolean, $error?: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin: 2rem 0;
  border-top: 4px solid ${({ $success, $error }) => {
    if ($success) return '#4CAF50';
    if ($error) return '#F44336';
    return '#FFB800';
  }};
`;

const InfoIcon = styled.div<{ $success?: boolean, $error?: boolean }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${({ $success, $error }) => {
    if ($success) return '#4CAF5015';
    if ($error) return '#F4433615';
    return '#FFB80015';
  }};
  color: ${({ $success, $error }) => {
    if ($success) return '#4CAF50';
    if ($error) return '#F44336';
    return '#FFB800';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
`;

const InfoTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const InfoMessage = styled.p`
  color: #636E72;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const InfoDetail = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
`;

const StatusTimeline = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
  text-align: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TimelineItem = styled.div<{ $active?: boolean }>`
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
`;

const TimelineIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.light};
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 0.5rem;
  
  svg {
    font-size: 1.5rem;
  }
`;

const TimelineContent = styled.div``;

const TimelineTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const TimelineDate = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const OrderDetails = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
  margin-bottom: 2rem;
`;

const DetailsSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailsTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
`;

const DetailsList = styled.div``;

const DetailsItem = styled.div`
  margin-bottom: 0.75rem;
  line-height: 1.6;
`;

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: ${({ $total }) => ($total ? '1.25rem' : '1rem')};
  font-weight: ${({ $total }) => ($total ? '700' : '400')};
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border.main};
  margin: 1rem 0;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
`;

const ItemDetails = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const ItemQuantity = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ItemPrice = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 1rem 2rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  background: ${({ variant, theme }) => 
    variant === 'secondary' ? 'transparent' : theme.colors.primary.main};
  color: ${({ variant, theme }) => 
    variant === 'secondary' ? theme.colors.text.primary : 'white'};
  border: ${({ variant, theme }) => 
    variant === 'secondary' ? `2px solid ${theme.colors.border.main}` : 'none'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const WarningCard = styled.div`
  background: #FFF3E0;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin: 2rem 0;
  border-top: 4px solid #FF9800;
`;

const WarningIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #FF980015;
  color: #FF9800;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
`;

const WarningTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const WarningMessage = styled.p`
  color: #636E72;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  line-height: 1.6;
`;

const WarningDetail = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
`;

const DriverInfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin: 2rem 0;
  border-top: 4px solid #4CAF50;
`;

const DriverIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: #4CAF5015;
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
`;

const DriverTitle = styled.h2`
  font-size: 1.5rem;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const DriverDetails = styled.div`
  margin-top: 1rem;
`;

const DriverName = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const DriverPhone = styled.div`
  font-size: 1.1rem;
  color: #636E72;
`;

const ErrorIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #FFEBEE;
  color: #F44336;
  margin-bottom: 2rem;
  
  svg {
    font-size: 3rem;
  }
`;

// Add new styled components for bank transfer details
const BankDetails = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: left;
`;

const BankDetail = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  strong {
    display: inline-block;
    width: 140px;
  }
`;

// Add new styled components for document actions
const DocumentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const DocumentButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #6C9A7F;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5A8470;
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1.25rem;
  }
`;
