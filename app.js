const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FILE_PATH = path.join(__dirname, 'filenames.txt');

let clickCounter = 0; // Internal counter for button clicks

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/click') {
	console.log(`Received ${req.method} request at ${req.url}`);
        // Increment click counter
        clickCounter++;
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Click registered', clicks: clickCounter }));
    } else if (req.method === 'GET' && req.url === '/getClicks') {
        // Return click counter
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clicks: clickCounter }));
    } else if (req.method === 'POST' && req.url === '/addFile') {
        // Save string to file
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { content } = JSON.parse(body);
                if (content) {
                    fs.appendFile(FILE_PATH, content + '\n', (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Failed to save content' }));
                        } else {
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, message: 'Content saved!' }));
                        }
                    });
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid content' }));
                }
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON format' }));
            }
        });
    } else if (req.method === 'GET' && req.url === '/getFiles') {
        // Return contents of the file
        fs.readFile(FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to read file' }));
            } else {
                const contents = data.trim().split('\n');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, contents }));
            }
        });
    } else {
        // Handle unknown routes
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Route not found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
