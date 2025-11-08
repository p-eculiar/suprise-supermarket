import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Checkout from '../pages/Checkout';
// DiasporaCheckout import removed as per user request

// Mock the PaystackButton component
jest.mock('react-paystack', () => ({
  PaystackButton: ({ children, ...props }: any) => (
    <button {...props} data-testid="paystack-button">
      {children}
    </button>
  )
}));

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn().mockReturnThis(),
    rpc: jest.fn().mockResolvedValue({ data: 'ORDER-001', error: null })
  }
}));

// Mock contexts
jest.mock('../contexts/CartContext', () => ({
  useCart: () => ({
    cartItems: [],
    getCartTotal: () => 0,
    clearCart: jest.fn()
  })
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123', email: 'test@example.com' }
  })
}));

jest.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: { taxRate: 7.5, freeShippingThreshold: 5000, shippingFee: 1000 },
    formatCurrency: (amount: number) => `₦${amount.toFixed(2)}`
  })
}));

// Mock services
jest.mock('../services/paymentService', () => ({
  paymentService: {
    createOrder: jest.fn().mockResolvedValue({ orderId: 'order-123', orderNumber: 'ORDER-001' }),
    updateOrderPaymentStatus: jest.fn().mockResolvedValue(true),
    createPaymentTransaction: jest.fn().mockResolvedValue(true)
  }
}));

jest.mock('../services/documentService', () => ({
  documentService: {
    generateInvoiceNumber: () => 'INV-001',
    generateReceiptNumber: () => 'REC-001',
    createInvoice: jest.fn().mockResolvedValue(true),
    createReceipt: jest.fn().mockResolvedValue(true)
  }
}));

jest.mock('../services/inventoryService', () => ({
  inventoryService: {
    updateProductStock: jest.fn().mockResolvedValue(true)
  }
}));

// Mock utils
jest.mock('../utils/shippingCalculator', () => ({
  calculateShippingFee: () => 1000,
  isDeliveryAvailable: () => true,
  getCoordinatesForArea: () => ({ latitude: 4.8, longitude: 7.0 })
}));

// Mock toast
jest.mock('../components/common/Toast', () => ({
  __esModule: true,
  default: () => null
}));

describe('Checkout Integration Tests', () => {
  test('renders normal checkout page', () => {
    render(
      <BrowserRouter>
        <Checkout />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Checkout')).toBeInTheDocument();
  });

// Diaspora checkout test removed as per user request
});