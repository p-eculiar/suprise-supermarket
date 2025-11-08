import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { PaystackButton } from 'react-paystack';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { paymentService, OrderData } from '../services/paymentService';
import { documentService, InvoiceData, ReceiptData } from '../services/documentService';
import { inventoryService } from '../services/inventoryService';
import { useSettings } from '../contexts/SettingsContext';
import { ALL_LOCATIONS, findLocation, LocationData } from '../utils/portHarcourtLocations';
import toast from '../components/common/Toast';
import { FaCreditCard, FaTruck, FaCheckCircle, FaSpinner, FaPaypal, FaUniversity, FaMapMarkerAlt, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, formatCurrency } = useSettings();
  const subtotal = getCartTotal();
  const tax = subtotal * (settings.taxRate / 100); // Use settings tax rate instead of hardcoded 0.075
  
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'bank'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sameBillingAddress, setSameBillingAddress] = useState(true);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: 'Rivers',
    zipCode: '',
    country: 'Nigeria',
  });
  
  const [billingInfo, setBillingInfo] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ')[1] || '',
    address: '',
    city: '',
    state: 'Rivers',
    zipCode: '',
    country: 'Nigeria',
    phone: '',
  });
  
  const [bankInfo, setBankInfo] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);

  // Function to calculate shipping based on location
  const calculateShipping = () => {
    // If no address is entered, don't calculate shipping
    if (!shippingInfo.address || !shippingInfo.city) {
      return 0;
    }
    
    // Find matching location
    const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}`;
    const location = findLocation(fullAddress);
    
    if (!location) {
      return settings.shippingFee; // Fallback to default shipping fee
    }
    
    // Check if order qualifies for free shipping
    if (subtotal >= settings.freeShippingThreshold) {
      return 0;
    }
    
    return location.shippingFee;
  };
  
  // Calculate shipping and total when dependencies change
  React.useEffect(() => {
    // Only calculate shipping if we have a complete address
    if (!shippingInfo.address || !shippingInfo.city) {
      setShipping(0);
      setTotal(subtotal + tax);
      return;
    }
    
    // Calculate shipping immediately
    const calculatedShipping = calculateShipping();
    setShipping(calculatedShipping);
    setTotal(subtotal + tax + calculatedShipping);
  }, [shippingInfo.address, shippingInfo.city, subtotal, tax, settings]);

  // Update billing info when sameBillingAddress changes
  React.useEffect(() => {
    if (sameBillingAddress) {
      setBillingInfo({
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        phone: shippingInfo.phone,
      });
    }
  }, [sameBillingAddress, shippingInfo]);

  const handleCreateOrder = async () => {
    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    // Validate required fields
    if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
        !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.state) {
      toast.error('Please fill in all required shipping fields');
      return;
    }
    
    // Validate billing address if different
    if (!sameBillingAddress) {
      if (!billingInfo.firstName || !billingInfo.lastName || !billingInfo.address || 
          !billingInfo.city || !billingInfo.state) {
        toast.error('Please fill in all required billing fields');
        return;
      }
    }
    
    // Validate delivery location (only deliver within Port Harcourt)
    // Only validate if we have a complete address
    if (shippingInfo.address && shippingInfo.city) {
      const fullAddress = `${shippingInfo.address}, ${shippingInfo.city}`;
      const location = findLocation(fullAddress);
      
      if (!location) {
        toast.error('Sorry, we only deliver within Port Harcourt, Rivers State. Please select a valid location.');
        return;
      }
    }

    // For bank transfer, validate bank info
    if (paymentMethod === 'bank' && (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountName)) {
      toast.error('Please fill in all bank transfer details');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate stock availability before processing order
      const stockValidationPromises = cartItems.map(async (item) => {
        const { data: product, error } = await supabase
          .from('products')
          .select('stock, name')
          .eq('id', item.id)
          .single();
        
        if (error) throw error;
        
        if (!product || product.stock < item.quantity) {
          throw new Error(`${item.name} is not available in the requested quantity`);
        }
        
        return { productId: item.id, quantity: item.quantity };
      });

      const stockValidation = await Promise.all(stockValidationPromises);

      // Reserve stock by updating inventory
      for (const validation of stockValidation) {
        const { data: prod } = await supabase
          .from('products')
          .select('stock')
          .eq('id', validation.productId)
          .single();
        const current = prod?.stock ?? 0;
        const newStock = current - validation.quantity;
        await inventoryService.updateProductStock(validation.productId, newStock, 'Order placement');
      }

      // Prepare order data
      const orderData: OrderData = {
        user_id: user.id,
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        delivery_address: shippingInfo.address,
        delivery_city: shippingInfo.city,
        delivery_state: shippingInfo.state,
        delivery_postal_code: shippingInfo.zipCode || '',
        delivery_notes: '',
        subtotal: subtotal,
        tax: tax,
        delivery_fee: shipping,
        discount: 0,
        total: total,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          product_image_url: item.imageUrl,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };

      // Create order using payment service
      const result = await paymentService.createOrder(orderData);
      
      if (!result) {
        throw new Error('Failed to create order');
      }

      setOrderId(result.orderId);
      setOrderNumber(result.orderNumber);
      
      // If bank transfer, update order with bank details
      if (paymentMethod === 'bank') {
        await supabase
          .from('orders')
          .update({
            bank_transfer_details: {
              bank_name: bankInfo.bankName,
              account_number: bankInfo.accountNumber,
              account_name: bankInfo.accountName
            }
          })
          .eq('id', result.orderId);
      }
      
      // Move to payment processing step
      setStep(4);
      
    } catch (error: any) {
      console.error('Order creation failed:', error);
      
      // If stock validation failed, don't show generic error
      if (error.message && error.message.includes('not available')) {
        toast.error(error.message + '. Please update your cart and try again.');
        navigate('/cart');
      } else {
        toast.error(error.message || 'Failed to place order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (reference: any) => {
    if (!orderId) return;
    
    try {
      setIsProcessing(true);
      
      // Update order payment status
      await paymentService.updateOrderPaymentStatus(orderId, 'paid', reference.reference);
      
      // Create payment transaction record
      await paymentService.createPaymentTransaction(
        orderId,
        reference.reference,
        total,
        'success',
        reference.trxref,
        reference
      );
      
      // Generate invoice
      const invoiceData: InvoiceData = {
        order_id: orderId,
        invoice_number: documentService.generateInvoiceNumber(),
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        billing_address: sameBillingAddress 
          ? `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`
          : `${billingInfo.address}, ${billingInfo.city}, ${billingInfo.state}`,
        shipping_address: `${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.state}`,
        items: cartItems.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: subtotal,
        tax: tax,
        delivery_fee: shipping,
        discount: 0,
        total: total,
        payment_method: 'card',
        payment_status: 'paid',
        order_date: new Date().toISOString(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      };
      
      await documentService.createInvoice(invoiceData);
      
      // Generate receipt
      const receiptData: ReceiptData = {
        order_id: orderId,
        receipt_number: documentService.generateReceiptNumber(),
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        items: cartItems.map(item => ({
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity
        })),
        subtotal: subtotal,
        tax: tax,
        delivery_fee: shipping,
        discount: 0,
        total: total,
        payment_method: 'card',
        payment_status: 'paid',
        payment_date: new Date().toISOString(),
        transaction_reference: reference.reference
      };
      
      await documentService.createReceipt(receiptData);
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderId}`);
      
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      toast.error('Payment processed but order confirmation failed. Please contact support with reference: ' + reference.reference);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    toast.info('Payment cancelled. Your order is saved and you can complete payment later.');
  };

  const handleBankTransferPayment = async () => {
    try {
      setIsProcessing(true);
      
      // For bank transfer, we mark the order as pending payment
      await paymentService.updateOrderPaymentStatus(orderId!, 'pending', `BANK_TRANSFER_${Date.now()}`);
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderId}`);
      
    } catch (error: any) {
      console.error('Bank transfer processing failed:', error);
      toast.error('Failed to process bank transfer. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getPaystackConfig = () => {
    if (!orderId) return null;
    
    return {
      reference: `ORDER_${orderId}_${Date.now()}`,
      email: shippingInfo.email,
      amount: Math.round(total * 100), // Paystack expects amount in kobo
      publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_your_key_here',
      currency: 'NGN',
      metadata: {
        custom_fields: [
          {
            display_name: "Order ID",
            variable_name: "order_id",
            value: orderId
          },
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: `${shippingInfo.firstName} ${shippingInfo.lastName}`
          },
          {
            display_name: "Customer Email",
            variable_name: "customer_email",
            value: shippingInfo.email
          }
        ]
      }
    };
  };

  if (cartItems.length === 0) {
    return (
      <CheckoutContainer>
        <EmptyCart>
          <h2>Your cart is empty</h2>
          <p>Add items to your cart to continue shopping</p>
          <button onClick={() => navigate('/products')}>Continue Shopping</button>
        </EmptyCart>
      </CheckoutContainer>
    );
  }

  return (
    <CheckoutContainer>
      <CheckoutHeader>
        <h1>Checkout</h1>
      </CheckoutHeader>
      
      <CheckoutContent>
        <MainSection>
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <Section>
              <SectionTitle>Delivery</SectionTitle>
              
              <Form>
                <FormGroup>
                  <Label>Contact Information</Label>
                  <InputWithIcon>
                    <FaEnvelope />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                    />
                  </InputWithIcon>
                  <CheckboxLabel>
                    <input 
                      type="checkbox" 
                      checked={true}
                      readOnly
                    />
                    Email me with news and offers
                  </CheckboxLabel>
                </FormGroup>
                
                <FormGroup>
                  <Label>Shipping Address</Label>
                  <FormRow>
                    <FormGroup>
                      <InputWithIcon>
                        <FaUser />
                        <Input
                          type="text"
                          placeholder="First name"
                          value={shippingInfo.firstName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                          required
                        />
                      </InputWithIcon>
                    </FormGroup>
                    <FormGroup>
                      <InputWithIcon>
                        <FaUser />
                        <Input
                          type="text"
                          placeholder="Last name"
                          value={shippingInfo.lastName}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                          required
                        />
                      </InputWithIcon>
                    </FormGroup>
                  </FormRow>
                  
                  <InputWithIcon>
                    <FaMapMarkerAlt />
                    <Input
                      type="text"
                      placeholder="Address (e.g., Elekahia, Trans Amadi, GRA)"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                    />
                  </InputWithIcon>
                  <InfoBox>
                    <strong>Delivery Information:</strong>
                    <p>We deliver to specific areas in Port Harcourt. Please enter a recognized area such as Elekahia, Trans Amadi, GRA, Diobu, etc.</p>
                    <p>Enter your specific street address in the Apartment/Suite field below.</p>
                  </InfoBox>
                  
                  <InputWithIcon>
                    <FaMapMarkerAlt />
                    <Input
                      type="text"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                    />
                  </InputWithIcon>
                  
                  <FormRow>
                    <FormGroup>
                      <InputWithIcon>
                        <FaMapMarkerAlt />
                        <Input
                          type="text"
                          placeholder="City"
                          value={shippingInfo.city}
                          onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                          required
                        />
                      </InputWithIcon>
                    </FormGroup>
                    <FormGroup>
                      <select
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #DFE6E9' }}
                        disabled
                      >
                        <option value="Rivers">Rivers</option>
                      </select>
                    </FormGroup>
                  </FormRow>
                  
                  <InputWithIcon>
                    <FaPhone />
                    <Input
                      type="tel"
                      placeholder="Phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </InputWithIcon>
                  
                  <InfoBox>
                    <strong>Delivery Information:</strong>
                    <p>We only deliver within Port Harcourt, Rivers State. Shipping fees are calculated based on your distance from our supermarket at 6 Farm Road, Off Ada George, Port Harcourt.</p>
                  </InfoBox>
                </FormGroup>
                
                <ButtonGroup>
                  <Button onClick={() => navigate('/cart')} variant="secondary">← Return to cart</Button>
                  <Button 
                    onClick={() => {
                      // Validate required fields before proceeding
                      if (!shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.email || 
                          !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city || 
                          !shippingInfo.state) {
                        toast.error('Please fill in all required fields');
                        return;
                      }
                      setStep(2);
                    }}
                  >
                    Continue to payment
                  </Button>
                </ButtonGroup>
              </Form>
            </Section>
          )}
          
          {/* Step 2: Payment Method */}
          {step === 2 && (
            <Section>
              <SectionTitle>Payment</SectionTitle>
              
              <PaymentMethodsSection>
                <PaymentMethodsTitle>Payment method</PaymentMethodsTitle>
                <PaymentOptions>
                  <PaymentOption
                    $active={paymentMethod === 'card'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <FaCreditCard />
                    <span>Paystack</span>
                    <PaymentIcons>
                      <PaymentIcon>master</PaymentIcon>
                      <PaymentIcon>visa</PaymentIcon>
                      <PaymentIcon>airtel</PaymentIcon>
                      <PaymentIcon>mpesa</PaymentIcon>
                    </PaymentIcons>
                  </PaymentOption>
                  <PaymentOption
                    $active={paymentMethod === 'bank'}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <FaUniversity />
                    <span>Bank Transfer</span>
                  </PaymentOption>
                </PaymentOptions>
                
                <SecurePaymentNote>
                  <p>All transactions are secure and encrypted.</p>
                </SecurePaymentNote>
              </PaymentMethodsSection>
              
              <BillingSection>
                <BillingTitle>Billing address</BillingTitle>
                <RadioGroup>
                  <RadioLabel>
                    <input 
                      type="radio" 
                      name="billingAddress" 
                      checked={sameBillingAddress}
                      onChange={() => setSameBillingAddress(true)}
                    />
                    Same as shipping address
                  </RadioLabel>
                  <RadioLabel>
                    <input 
                      type="radio" 
                      name="billingAddress" 
                      checked={!sameBillingAddress}
                      onChange={() => setSameBillingAddress(false)}
                    />
                    Use a different billing address
                  </RadioLabel>
                </RadioGroup>
                
                {!sameBillingAddress && (
                  <Form>
                    <FormRow>
                      <FormGroup>
                        <InputWithIcon>
                          <FaUser />
                          <Input
                            type="text"
                            placeholder="First name"
                            value={billingInfo.firstName}
                            onChange={(e) => setBillingInfo({ ...billingInfo, firstName: e.target.value })}
                            required
                          />
                        </InputWithIcon>
                      </FormGroup>
                      <FormGroup>
                        <InputWithIcon>
                          <FaUser />
                          <Input
                            type="text"
                            placeholder="Last name"
                            value={billingInfo.lastName}
                            onChange={(e) => setBillingInfo({ ...billingInfo, lastName: e.target.value })}
                            required
                          />
                        </InputWithIcon>
                      </FormGroup>
                    </FormRow>
                    
                    <InputWithIcon>
                      <FaMapMarkerAlt />
                      <Input
                        type="text"
                        placeholder="Address"
                        value={billingInfo.address}
                        onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                        required
                      />
                    </InputWithIcon>
                    
                    <FormRow>
                      <FormGroup>
                        <InputWithIcon>
                          <FaMapMarkerAlt />
                          <Input
                            type="text"
                            placeholder="City"
                            value={billingInfo.city}
                            onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                            required
                          />
                        </InputWithIcon>
                      </FormGroup>
                      <FormGroup>
                        <select
                          value={billingInfo.state}
                          onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                          style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #DFE6E9' }}
                          disabled
                        >
                          <option value="Rivers">Rivers</option>
                        </select>
                      </FormGroup>
                    </FormRow>
                    
                    <InputWithIcon>
                      <FaPhone />
                      <Input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={billingInfo.phone}
                        onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                      />
                    </InputWithIcon>
                  </Form>
                )}
              </BillingSection>
              
              <ButtonGroup>
                <Button onClick={() => setStep(1)} variant="secondary">← Return to information</Button>
                <Button onClick={() => setStep(3)}>Continue to review</Button>
              </ButtonGroup>
            </Section>
          )}
          
          {/* Step 3: Review Order */}
          {step === 3 && (
            <Section>
              <SectionTitle>Review your order</SectionTitle>
              
              <ReviewSection>
                <ReviewSubtitle>Contact</ReviewSubtitle>
                <ReviewInfo>
                  <p>{shippingInfo.email}</p>
                  <ChangeLink onClick={() => setStep(1)}>Change</ChangeLink>
                </ReviewInfo>
              </ReviewSection>
              
              <ReviewSection>
                <ReviewSubtitle>Ship to</ReviewSubtitle>
                <ReviewInfo>
                  <p>
                    {shippingInfo.firstName} {shippingInfo.lastName}<br />
                    {shippingInfo.address}<br />
                    {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}<br />
                    {shippingInfo.country}<br />
                    {shippingInfo.phone}
                  </p>
                  <ChangeLink onClick={() => setStep(1)}>Change</ChangeLink>
                </ReviewInfo>
              </ReviewSection>
              
              <ReviewSection>
                <ReviewSubtitle>Payment method</ReviewSubtitle>
                <ReviewInfo>
                  <p>
                    {paymentMethod === 'card' ? 'Credit Card' : 
                     paymentMethod === 'bank' ? 'Bank Transfer' : 'PayPal'}
                  </p>
                  <ChangeLink onClick={() => setStep(2)}>Change</ChangeLink>
                </ReviewInfo>
              </ReviewSection>
              
              <ReviewSection>
                <ReviewSubtitle>Billing address</ReviewSubtitle>
                <ReviewInfo>
                  {sameBillingAddress ? (
                    <p>
                      Same as shipping address
                    </p>
                  ) : (
                    <p>
                      {billingInfo.firstName} {billingInfo.lastName}<br />
                      {billingInfo.address}<br />
                      {billingInfo.city}, {billingInfo.state} {billingInfo.zipCode}<br />
                      {billingInfo.country}<br />
                      {billingInfo.phone}
                    </p>
                  )}
                  <ChangeLink onClick={() => setStep(2)}>Change</ChangeLink>
                </ReviewInfo>
              </ReviewSection>
              
              <ButtonGroup>
                <Button onClick={() => setStep(2)} variant="secondary">← Return to payment</Button>
                <Button onClick={handleCreateOrder} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Pay now'}
                </Button>
              </ButtonGroup>
            </Section>
          )}
          
          {/* Step 4: Payment Processing */}
          {step === 4 && (
            <Section>
              <SectionTitle>Complete Your Payment</SectionTitle>
              
              {isProcessing && (
                <ProcessingMessage>
                  <FaSpinner className="spinner" />
                  <p>Processing your payment...</p>
                </ProcessingMessage>
              )}
              
              <PaymentSummary>
                <h3>Order Summary</h3>
                <p>Order Number: {orderNumber}</p>
                <SummaryRow>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Tax (7.5%):</span>
                  <span>{formatCurrency(tax)}</span>
                </SummaryRow>
                <SummaryRow>
                  <span>Shipping:</span>
                  <span>
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </span>
                </SummaryRow>
                {shipping > 0 && (
                  <InfoBox>
                    <p>Shipping fee calculated based on distance from our Port Harcourt location</p>
                  </InfoBox>
                )}
                <SummaryRow>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(total)}</span>
                </SummaryRow>
              </PaymentSummary>
              
              <PaymentOptions>
                {paymentMethod === 'card' && orderId && (
                  <PaystackButton
                    reference={getPaystackConfig()!.reference}
                    email={getPaystackConfig()!.email}
                    amount={getPaystackConfig()!.amount}
                    publicKey={getPaystackConfig()!.publicKey}
                    currency={getPaystackConfig()!.currency}
                    metadata={getPaystackConfig()!.metadata}
                    onSuccess={handlePaymentSuccess}
                    onClose={handlePaymentClose}
                    className="paystack-button"
                  >
                    Pay with Paystack
                  </PaystackButton>
                )}
                
                {paymentMethod === 'bank' && (
                  <Button onClick={handleBankTransferPayment} disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Confirm Bank Transfer'}
                  </Button>
                )}
              </PaymentOptions>
              
              <ButtonGroup>
                <Button onClick={() => setStep(3)} variant="secondary" disabled={isProcessing}>
                  Back to Review
                </Button>
              </ButtonGroup>
            </Section>
          )}
        </MainSection>
        
        {/* Order Summary Sidebar */}
        <Sidebar>
          <SummaryCard>
            <SummaryTitle>Order summary</SummaryTitle>
            <OrderItems>
              {cartItems.map((item) => (
                <OrderItem key={item.id}>
                  <ItemImage src={item.imageUrl} alt={item.name} />
                  <ItemDetails>
                    <ItemName>{item.name}</ItemName>
                    <ItemQuantity>Quantity: {item.quantity}</ItemQuantity>
                  </ItemDetails>
                  <ItemPrice>{formatCurrency(item.price * item.quantity)}</ItemPrice>
                </OrderItem>
              ))}
            </OrderItems>
            
            <SummaryRow>
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Tax (7.5%)</span>
              <span>{formatCurrency(tax)}</span>
            </SummaryRow>
            <SummaryRow>
              <span>Shipping</span>
              <span>
                {shipping === 0 ? (
                  shippingInfo.city && shippingInfo.address ? 'Free' : 'Enter address to calculate'
                ) : (
                  `${formatCurrency(shipping)}`
                )}
              </span>
            </SummaryRow>
            {shipping > 0 && (
              <InfoBox>
                <p>Calculated based on distance from our Port Harcourt location</p>
              </InfoBox>
            )}
            <Divider />
            <SummaryRow $total>
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </SummaryRow>
          </SummaryCard>
        </Sidebar>
      </CheckoutContent>
    </CheckoutContainer>
  );
};

export default Checkout;

// Styled Components
const CheckoutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const CheckoutHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #2D3436;
    margin: 0;
  }
`;

const CheckoutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  
  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const MainSection = styled.div`
  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 1.5rem;
  }
`;

const Section = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #DFE6E9;
  padding-bottom: 0.75rem;
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
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 0.875rem;
  color: #2D3436;
`;

const InputWithIcon = styled.div`
  position: relative;
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #636E72;
    font-size: 1rem;
  }
  
  input {
    padding-left: 2.5rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #DFE6E9;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #B8E803;
    box-shadow: 0 0 0 2px rgba(184, 232, 3, 0.2);
  }
  
  &::placeholder {
    color: #9CA3AF;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #636E72;
  cursor: pointer;
  
  input {
    margin: 0;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9375rem;
  color: #2D3436;
  cursor: pointer;
  
  input {
    margin: 0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  background: ${({ variant, theme }) => 
    variant === 'secondary' ? 'transparent' : '#6C9A7F'};
  color: ${({ variant, theme }) => 
    variant === 'secondary' ? '#2D3436' : 'white'};
  border: ${({ variant, theme }) => 
    variant === 'secondary' ? '2px solid #DFE6E9' : 'none'};
  
  &:hover {
    background: ${({ variant, theme }) => 
      variant === 'secondary' ? '#F5F7FA' : '#5A8569'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const PaymentMethodsSection = styled.div`
  margin-bottom: 2rem;
`;

const PaymentMethodsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .paystack-button {
    padding: 1rem;
    background: #B8E803;
    color: #1A1A1A;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    
    &:hover {
      background: #A7D600;
      transform: translateY(-2px);
    }
  }
`;

const PaymentOption = styled.div<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid ${({ $active, theme }) => 
    $active ? '#B8E803' : '#DFE6E9'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${({ $active, theme }) => 
    $active ? 'rgba(184, 232, 3, 0.05)' : 'white'};
  
  svg {
    font-size: 1.25rem;
    color: ${({ $active, theme }) => 
      $active ? '#B8E803' : '#636E72'};
  }
  
  span {
    font-weight: 500;
    color: #2D3436;
  }
  
  &:hover {
    border-color: #B8E803;
  }
`;

const PaymentIcons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
`;

const PaymentIcon = styled.span`
  padding: 0.25rem 0.5rem;
  background: #F5F7FA;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #636E72;
  text-transform: uppercase;
`;

const SecurePaymentNote = styled.div`
  background: #F5F7FA;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  
  p {
    margin: 0;
    font-size: 0.875rem;
    color: #636E72;
  }
`;

const BillingSection = styled.div`
  margin-bottom: 2rem;
`;

const BillingTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 1rem;
`;

const ReviewSection = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #DFE6E9;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const ReviewSubtitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2D3436;
  margin-bottom: 0.5rem;
`;

const ReviewInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  p {
    margin: 0;
    color: #636E72;
    line-height: 1.5;
  }
`;

const ChangeLink = styled.button`
  background: none;
  border: none;
  color: #B8E803;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProcessingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  
  .spinner {
    font-size: 2rem;
    color: #B8E803;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0;
    font-size: 1.125rem;
    color: #2D3436;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const PaymentSummary = styled.div`
  background: #F5F7FA;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  
  h3 {
    font-size: 1.25rem;
    color: #2D3436;
    margin: 0 0 1rem 0;
  }
  
  p {
    color: #636E72;
    margin: 0 0 1rem 0;
  }
`;

const Sidebar = styled.div`
  @media (max-width: 968px) {
    order: -1;
  }
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 1rem;
  
  @media (max-width: 968px) {
    margin-bottom: 1.5rem;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #2D3436;
  margin: 0 0 1.5rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #DFE6E9;
`;

const OrderItems = styled.div`
  margin-bottom: 1.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #DFE6E9;
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  
  &:first-child {
    padding-top: 0;
  }
`;

const ItemImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  background: #F5F7FA;
`;

const ItemDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 0.25rem;
`;

const ItemQuantity = styled.div`
  font-size: 0.875rem;
  color: #636E72;
`;

const ItemPrice = styled.div`
  font-weight: 600;
  color: #2D3436;
  display: flex;
  align-items: center;
`;

const SummaryRow = styled.div<{ $total?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: ${({ $total }) => ($total ? '1.125rem' : '0.9375rem')};
  font-weight: ${({ $total }) => ($total ? '600' : '400')};
  color: ${({ $total }) => ($total ? '#2D3436' : '#636E72')};
  
  &:last-child {
    border-top: 1px solid #DFE6E9;
    margin-top: 0.5rem;
    padding-top: 1rem;
  }
  
  span:last-child {
    font-weight: ${({ $total }) => ($total ? '600' : '500')};
    color: ${({ $total }) => ($total ? '#2D3436' : '#2D3436')};
  }
`;

const Divider = styled.div`
  height: 1px;
  background: #DFE6E9;
  margin: 1rem 0;
`;

const InfoBox = styled.div`
  background: #F5F7FA;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.875rem;
  
  p {
    margin: 0;
    color: #636E72;
    line-height: 1.5;
  }
  
  strong {
    color: #2D3436;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  h2 {
    font-size: 1.5rem;
    color: #2D3436;
    margin-bottom: 1rem;
  }
  
  p {
    color: #636E72;
    margin-bottom: 2rem;
  }
  
  button {
    padding: 1rem 2rem;
    background: #B8E803;
    color: #1A1A1A;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background: #A7D600;
      transform: translateY(-2px);
    }
  }
`;