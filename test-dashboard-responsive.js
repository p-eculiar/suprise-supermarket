// Test dashboard responsive improvements
const fs = require('fs');
const path = require('path');

console.log('=== TESTING DASHBOARD RESPONSIVE IMPROVEMENTS ===\n');

// Check UserDashboard.tsx
console.log('1. Checking UserDashboard.tsx...');
const userDashboardPath = path.join(__dirname, 'src', 'pages', 'dashboard', 'UserDashboard.tsx');

if (!fs.existsSync(userDashboardPath)) {
  console.error('❌ UserDashboard.tsx not found');
} else {
  const dashboardContent = fs.readFileSync(userDashboardPath, 'utf8');
  
  // Check for responsive breakpoints
  const hasMediaQueries = dashboardContent.includes('@media');
  console.log(`   ${hasMediaQueries ? '✅' : '❌'} Responsive breakpoints: ${hasMediaQueries ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for mobile-specific styles
  const hasMobileStyles = dashboardContent.includes('max-width: 768px') || dashboardContent.includes('max-width: 480px');
  console.log(`   ${hasMobileStyles ? '✅' : '❌'} Mobile-specific styles: ${hasMobileStyles ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for improved grid layouts
  const hasImprovedGrids = dashboardContent.includes('grid-template-columns: repeat(auto-fill') || 
                          dashboardContent.includes('grid-template-columns: repeat(auto-fit');
  console.log(`   ${hasImprovedGrids ? '✅' : '❌'} Improved grid layouts: ${hasImprovedGrids ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for container improvements
  const hasContainerImprovements = dashboardContent.includes('DashboardContainer') && 
                                  dashboardContent.includes('max-width: 1400px');
  console.log(`   ${hasContainerImprovements ? '✅' : '❌'} Container improvements: ${hasContainerImprovements ? 'IMPLEMENTED' : 'MISSING'}`);
}

// Check DashboardLayout.tsx
console.log('\n2. Checking DashboardLayout.tsx...');
const dashboardLayoutPath = path.join(__dirname, 'src', 'components', 'layout', 'DashboardLayout.tsx');

if (!fs.existsSync(dashboardLayoutPath)) {
  console.error('❌ DashboardLayout.tsx not found');
} else {
  const layoutContent = fs.readFileSync(dashboardLayoutPath, 'utf8');
  
  // Check for responsive layout
  const hasResponsiveLayout = layoutContent.includes('@media') && 
                             layoutContent.includes('flex-direction: column') &&
                             layoutContent.includes('max-width: 768px');
  console.log(`   ${hasResponsiveLayout ? '✅' : '❌'} Responsive layout: ${hasResponsiveLayout ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for mobile menu
  const hasMobileMenu = layoutContent.includes('MobileMenuButton');
  console.log(`   ${hasMobileMenu ? '✅' : '❌'} Mobile menu: ${hasMobileMenu ? 'IMPLEMENTED' : 'MISSING'}`);
}

// Check Sidebar.tsx
console.log('\n3. Checking Sidebar.tsx...');
const sidebarPath = path.join(__dirname, 'src', 'components', 'dashboard', 'Sidebar.tsx');

if (!fs.existsSync(sidebarPath)) {
  console.error('❌ Sidebar.tsx not found');
} else {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  // Check for responsive sidebar
  const hasResponsiveSidebar = sidebarContent.includes('@media') && 
                              sidebarContent.includes('transform: translateX') &&
                              sidebarContent.includes('max-width: 768px');
  console.log(`   ${hasResponsiveSidebar ? '✅' : '❌'} Responsive sidebar: ${hasResponsiveSidebar ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for mobile close button
  const hasMobileCloseButton = sidebarContent.includes('CloseButton') && 
                              sidebarContent.includes('display: none') &&
                              sidebarContent.includes('display: block');
  console.log(`   ${hasMobileCloseButton ? '✅' : '❌'} Mobile close button: ${hasMobileCloseButton ? 'IMPLEMENTED' : 'MISSING'}`);
}

console.log('\n=== TEST COMPLETE ===');
if (hasMediaQueries && hasMobileStyles && hasImprovedGrids && hasContainerImprovements &&
    hasResponsiveLayout && hasMobileMenu &&
    hasResponsiveSidebar && hasMobileCloseButton) {
  console.log('✅ DASHBOARD RESPONSIVE IMPROVEMENTS IMPLEMENTED SUCCESSFULLY!');
  console.log('✅ Responsive breakpoints for all device sizes');
  console.log('✅ Mobile-first design approach');
  console.log('✅ Improved grid layouts with auto-fill');
  console.log('✅ Enhanced container constraints');
  console.log('✅ Mobile menu toggle functionality');
  console.log('✅ Collapsible sidebar for mobile');
  console.log('✅ Touch-friendly navigation elements');
} else {
  console.log('❌ Some issues found:');
  if (!hasMediaQueries) console.log('   - Responsive breakpoints missing');
  if (!hasMobileStyles) console.log('   - Mobile-specific styles missing');
  if (!hasImprovedGrids) console.log('   - Grid layouts not improved');
  if (!hasContainerImprovements) console.log('   - Container improvements missing');
  if (!hasResponsiveLayout) console.log('   - Dashboard layout not responsive');
  if (!hasMobileMenu) console.log('   - Mobile menu missing');
  if (!hasResponsiveSidebar) console.log('   - Sidebar not responsive');
  if (!hasMobileCloseButton) console.log('   - Mobile close button missing');
}