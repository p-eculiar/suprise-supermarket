# User Dashboard Pages Access Summary

This document summarizes all user dashboard pages and how users can access them.

## Available Dashboard Pages

### 1. Dashboard Home (`/dashboard`)
- **File**: `UserDashboard.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: Main dashboard overview with featured products, categories, and recent orders

### 2. Food Orders (`/dashboard/orders`)
- **File**: `Orders.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: View and manage current orders
- **Features**:
  - Order list with status indicators
  - Filter by order status
  - Track delivery for processing/shipped orders
  - View order details

### 3. Delivery Tracking (`/dashboard/tracking/:orderId`)
- **File**: `DeliveryTracking.tsx`
- **Access**: From individual orders (Track Delivery button)
- **Purpose**: Real-time delivery tracking for specific orders
- **Features**:
  - Driver information and contact
  - Estimated delivery time
  - Live location tracking
  - Order status updates

### 4. Feedback (`/dashboard/feedback`)
- **File**: `Feedback.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: Submit product/service feedback and reviews
- **Features**:
  - Rating system (1-5 stars)
  - Category selection
  - Detailed feedback form
  - Feedback history

### 5. Messages (`/dashboard/messages`)
- **File**: `Messages.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: Communicate with customer support
- **Features**:
  - Message subject and content
  - Message history
  - Admin responses
  - Status tracking (open, resolved, etc.)

### 6. Order History (`/dashboard/history`)
- **File**: `History.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: View past order history
- **Features**:
  - Complete order history
  - Order details and receipts
  - Reorder functionality
  - Filter by date range

### 7. Payment Details (`/dashboard/payment`)
- **File**: `Payment.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: View payment history and methods
- **Features**:
  - Payment transaction history
  - Payment method management
  - Receipt downloads
  - Refund requests

### 8. Customization (`/dashboard/customization`)
- **File**: `Customization.tsx`
- **Access**: Direct link in sidebar
- **Purpose**: Manage profile and preferences
- **Features**:
  - Profile information editing
  - Notification preferences
  - Address management
  - Account settings

## Navigation Structure

### Sidebar Navigation
The main navigation is available through the sidebar on the left side of the dashboard:

1. **Home** - Return to main website
2. **Dashboard** - Main dashboard overview
3. **Food Order** - Current orders management
4. **Feedback** - Submit feedback and reviews
5. **Message** - Customer support communication
6. **Order History** - Past order records
7. **Payment Details** - Payment history and methods
8. **Customization** - Profile and preferences

### Contextual Navigation
Some pages are accessed contextually:

- **Delivery Tracking** - Accessed from individual orders via "Track Delivery" button

## Access Methods

### Direct URL Access
Users can directly access any dashboard page by navigating to its URL:
- `https://yoursite.com/dashboard` - Main dashboard
- `https://yoursite.com/dashboard/orders` - Orders page
- `https://yoursite.com/dashboard/feedback` - Feedback page
- etc.

### Sidebar Navigation
All main dashboard pages are accessible through the sidebar navigation for easy access.

### In-Page Navigation
Some functionality is accessed through buttons and links within pages:
- Delivery tracking is accessed from the Orders page
- Order details are viewed through the Orders page
- Payment receipts are accessed from the Payment Details page

## User Experience

### Seamless Navigation
- All dashboard pages are interconnected
- Consistent design and layout across all pages
- Breadcrumb navigation where appropriate
- Mobile-responsive design

### Real-time Updates
- Order status changes update in real-time
- Delivery tracking updates automatically
- Messages show new responses immediately
- Payment status reflects current information

### Data Persistence
- All user data is stored in the database
- Information persists between sessions
- History is maintained for future reference
- Settings are saved per user account