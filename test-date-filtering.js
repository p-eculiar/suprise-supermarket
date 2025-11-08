// Test the date filtering logic used in the notification dashboard

function testDateFiltering() {
  console.log('Testing date filtering logic...\n');
  
  const now = new Date();
  console.log('Current date:', now.toISOString());
  
  // Test "Today" calculation
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  console.log('\n--- TODAY ---');
  console.log('Today start:', todayStart.toISOString());
  console.log('Is today filter correct?', todayStart <= now);
  
  // Test "This Week" calculation
  const day = now.getDay();
  const diff = now.getDate() - day;
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  console.log('\n--- THIS WEEK ---');
  console.log('Week start:', weekStart.toISOString());
  console.log('Is week filter correct?', weekStart <= now);
  
  // Reset now date for next calculation
  const now2 = new Date();
  
  // Test "This Month" calculation
  const monthStart = new Date(now2.getFullYear(), now2.getMonth(), 1);
  console.log('\n--- THIS MONTH ---');
  console.log('Month start:', monthStart.toISOString());
  console.log('Is month filter correct?', monthStart <= now2);
  
  // Test with sample dates
  console.log('\n--- SAMPLE DATE TESTING ---');
  const sampleDates = [
    new Date(now2), // Today
    new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() - 1), // Yesterday
    new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() - 3), // 3 days ago
    new Date(now2.getFullYear(), now2.getMonth(), now2.getDate() - 10), // 10 days ago
    new Date(now2.getFullYear(), now2.getMonth() - 1, now2.getDate()) // Last month
  ];
  
  sampleDates.forEach((date, index) => {
    console.log(`\nSample date ${index + 1}:`, date.toISOString());
    console.log('  Should appear in "Today":', date >= todayStart);
    console.log('  Should appear in "This Week":', date >= weekStart);
    console.log('  Should appear in "This Month":', date >= monthStart);
  });
}

testDateFiltering();