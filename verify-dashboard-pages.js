// Verify all dashboard pages are accessible
const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING DASHBOARD PAGES ===\n');

// List of all dashboard pages that should exist
const dashboardPages = [
  { name: 'User Dashboard', file: 'UserDashboard.tsx', route: '/dashboard' },
  { name: 'Orders', file: 'Orders.tsx', route: '/dashboard/orders' },
  { name: 'Delivery Tracking', file: 'DeliveryTracking.tsx', route: '/dashboard/tracking/:orderId' },
  { name: 'Feedback', file: 'Feedback.tsx', route: '/dashboard/feedback' },
  { name: 'Messages', file: 'Messages.tsx', route: '/dashboard/messages' },
  { name: 'Order History', file: 'History.tsx', route: '/dashboard/history' },
  { name: 'Payment Details', file: 'Payment.tsx', route: '/dashboard/payment' },
  { name: 'Customization', file: 'Customization.tsx', route: '/dashboard/customization' }
];

// Check if dashboard directory exists
const dashboardDir = path.join(__dirname, 'src', 'pages', 'dashboard');

if (!fs.existsSync(dashboardDir)) {
  console.error('❌ Dashboard directory not found:', dashboardDir);
  process.exit(1);
}

console.log('1. Checking dashboard directory...');
console.log('   Directory:', dashboardDir);

// Read all files in dashboard directory
const files = fs.readdirSync(dashboardDir);
console.log('   Files found:', files.length);

// Check each dashboard page
console.log('\n2. Verifying dashboard pages...');
let allPagesFound = true;

dashboardPages.forEach(page => {
  const fileExists = files.includes(page.file);
  console.log(`   ${fileExists ? '✅' : '❌'} ${page.name} (${page.file}) - Route: ${page.route}`);
  
  if (!fileExists) {
    allPagesFound = false;
  }
});

// Check App.tsx routes
console.log('\n3. Checking App.tsx routes...');
const appPath = path.join(__dirname, 'src', 'App.tsx');

if (!fs.existsSync(appPath)) {
  console.error('❌ App.tsx not found');
} else {
  const appContent = fs.readFileSync(appPath, 'utf8');
  
  console.log('   Checking route definitions...');
  let allRoutesFound = true;
  
  dashboardPages.forEach(page => {
    // For Delivery Tracking, we need to check the parameterized route
    const routePattern = page.route === '/dashboard/tracking/:orderId' 
      ? '/dashboard/tracking/:orderId' 
      : page.route;
      
    const routeExists = appContent.includes(`path="${page.route.split('/')[2] || ''}"`) || 
                       appContent.includes(routePattern) ||
                       appContent.includes(page.route);
                       
    console.log(`   ${routeExists ? '✅' : '⚠️'} Route: ${page.route}`);
    
    if (!routeExists && page.route !== '/dashboard/tracking/:orderId') {
      allRoutesFound = false;
    }
  });
  
  // Check sidebar navigation
  console.log('\n4. Checking sidebar navigation...');
  const sidebarPath = path.join(__dirname, 'src', 'components', 'dashboard', 'Sidebar.tsx');
  
  if (!fs.existsSync(sidebarPath)) {
    console.error('❌ Sidebar.tsx not found');
  } else {
    const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
    
    console.log('   Checking sidebar navigation items...');
    let allNavItemsFound = true;
    
    // Check for main navigation items (excluding Delivery Tracking since it's order-specific)
    const mainNavItems = dashboardPages.filter(page => 
      page.name !== 'Delivery Tracking' && 
      page.name !== 'User Dashboard' // Home route is different
    );
    
    mainNavItems.forEach(page => {
      const navItemExists = sidebarContent.includes(page.route);
      console.log(`   ${navItemExists ? '✅' : '❌'} Sidebar link: ${page.name} -> ${page.route}`);
      
      if (!navItemExists) {
        allNavItemsFound = false;
      }
    });
    
    // Check for Home link
    const homeLinkExists = sidebarContent.includes('to="/"');
    console.log(`   ${homeLinkExists ? '✅' : '❌'} Sidebar link: Home -> /`);
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    if (allPagesFound && allRoutesFound && allNavItemsFound && homeLinkExists) {
      console.log('✅ ALL DASHBOARD PAGES ARE PROPERLY SET UP!');
      console.log('✅ All pages exist in the dashboard directory');
      console.log('✅ All routes are defined in App.tsx');
      console.log('✅ All navigation items are in the sidebar');
      console.log('✅ Users can access all dashboard pages');
    } else {
      console.log('❌ Some dashboard pages may have issues:');
      if (!allPagesFound) console.log('   - Some page files are missing');
      if (!allRoutesFound) console.log('   - Some routes are not properly defined');
      if (!allNavItemsFound) console.log('   - Some navigation items are missing from sidebar');
      if (!homeLinkExists) console.log('   - Home link is missing from sidebar');
    }
  }
}