/**
 * Direct Docker Server for Secure Vote Application
 * 
 * This server connects directly to the Hyperledger Fabric network
 * running in WSL using the host.docker.internal DNS name.
 */

// Set environment variable to disable TLS verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Log TLS setting
console.log('TLS certificate verification disabled for development');
console.log('Server initialization starting...');

const express = require('express');
console.log('Express module loaded');
const cors = require('cors');
console.log('CORS module loaded');
const crypto = require('crypto');
console.log('Crypto module loaded');
const fs = require('fs');
console.log('File system module loaded');

// Create a logger function
function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    fs.appendFileSync('server-debug.log', logMessage);
    console.log(message);
}

// Create Express app
const app = express();
console.log('Express app created');
app.use(express.json());
console.log('JSON middleware applied');

// Add request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    logToFile(`Received ${req.method} request to ${req.url}`);

    // Capture the original res.json
    const originalJson = res.json;
    res.json = function (body) {
        logToFile(`Response for ${req.method} ${req.url}: ${JSON.stringify(body)}`);
        return originalJson.call(this, body);
    };

    next();

    const duration = Date.now() - start;
    logToFile(`Completed ${req.method} ${req.url} in ${duration}ms`);
});

// CORS settings
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
console.log('CORS middleware applied');

// Mock data store (used if connection to Fabric fails)
const mockData = {
    registeredVoters: {},
    votes: {},
    receipts: {}
};

// Initialize candidates for the mock election
const candidates = [
    { id: 1, name: 'Jane Smith', party: 'Progressive Party', votes: 0 },
    { id: 2, name: 'John Adams', party: 'Conservative Alliance', votes: 0 },
    { id: 3, name: 'Sarah Johnson', party: 'Citizens United', votes: 0 },
    { id: 4, name: 'Michael Chen', party: 'Reform Movement', votes: 0 },
    { id: 5, name: 'David Rodriguez', party: 'Independent', votes: 0 }
];

// Utility function to hash Aadhaar numbers
function hashAadhaar(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Generate a random ID for receipts
function generateId(length = 8) {
    return Math.random().toString(36).substring(2, 2 + length);
}

// Generate a transaction ID
function generateTxId() {
    return `TXID_${generateId(8)}`;
}

// API Routes
// ==========================================================================

// Test endpoint
app.get('/api/test', (req, res) => {
    logToFile('Test endpoint called');
    res.json({
        status: 'Hyperledger Fabric API Direct Docker Server is running',
        message: 'This is a Direct Docker Server connecting to Fabric in WSL'
    });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
    logToFile('Status endpoint called');
    return res.json({
        status: 'Connected',
        mode: 'DIRECT DOCKER',
        message: 'Using mock implementation until Fabric connection is configured',
        wslHost: process.env.WSL_HOST || 'host.docker.internal'
    });
});

// Register voter
app.post('/api/voters/register', async (req, res) => {
    const { aadhaarNumber } = req.body;
    console.log(`Attempting to register voter with Aadhaar: ${aadhaarNumber.substring(0, 4)}****`);

    try {
        // Create voter ID by hashing Aadhaar number
        const voterId = hashAadhaar(aadhaarNumber);

        // Check if voter is already registered
        if (mockData.registeredVoters[voterId]) {
            return res.status(400).json({
                success: false,
                message: 'Voter already registered'
            });
        }

        // Register voter in mock data
        mockData.registeredVoters[voterId] = {
            aadhaarNumber,
            registeredAt: new Date().toISOString(),
            hasVoted: false
        };

        return res.json({
            success: true,
            message: 'Voter registered successfully (MOCK)',
            voterId
        });
    } catch (error) {
        console.error(`Error registering voter: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Cast vote
app.post('/api/votes/cast', async (req, res) => {
    const { aadhaarNumber, candidateId } = req.body;
    console.log(`Vote submission request received for candidate ${candidateId}`);

    try {
        // Create voter ID by hashing Aadhaar number
        const voterId = hashAadhaar(aadhaarNumber);

        // Check if voter exists
        if (!mockData.registeredVoters[voterId]) {
            return res.status(400).json({
                success: false,
                message: 'Voter not registered'
            });
        }

        // Check if voter has already voted
        if (mockData.registeredVoters[voterId].hasVoted) {
            return res.status(400).json({
                success: false,
                message: 'Voter has already cast a vote'
            });
        }

        // Check if candidate exists
        const candidate = candidates.find(c => c.id === parseInt(candidateId));
        if (!candidate) {
            return res.status(400).json({
                success: false,
                message: 'Invalid candidate'
            });
        }

        // Cast vote
        candidate.votes++;
        mockData.registeredVoters[voterId].hasVoted = true;

        // Generate receipt
        const receiptCode = generateId(10);
        const txId = generateTxId();

        // Store receipt
        mockData.receipts[receiptCode] = {
            voterId,
            candidateId,
            timestamp: new Date().toISOString(),
            txId
        };

        return res.json({
            success: true,
            message: 'Vote cast successfully (MOCK)',
            receiptCode,
            txId
        });
    } catch (error) {
        console.error(`Error casting vote: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get election results
app.get('/api/elections/:electionId/results', async (req, res) => {
    const { electionId } = req.params;
    console.log(`Election results requested for ${electionId}`);

    try {
        // Return mock election results
        return res.json({
            success: true,
            election: {
                candidates,
                totalVotes: candidates.reduce((total, c) => total + c.votes, 0)
            }
        });
    } catch (error) {
        console.error(`Error getting election results: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Verify receipt
app.get('/api/receipts/:receiptCode', async (req, res) => {
    const { receiptCode } = req.params;
    console.log(`Receipt verification requested for ${receiptCode}`);

    try {
        // Check if receipt exists
        const receipt = mockData.receipts[receiptCode];
        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found'
            });
        }

        // Return receipt information
        return res.json({
            success: true,
            receipt
        });
    } catch (error) {
        console.error(`Error verifying receipt: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
    console.log('===============================================');
    console.log(`Direct Docker Server running on port ${PORT}`);
    console.log('===============================================');
    console.log('Available endpoints:');
    console.log('  GET /api/test');
    console.log('  GET /api/status');
    console.log('  POST /api/voters/register');
    console.log('  POST /api/votes/cast');
    console.log('  GET /api/elections/:electionId/results');
    console.log('  GET /api/receipts/:receiptCode');
    console.log('===============================================');
    console.log('Server is now ready to accept connections');
});