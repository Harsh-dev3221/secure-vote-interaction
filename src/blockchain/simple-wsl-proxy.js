/**
 * Simple WSL Proxy for Testing
 */

const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();
app.use(express.json());

// CORS settings
app.use(cors({
    origin: '*',
    credentials: true
}));

// Get the WSL IP address
let wslIp = '';
try {
    const { execSync } = require('child_process');
    wslIp = execSync("hostname -I").toString().trim().split(' ')[0];
    console.log(`WSL IP Address: ${wslIp}`);
} catch (error) {
    console.error('Error getting WSL IP:', error.message);
}

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: 'Simple WSL Proxy is running',
        mode: 'TEST',
        wslIp
    });
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Simple WSL Proxy Server running on port ${PORT}`);
    console.log(`WSL IP: ${wslIp}`);
    console.log(`Listening on all interfaces (0.0.0.0)`);
}); 