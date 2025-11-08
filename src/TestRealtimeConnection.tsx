import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const TestRealtimeConnection: React.FC = () => {
  const [status, setStatus] = useState('Connecting...');
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`].slice(-10));
  };

  useEffect(() => {
    addLog('Component mounted');
    
    // Test database connection
    const testConnection = async () => {
      try {
        addLog('Testing database connection...');
        const { data, error } = await supabase
          .from('feedback')
          .select('count()', { count: 'exact' });
        
        if (error) {
          addLog(`Connection error: ${error.message}`);
          setStatus(`Error: ${error.message}`);
        } else {
          addLog('Database connection successful');
          setStatus('Connected');
        }
      } catch (err: any) {
        addLog(`Connection failed: ${err}`);
        setStatus(`Failed: ${err}`);
      }
    };

    testConnection();

    // Test real-time subscription
    addLog('Setting up real-time subscription...');
    const channel = supabase.channel('test-realtime');

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'feedback',
      },
      (payload: any) => {
        addLog(`Feedback INSERT event received: ${payload.new?.id}`);
        // Refresh counts
        refreshCounts();
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      (payload: any) => {
        addLog(`Messages INSERT event received: ${payload.new?.id}`);
        // Refresh counts
        refreshCounts();
      }
    );

    channel.subscribe((status: any) => {
      addLog(`Subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        setStatus('Real-time Connected');
        addLog('Real-time subscription successful');
        // Initial count load
        refreshCounts();
      } else if (status === 'CHANNEL_ERROR') {
        setStatus('Real-time Error');
        addLog('Real-time subscription failed');
      }
    });

    // Refresh counts function
    const refreshCounts = async () => {
      try {
        const feedbackResult = await supabase
          .from('feedback')
          .select('count()', { count: 'exact' });
        
        if (!feedbackResult.error) {
          setFeedbackCount(feedbackResult.count || 0);
        }

        const messagesResult = await supabase
          .from('messages')
          .select('count()', { count: 'exact' });
        
        if (!messagesResult.error) {
          setMessagesCount(messagesResult.count || 0);
        }
      } catch (err: any) {
        addLog(`Count refresh error: ${err}`);
      }
    };

    // Cleanup
    return () => {
      addLog('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Real-time Connection Test</h1>
      <div style={{ marginBottom: '20px' }}>
        <h2>Status: {status}</h2>
        <p>Feedback Count: {feedbackCount}</p>
        <p>Messages Count: {messagesCount}</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Logs:</h3>
        <div style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
      
      <div>
        <h3>Test Actions:</h3>
        <button 
          onClick={async () => {
            // This would require a valid user ID
            addLog('Manual refresh triggered');
          }}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Refresh Counts
        </button>
        <button 
          onClick={() => setLogs([])}
          style={{ padding: '8px 16px' }}
        >
          Clear Logs
        </button>
      </div>
    </div>
  );
};

export default TestRealtimeConnection;