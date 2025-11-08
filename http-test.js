// Simple HTTP server test
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'ok', 
    message: 'HTTP server is working',
    timestamp: new Date().toISOString()
  }));
});

const PORT = 3002; // Try a different port
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple HTTP server running on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}`);
});