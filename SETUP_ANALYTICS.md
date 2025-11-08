# Nigeria Analytics Tables Setup

This document explains how to set up the required analytics tables for the Nigeria Market Analytics dashboard.

## Prerequisites

Before setting up the analytics tables, ensure you have:

1. A Supabase project set up
2. The database URL and service role key
3. Access to the Supabase SQL Editor

## Setup Instructions

### Method 1: Using the Supabase SQL Editor (Recommended)

1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `CREATE_ANALYTICS_TABLES.sql` into the editor
4. Click "Run" to execute the script

This will:
- Create the `nigeria_state_analytics` table
- Create the `product_recommendations` table
- Add sample data to both tables
- Set up proper Row Level Security (RLS) policies
- Configure triggers for automatic timestamp updates

### Method 2: Using the Admin Dashboard

If you're running the application and see the "Analytics Tables Not Found" message:

1. Navigate to the Nigeria Analytics page in the admin dashboard
2. Click the "Create Analytics Tables" button
3. Wait for the tables to be created and populated with sample data

## Table Structures

### nigeria_state_analytics

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| state | TEXT | Nigerian state name |
| top_product | TEXT | Top selling product in the state |
| total_purchases | INTEGER | Total number of purchases |
| average_price | DECIMAL(10,2) | Average product price |
| trend | TEXT | Market trend (+/- percentage) |
| market_share | DECIMAL(5,2) | Percentage of total market share |
| supermarkets_count | INTEGER | Number of supermarkets |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record last update timestamp |

### product_recommendations

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Unique identifier |
| product_name | TEXT | Name of the product |
| average_price | DECIMAL(10,2) | Average selling price |
| total_sales | INTEGER | Total units sold |
| top_states | TEXT[] | Array of states where product is popular |
| growth_rate | DECIMAL(5,2) | Sales growth rate percentage |
| profit_margin | DECIMAL(5,2) | Profit margin percentage |
| created_at | TIMESTAMP | Record creation timestamp |

## Troubleshooting

### "Could not find the table" Error

If you see this error, it means the tables haven't been created yet. Follow the setup instructions above.

### RLS Policy Issues

If you're unable to access the data, ensure that:
1. You're logged in as an admin user
2. Your user profile has the role set to 'admin'
3. The RLS policies are correctly applied

### Sample Data Not Appearing

If the tables are created but no data appears:
1. Check that the INSERT statements in the SQL script executed successfully
2. Verify that there are no constraint violations
3. Try manually inserting sample data through the Supabase Table Editor

## Customization

You can customize the analytics data by:

1. Adding more states to the `nigeria_state_analytics` table
2. Updating product recommendations based on actual sales data
3. Modifying the sample data to match your business requirements

To add more data, use the Supabase Table Editor or execute INSERT statements in the SQL Editor.