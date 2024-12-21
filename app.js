const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FILE_PATH = path.join(__dirname, 'filenames.txt');

// Create the server
const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/save') {
        // Handle POST request to save a filename
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const filename = JSON.parse(body).filename; // Parse JSON body
            if (filename) {
                // Append the filename to the file
                fs.appendFile(FILE_PATH, filename + '\n', (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: 'Failed to save filename' }));
                    } else {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Filename saved!' }));
                    }
                });
            } else {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid filename' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/list') {
        // Handle GET request to return all filenames
        fs.readFile(FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read file' }));
            } else {
                const filenames = data.trim().split('\n');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, filenames }));
            }
        });
    } else {
        // Handle 404 for unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Route not found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
