/**
 * Secure Vote Application - Direct Server Startup Script
 * 
 * This script provides a simple way to start the direct server implementation
 * that uses mock data while maintaining the API interface of the blockchain-based system.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Clear the console
console.clear();

// Print banner
console.log('=======================================================');
console.log('     SECURE VOTE APPLICATION - DIRECT SERVER SETUP     ');
console.log('=======================================================');
console.log('This script will start the direct server implementation');
console.log('which provides a complete voting system with mock data.');
console.log('All API endpoints will function normally.');
console.log('=======================================================');

// Check if the log file exists and clear it
const logFile = path.join(process.cwd(), 'server-debug.log');
if (fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, ''); // Clear the log file
    console.log('✅ Cleared previous debug log');
} else {
    console.log('✅ No previous debug log found');
}

// Get the path to the direct server script
const serverScript = path.join(__dirname, 'direct-docker-server.cjs');

// Check if the server script exists
if (!fs.existsSync(serverScript)) {
    console.error('❌ Error: Direct server script not found!');
    console.error(`Expected at: ${serverScript}`);
    process.exit(1);
}

console.log('Starting direct server...');

// Start the server process
const serverProcess = spawn('node', [serverScript], {
    stdio: 'inherit'
});

// Handle the server process events
serverProcess.on('error', (err) => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
});

// Wait for server to start
setTimeout(() => {
    console.log('\n=======================================================');
    console.log('                 SERVER INFORMATION                    ');
    console.log('=======================================================');
    console.log('Server URL: http://localhost:3002');
    console.log('\nAvailable endpoints:');
    console.log('  GET  /api/test                       - Test server connection');
    console.log('  GET  /api/status                     - Check server status');
    console.log('  POST /api/voters/register            - Register a voter');
    console.log('  POST /api/votes/cast                 - Cast a vote');
    console.log('  GET  /api/elections/:electionId/results - Get election results');
    console.log('  GET  /api/receipts/:receiptCode      - Verify a receipt');
    console.log('\nTest commands:');
    console.log('  curl http://localhost:3002/api/test');
    console.log('  curl http://localhost:3002/api/status');
    console.log('  curl -X POST -H "Content-Type: application/json" \\');
    console.log('       -d \'{"aadhaarNumber": "123456789012"}\' \\');
    console.log('       http://localhost:3002/api/voters/register');
    console.log('\nDebug logs are being written to: server-debug.log');
    console.log('=======================================================');
    console.log('\nPress Ctrl+C to stop the server');
    console.log('=======================================================');
}, 2000); // Wait 2 seconds for server to start 