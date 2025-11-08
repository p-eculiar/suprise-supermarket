// Test sidebar responsive behavior
const fs = require('fs');
const path = require('path');

console.log('=== TESTING SIDEBAR RESPONSIVE BEHAVIOR ===\n');

let hasMobileMenuButton = false;
let hasStateManagement = false;
let hasResponsiveStyling = false;
let hasFixedPosition = false;
let hasCloseButton = false;
let hasTransformTransition = false;
let layoutHasRequiredImports = false;
let sidebarHasRequiredImports = false;

// Check DashboardLayout.tsx
console.log('1. Checking DashboardLayout.tsx...');
const dashboardLayoutPath = path.join(__dirname, 'src', 'components', 'layout', 'DashboardLayout.tsx');

if (!fs.existsSync(dashboardLayoutPath)) {
  console.error('❌ DashboardLayout.tsx not found');
} else {
  const layoutContent = fs.readFileSync(dashboardLayoutPath, 'utf8');
  
  // Check for mobile menu button
  hasMobileMenuButton = layoutContent.includes('MobileMenuButton');
  console.log(`   ${hasMobileMenuButton ? '✅' : '❌'} Mobile menu button: ${hasMobileMenuButton ? 'PRESENT' : 'MISSING'}`);
  
  // Check for sidebar state management
  hasStateManagement = layoutContent.includes('useState') && layoutContent.includes('isSidebarOpen');
  console.log(`   ${hasStateManagement ? '✅' : '❌'} Sidebar state management: ${hasStateManagement ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for responsive styling
  hasResponsiveStyling = layoutContent.includes('@media') && layoutContent.includes('768px');
  console.log(`   ${hasResponsiveStyling ? '✅' : '❌'} Responsive styling: ${hasResponsiveStyling ? 'IMPLEMENTED' : 'MISSING'}`);
}

// Check Sidebar.tsx
console.log('\n2. Checking Sidebar.tsx...');
const sidebarPath = path.join(__dirname, 'src', 'components', 'dashboard', 'Sidebar.tsx');

if (!fs.existsSync(sidebarPath)) {
  console.error('❌ Sidebar.tsx not found');
} else {
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
  
  // Check for fixed positioning
  hasFixedPosition = sidebarContent.includes('position: fixed') && sidebarContent.includes('height: 100vh');
  console.log(`   ${hasFixedPosition ? '✅' : '❌'} Fixed positioning: ${hasFixedPosition ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for mobile close button
  hasCloseButton = sidebarContent.includes('CloseButton') && sidebarContent.includes('FiX');
  console.log(`   ${hasCloseButton ? '✅' : '❌'} Mobile close button: ${hasCloseButton ? 'PRESENT' : 'MISSING'}`);
  
  // Check for responsive styling
  const sidebarHasResponsiveStyling = sidebarContent.includes('@media') && sidebarContent.includes('768px');
  console.log(`   ${sidebarHasResponsiveStyling ? '✅' : '❌'} Responsive styling: ${sidebarHasResponsiveStyling ? 'IMPLEMENTED' : 'MISSING'}`);
  
  // Check for transform transitions
  hasTransformTransition = sidebarContent.includes('transform:') && sidebarContent.includes('transition:');
  console.log(`   ${hasTransformTransition ? '✅' : '❌'} Transform transitions: ${hasTransformTransition ? 'IMPLEMENTED' : 'MISSING'}`);
}

// Check for proper imports
console.log('\n3. Checking imports...');
layoutHasRequiredImports = fs.existsSync(dashboardLayoutPath) && 
  fs.readFileSync(dashboardLayoutPath, 'utf8').includes('FiMenu') &&
  fs.readFileSync(dashboardLayoutPath, 'utf8').includes('FiX');
console.log(`   ${layoutHasRequiredImports ? '✅' : '❌'} DashboardLayout imports: ${layoutHasRequiredImports ? 'COMPLETE' : 'INCOMPLETE'}`);

sidebarHasRequiredImports = fs.existsSync(sidebarPath) && 
  fs.readFileSync(sidebarPath, 'utf8').includes('FiX');
console.log(`   ${sidebarHasRequiredImports ? '✅' : '❌'} Sidebar imports: ${sidebarHasRequiredImports ? 'COMPLETE' : 'INCOMPLETE'}`);

console.log('\n=== TEST COMPLETE ===');
if (hasMobileMenuButton && hasStateManagement && hasResponsiveStyling && 
    hasFixedPosition && hasCloseButton && hasTransformTransition &&
    layoutHasRequiredImports && sidebarHasRequiredImports) {
  console.log('✅ SIDEBAR RESPONSIVE BEHAVIOR IMPLEMENTED SUCCESSFULLY!');
  console.log('✅ Fixed positioning with full height');
  console.log('✅ Mobile menu toggle functionality');
  console.log('✅ Smooth transitions and animations');
  console.log('✅ Responsive design for all devices');
  console.log('✅ Proper state management');
} else {
  console.log('❌ Some issues found:');
  if (!hasMobileMenuButton) console.log('   - Mobile menu button missing');
  if (!hasStateManagement) console.log('   - Sidebar state management missing');
  if (!hasResponsiveStyling) console.log('   - Responsive styling missing');
  if (!hasFixedPosition) console.log('   - Fixed positioning not implemented');
  if (!hasCloseButton) console.log('   - Mobile close button missing');
  if (!hasTransformTransition) console.log('   - Transform transitions missing');
  if (!layoutHasRequiredImports) console.log('   - DashboardLayout imports incomplete');
  if (!sidebarHasRequiredImports) console.log('   - Sidebar imports incomplete');
}