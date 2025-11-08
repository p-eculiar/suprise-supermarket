# Suprise Supermarket - Admin Dashboard Documentation

## Overview
The admin dashboard provides comprehensive management and analytics tools for the Suprise Supermarket platform.

## Features

### 1. Dashboard Overview
- Real-time statistics (revenue, orders, users, products)
- Platform fee tracking (2.5% commission on all transactions)
- Recent orders display
- Top-selling products
- Quick action cards

### 2. Products Management
- **Add/Edit/Delete Products**
  - Product information (name, description, category, price)
  - Multiple image uploads
  - Stock management
  - SKU tracking
  - Product status (active, draft, archived)
  - Compare at price for discounts
  
- **Features:**
  - Search and filter products
  - Category-based filtering
  - Stock level indicators
  - Bulk actions

### 3. Orders Management
- View all orders with detailed information
- Filter by status (pending, processing, completed, cancelled)
- Track platform fees per order
- Update order status
- View order items and customer details
- Export orders for reporting

### 4. Users Management
- View all registered users
- User roles: Customer, Vendor, Admin
- User status management (active, inactive, banned)
- Track user activity and spending
- Send emails to users
- View user order history

### 5. Nigeria State Analytics ⭐ (Key Feature)
This is the most important feature that analyzes supermarket purchasing patterns across Nigeria.

**What it does:**
- Tracks top products purchased by supermarket owners in each Nigerian state
- Compares purchasing trends across all 36 states + FCT
- Identifies the highest-performing products nationally
- Shows market share by state
- Displays average prices and purchase volumes
- Provides growth rate analytics

**Data Points:**
- State name
- Top product in each state
- Total purchases
- Average price
- Market share percentage
- Number of supermarkets per state
- Growth trend

**Recommendations:**
- The system automatically recommends products that have:
  - Highest total sales across multiple states
  - Best growth rates
  - Highest profit margins
  - Wide geographical distribution

**Use Cases:**
- Supermarket owners can see what other stores are buying
- Identify trending products before they become mainstream
- State-specific product preferences
- Regional demand patterns
- Optimize inventory based on successful competitors

### 6. Platform Settings
- **Revenue Configuration:**
  - Platform fee percentage (default: 2.5%)
  - Tax rate settings
  
- **Order Configuration:**
  - Minimum order amount
  - Shipping fees
  - Free shipping threshold
  
- **General Settings:**
  - Site name
  - Support email
  - Currency selection
  - Timezone configuration
  
- **Email Settings:**
  - Notification preferences
  - Email templates configuration

## Revenue Model

The platform generates revenue through:

1. **Transaction Fees (2.5%)**: Commission on every order
2. **Subscription Plans** (Future): Premium features for vendors
3. **Featured Listings** (Future): Promoted product placements
4. **Advertising** (Future): Sponsored brand slots
5. **Data Insights** (Future): Premium analytics for supermarket owners

## Database Structure

### Supabase Tables:
- `users` - User accounts and profiles
- `products` - Product catalog
- `orders` - Order transactions
- `order_items` - Individual items in orders
- `nigeria_state_analytics` - State-by-state purchasing data
- `product_recommendations` - AI-generated product recommendations
- `platform_settings` - System configuration

## Setup Instructions

### 1. Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Run the SQL schema from `/supabase/schema.sql`
3. Create a storage bucket named `product-images`
4. Copy your project URL and anon key

### 2. Environment Variables

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Initial Admin User

After running the schema, create an admin user manually in Supabase:

1. Go to Authentication > Users
2. Add a new user with email/password
3. Update the `users` table to set `role = 'admin'`

### 4. Seed Data

The schema automatically inserts:
- Sample Nigerian state analytics data
- Product recommendations
- Default platform settings

## External APIs Integration

### Nigeria Market Data (Future Enhancement)

To get real-time market data, integrate with:
- **Nigeria Bureau of Statistics API** - Official economic data
- **Market Price APIs** - Real-time product pricing
- **Retail Analytics Providers** - Industry insights

Example integration points:
```typescript
// Update state analytics with real data
async function syncNigeriaData() {
  const response = await fetch('https://api.nigeriamarketdata.com/v1/analytics');
  const data = await response.json();
  
  await supabase
    .from('nigeria_state_analytics')
    .upsert(data.states);
}
```

## Admin Access

**URL:** `/admin`

**Default Credentials** (after manual setup):
- Email: admin@suprisesuper.com
- Password: (set during user creation)

## Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access policies
- JWT authentication
- Secure file uploads
- Input validation
- XSS protection

## Performance Optimization

- Lazy loading of admin pages
- Paginated data tables
- Efficient database queries with indexes
- Image optimization
- Caching strategies

## Analytics Dashboard Metrics

### Key Performance Indicators (KPIs):
- Total Revenue
- Platform Fees Collected
- Order Conversion Rate
- Average Order Value
- User Growth Rate
- Product Performance
- State-wise Market Share
- Top Performing Products

## API Endpoints (Supabase Functions)

The platform uses Supabase for backend:
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL
- Storage: Supabase Storage
- Real-time: Supabase Realtime subscriptions

## Future Enhancements

1. **AI-Powered Recommendations:**
   - Machine learning for product recommendations
   - Predictive analytics for inventory
   - Demand forecasting

2. **Advanced Analytics:**
   - Customer segmentation
   - Cohort analysis
   - Revenue forecasting
   - Market trend predictions

3. **Supplier Integration:**
   - Direct supplier connections
   - Automated ordering
   - Price negotiations
   - Bulk purchase discounts

4. **Mobile App:**
   - React Native admin app
   - Push notifications
   - Offline mode

## Support

For technical support or questions:
- Email: dev@suprisesuper.com
- Documentation: /docs
- GitHub Issues: [project-repo]/issues

## License

Proprietary - All rights reserved
