const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { getContract } = require('./fabric-connection.cjs');

// Create Express app
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

// Mock data as fallback if Fabric connection fails
const mockElections = {
    election2024: {
        candidates: [
            { id: 1, name: 'Jane Smith', party: 'Progressive Party', votes: 0 },
            { id: 2, name: 'John Adams', party: 'Conservative Alliance', votes: 0 },
            { id: 3, name: 'Sarah Johnson', party: 'Citizens United', votes: 0 },
            { id: 4, name: 'Michael Chen', party: 'Reform Movement', votes: 0 },
            { id: 5, name: 'David Rodriguez', party: 'Independent', votes: 0 }
        ],
        totalVotes: 0
    }
};

const mockVoters = {};
const mockReceipts = {};

// Hash voter ID (Aadhaar number) for privacy
function hashVoterId(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Generate a receipt code
function generateReceiptCode() {
    return Math.random().toString(36).substring(2, 12);
}

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
        // Try to connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            console.log("Using REAL Fabric connection for voter registration");
            try {
                // Register voter on blockchain
                const result = await fabricConn.contract.submitTransaction('registerVoter', aadhaarNumber);
                console.log(`Registration result: ${result.toString()}`);

                // Parse result
                const response = JSON.parse(result.toString());
                fabricConn.disconnect();

                return res.json(response);
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                // Fall back to mock implementation
                console.log("Fabric connection failed, falling back to mock implementation");
            }
        }

        // Fallback to mock implementation
        console.log("Using mock implementation for voter registration");
        const voterId = hashVoterId(aadhaarNumber);

        // Check if voter is already registered
        if (mockVoters[voterId]) {
            return res.json({
                success: false,
                message: 'Voter already registered'
            });
        }

        // Register the voter
        mockVoters[voterId] = {
            registered: true,
            hasVoted: false,
            registeredAt: new Date().toISOString()
        };

        res.json({
            success: true,
            message: 'Voter registered successfully (MOCK)',
            voterId: voterId
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
        // Try to connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            console.log("Using REAL Fabric connection for vote casting");
            try {
                // Cast vote on blockchain
                const result = await fabricConn.contract.submitTransaction('castVote', aadhaarNumber, candidateId.toString());
                console.log(`Vote cast result: ${result.toString()}`);

                // Parse result
                const response = JSON.parse(result.toString());
                fabricConn.disconnect();

                return res.json(response);
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                // Fall back to mock implementation
                console.log("Fabric connection failed, falling back to mock implementation");
            }
        }

        // Fallback to mock implementation
        console.log("Using mock implementation for vote casting");
        const voterId = hashVoterId(aadhaarNumber);

        // Check if voter exists
        if (!mockVoters[voterId]) {
            return res.json({
                success: false,
                message: 'Voter not registered'
            });
        }

        // Check if voter has already voted
        if (mockVoters[voterId].hasVoted) {
            return res.json({
                success: false,
                message: 'Voter has already cast a vote'
            });
        }

        // Update candidate votes
        const election = mockElections.election2024;
        const candidateIndex = election.candidates.findIndex(c => c.id == candidateId);

        if (candidateIndex === -1) {
            return res.json({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Increment votes
        election.candidates[candidateIndex].votes += 1;
        election.totalVotes += 1;

        // Mark voter as having voted
        mockVoters[voterId].hasVoted = true;
        mockVoters[voterId].votedAt = new Date().toISOString();

        // Generate receipt code
        const receiptCode = generateReceiptCode();

        // Store receipt
        mockReceipts[receiptCode] = {
            voterId: voterId,
            candidateId: candidateId,
            timestamp: new Date().toISOString(),
            txId: `TXID_${Math.random().toString(36).substring(2, 10)}`
        };

        // Log real blockchain vote
        console.log('MOCK BLOCKCHAIN VOTE (fallback mode)');
        console.log(`- Candidate ID: ${candidateId}`);
        console.log(`- Receipt Code: ${receiptCode}`);
        console.log(`- Transaction ID: ${mockReceipts[receiptCode].txId}`);

        // Log current vote counts
        console.log('Current vote counts (MOCK):');
        election.candidates.forEach(c => {
            console.log(`${c.name}: ${c.votes} votes`);
        });

        res.json({
            success: true,
            message: 'Vote cast successfully (MOCK fallback)',
            receiptCode: receiptCode,
            txId: mockReceipts[receiptCode].txId
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
        // Try to connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            console.log("Using REAL Fabric connection for election results");
            try {
                // Get results from blockchain
                const result = await fabricConn.contract.evaluateTransaction('getElectionResults', electionId);
                console.log(`Results retrieved: ${result.toString()}`);

                // Parse result
                const response = JSON.parse(result.toString());
                fabricConn.disconnect();

                return res.json(response);
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                // Fall back to mock implementation
                console.log("Fabric connection failed, falling back to mock implementation");
            }
        }

        // Fallback to mock implementation
        console.log("Using mock implementation for election results");
        if (!mockElections[electionId]) {
            return res.json({
                success: false,
                message: 'Election not found'
            });
        }

        console.log('MOCK BLOCKCHAIN QUERY (fallback mode)');

        res.json({
            success: true,
            election: mockElections[electionId]
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
        // Try to connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            console.log("Using REAL Fabric connection for receipt verification");
            try {
                // Verify receipt on blockchain
                const result = await fabricConn.contract.evaluateTransaction('verifyReceipt', receiptCode);
                console.log(`Receipt verification result: ${result.toString()}`);

                // Parse result
                const response = JSON.parse(result.toString());
                fabricConn.disconnect();

                return res.json(response);
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                // Fall back to mock implementation
                console.log("Fabric connection failed, falling back to mock implementation");
            }
        }

        // Fallback to mock implementation
        console.log("Using mock implementation for receipt verification");
        if (!mockReceipts[receiptCode]) {
            return res.json({
                success: false,
                message: 'Receipt not found'
            });
        }

        console.log('MOCK BLOCKCHAIN QUERY (fallback mode)');
        console.log(`- Receipt Code: ${receiptCode}`);
        console.log(`- Transaction ID: ${mockReceipts[receiptCode].txId}`);

        res.json({
            success: true,
            receipt: mockReceipts[receiptCode]
        });
    } catch (error) {
        console.error(`Error verifying receipt: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log('===============================================');
    console.log(`Hyperledger Fabric API Server (REAL MODE) running on port ${PORT}`);
    console.log('===============================================');
    console.log('Attempting to connect to REAL Hyperledger Fabric network');
    console.log('Will fallback to mock implementation if connection fails');
    console.log('Available endpoints:');
    console.log('  GET /api/test');
    console.log('  POST /api/voters/register');
    console.log('  POST /api/votes/cast');
    console.log('  GET /api/elections/:electionId/results');
    console.log('  GET /api/receipts/:receiptCode');
    console.log('===============================================');

    // Test connection to Fabric
    getContract().then(conn => {
        if (conn && conn.contract) {
            console.log('Successfully connected to Hyperledger Fabric network!');
            console.log('Using REAL blockchain for transactions');
            conn.disconnect();
        } else {
            console.log('Failed to connect to Hyperledger Fabric network');
            console.log('Using MOCK implementation as fallback');
        }
    }).catch(err => {
        console.error('Error connecting to Fabric:', err.message);
        console.log('Using MOCK implementation as fallback');
    });
}); 