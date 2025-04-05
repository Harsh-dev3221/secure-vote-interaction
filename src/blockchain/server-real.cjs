const express = require('express');
const cors = require('cors');
const { getContract } = require('./fabric-connection.cjs');

const app = express();
app.use(express.json());

// CORS settings
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080'],
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ status: 'Hyperledger Fabric API Server is running with REAL Fabric connection' });
});

// Register voter
app.post('/api/voters/register', async (req, res) => {
    const { aadhaarNumber } = req.body;
    console.log(`Attempting to register voter with Aadhaar: ${aadhaarNumber.substring(0, 4)}****`);

    try {
        // Connect to Fabric
        const { contract, disconnect } = await getContract();

        if (!contract) {
            return res.status(500).json({
                success: false,
                message: 'Failed to connect to Fabric network. Please make sure the network is running and the wallet is set up.'
            });
        }

        // Register voter
        const result = await contract.submitTransaction('registerVoter', aadhaarNumber);
        console.log(`Registration result: ${result.toString()}`);

        // Parse result
        const response = JSON.parse(result.toString());
        disconnect();

        res.json(response);
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
        // Connect to Fabric
        const { contract, disconnect } = await getContract();

        if (!contract) {
            return res.status(500).json({
                success: false,
                message: 'Failed to connect to Fabric network. Please make sure the network is running and the wallet is set up.'
            });
        }

        // Cast vote
        const result = await contract.submitTransaction('castVote', aadhaarNumber, candidateId.toString());
        console.log(`Vote cast result: ${result.toString()}`);

        // Parse result
        const response = JSON.parse(result.toString());
        disconnect();

        res.json(response);
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
        // Connect to Fabric
        const { contract, disconnect } = await getContract();

        if (!contract) {
            return res.status(500).json({
                success: false,
                message: 'Failed to connect to Fabric network. Please make sure the network is running and the wallet is set up.'
            });
        }

        // Get results
        const result = await contract.evaluateTransaction('getElectionResults', electionId);
        console.log(`Results retrieved: ${result.toString()}`);

        // Parse result
        const response = JSON.parse(result.toString());
        disconnect();

        res.json(response);
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
        // Connect to Fabric
        const { contract, disconnect } = await getContract();

        if (!contract) {
            return res.status(500).json({
                success: false,
                message: 'Failed to connect to Fabric network. Please make sure the network is running and the wallet is set up.'
            });
        }

        // Verify receipt
        const result = await contract.evaluateTransaction('verifyReceipt', receiptCode);
        console.log(`Receipt verification result: ${result.toString()}`);

        // Parse result
        const response = JSON.parse(result.toString());
        disconnect();

        res.json(response);
    } catch (error) {
        console.error(`Error verifying receipt: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Middleware to handle Fabric connection errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log('===============================================');
    console.log(`Hyperledger Fabric API Server (REAL MODE) running on port ${PORT}`);
    console.log('===============================================');
    console.log('Connected to a real Hyperledger Fabric network');
    console.log('Available endpoints:');
    console.log('  GET /api/test');
    console.log('  POST /api/voters/register');
    console.log('  POST /api/votes/cast');
    console.log('  GET /api/elections/:electionId/results');
    console.log('  GET /api/receipts/:receiptCode');
    console.log('===============================================');
}); 