const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const BUILD_DIR = path.join(__dirname, 'build');

// MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse the request URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Remove leading slash for file system path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // For any route that's not a file extension, serve index.html (SPA routing)
  const ext = path.extname(pathname);
  if (!ext) {
    pathname = '/index.html';
  }
  
  const filePath = path.join(BUILD_DIR, pathname);
  
  // Security check - prevent directory traversal
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(404);
    res.end('404 Not Found');
    return;
  }
  
  // Read the file
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // If file not found, serve index.html for SPA routing
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(BUILD_DIR, 'index.html'), (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('500 Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          }
        });
      } else {
        res.writeHead(500);
        res.end('500 Internal Server Error');
      }
    } else {
      // Serve the file with correct MIME type
      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Build directory: ${BUILD_DIR}`);
});