// Test script to manually trigger the Edge Function
const testContactNotification = async () => {
  try {
    const response = await fetch('https://awepkphahdheqomgucby.supabase.co/functions/v1/contact-notification', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3ZXBrcGhhaGRoZXFvbWd1Y2J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODQxMzMsImV4cCI6MjA3NTY2MDEzM30.LtvK7WXhkehwbDwE48QNMf2ztJZHuSNLYX5ehMGPRnA',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact: {
          id: 'test-id',
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message',
          created_at: new Date().toISOString()
        }
      }),
    });

    const result = await response.json();
    console.log('Edge Function response:', result);
  } catch (error) {
    console.error('Error testing Edge Function:', error);
  }
};

testContactNotification();