# Category Diagnostic Tools

This document explains how to use the diagnostic tools to understand your category and product data.

## SQL Diagnostic Script

The `diagnose-categories.sql` file contains SQL queries to run directly in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `diagnose-categories.sql`
4. Run each query to see what's in your database

## Node.js Diagnostic Script

The `run-diagnostic.js` file is a Node.js script that connects directly to your Supabase database:

### Setup:
1. Make sure you have Node.js installed
2. Edit the file to add your Supabase credentials, or set environment variables:
   ```bash
   export SUPABASE_URL="your-supabase-url"
   export SUPABASE_KEY="your-supabase-anon-key"
   ```
3. Run the script:
   ```bash
   node run-diagnostic.js
   ```

## What the Diagnostic Checks:

1. **Categories Table**: Shows what's in your categories table
2. **Product Categories**: Shows what categories actually exist in your products
3. **Uncategorized Products**: Shows products that don't have categories assigned
4. **Product Statistics**: Overall counts of products, categorized/uncategorized, active/inactive
5. **Duplicate Categories**: Checks for case sensitivity issues in category names

## Interpreting Results:

- If you see "products_without_category: 6" in your results, that means you have 6 products that don't have categories assigned
- The category loading fixes we implemented will now properly handle this scenario by:
  1. First trying to use the categories table
  2. Falling back to actual product categories if the categories table is empty or has issues
  3. Filtering out categories that don't have any products
  4. Only showing actual product categories instead of default fallback categories

## Next Steps:

1. Run the diagnostic to see what's actually in your database
2. If you have products without categories, you may want to assign categories to them
3. The website should now properly display your actual product categories instead of the default fallbacks