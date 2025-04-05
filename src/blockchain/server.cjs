const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const bodyParser = require('body-parser');

// In a production environment, you would use the fabric-network SDK
// This is a simplified version for development/demonstration

const app = express();

// Enhanced CORS configuration
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json());

// Request logger middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Mock election data
const election = {
    id: 'election2024',
    name: 'Presidential Election 2024',
    startTime: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    endTime: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days from now
    candidates: [
        { id: '1', name: 'Jane Smith', party: 'Progressive Party', voteCount: 0 },
        { id: '2', name: 'John Adams', party: 'Conservative Alliance', voteCount: 0 },
        { id: '3', name: 'Sarah Johnson', party: 'Citizens United', voteCount: 0 },
        { id: '4', name: 'Michael Chen', party: 'Reform Movement', voteCount: 0 },
        { id: '5', name: 'David Rodriguez', party: 'Independent', voteCount: 0 }
    ],
    active: true
};

// Store for votes and voters
const voters = {};
const votes = [];

// Hash voter ID (Aadhaar number) for privacy
function hashVoterId(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Register a voter
app.post('/api/voters/register', (req, res) => {
    console.log('Voter registration request received:', req.body);
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
        console.log('Registration failed: No Aadhaar number provided');
        return res.status(400).json({
            success: false,
            error: 'Aadhaar number is required'
        });
    }

    const voterId = hashVoterId(aadhaarNumber);
    console.log('Voter ID hash:', voterId);

    // Check if voter is already registered
    if (voters[voterId]) {
        console.log('Registration failed: Voter already registered');
        return res.status(400).json({
            success: false,
            error: 'Voter is already registered'
        });
    }

    // Register voter
    voters[voterId] = {
        id: voterId,
        electionId: election.id,
        hasVoted: false,
        receiptCode: ''
    };

    console.log('Voter registered successfully');
    res.json({ success: true });
});

// Cast a vote
app.post('/api/votes/cast', (req, res) => {
    console.log('Vote casting request received:', req.body);
    const { aadhaarNumber, candidateId } = req.body;

    if (!aadhaarNumber || !candidateId) {
        console.log('Vote casting failed: Missing required fields');
        return res.status(400).json({
            success: false,
            error: 'Aadhaar number and candidate ID are required'
        });
    }

    const voterId = hashVoterId(aadhaarNumber);
    console.log('Voter ID hash:', voterId);

    // Get or register voter
    if (!voters[voterId]) {
        console.log('New voter registration during vote casting');
        voters[voterId] = {
            id: voterId,
            electionId: election.id,
            hasVoted: false,
            receiptCode: ''
        };
    }

    // Check if voter has already voted
    if (voters[voterId].hasVoted) {
        console.log('Vote casting failed: Voter has already voted');
        return res.status(400).json({
            success: false,
            error: 'Voter has already cast a vote'
        });
    }

    // Find candidate
    const candidate = election.candidates.find(c => c.id === candidateId.toString());
    if (!candidate) {
        console.log('Vote casting failed: Candidate not found');
        return res.status(400).json({
            success: false,
            error: 'Candidate not found'
        });
    }

    // Generate receipt code
    const receiptCode = Math.random().toString(36).substring(2, 15);
    console.log('Generated receipt code:', receiptCode);

    // Cast vote
    candidate.voteCount++;
    voters[voterId].hasVoted = true;
    voters[voterId].receiptCode = receiptCode;

    // Record vote
    const vote = {
        voterId,
        candidateId: candidateId.toString(),
        timestamp: new Date().toISOString(),
        receiptCode
    };
    votes.push(vote);

    // Generate mock transaction ID
    const transactionId = `TXID_${Math.random().toString(36).substring(2, 15)}`;
    console.log('Vote recorded successfully. Transaction ID:', transactionId);

    // Display all votes so far
    console.log('Current vote counts:');
    election.candidates.forEach(c => {
        console.log(`${c.name}: ${c.voteCount} votes`);
    });

    res.json({
        success: true,
        receiptCode,
        transactionId
    });
});

// Get election results
app.get('/api/elections/:electionId/results', (req, res) => {
    console.log('Election results request received for:', req.params.electionId);
    const { electionId } = req.params;

    if (electionId !== election.id) {
        console.log('Results request failed: Election not found');
        return res.status(404).json({
            success: false,
            error: 'Election not found'
        });
    }

    const results = election.candidates.map(candidate => ({
        candidateId: candidate.id,
        name: candidate.name,
        party: candidate.party,
        voteCount: candidate.voteCount
    }));

    console.log('Returning election results');
    res.json({ success: true, results });
});

// Verify receipt
app.get('/api/receipts/:receiptCode', (req, res) => {
    console.log('Receipt verification request received for:', req.params.receiptCode);
    const { receiptCode } = req.params;

    const vote = votes.find(v => v.receiptCode === receiptCode);

    if (!vote) {
        console.log('Receipt verification failed: Receipt not found');
        return res.status(404).json({
            success: false,
            error: 'Receipt not found'
        });
    }

    console.log('Receipt verified successfully');
    res.json({
        success: true,
        verified: true,
        timestamp: vote.timestamp
    });
});

// Add a test endpoint
app.get('/api/test', (req, res) => {
    console.log('Test endpoint called');
    res.json({ message: 'Hyperledger Fabric API Server is running correctly!' });
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
});

// For debugging
console.log('Mock Hyperledger Fabric API Server started');
console.log('Available endpoints:');
console.log('  POST /api/voters/register');
console.log('  POST /api/votes/cast');
console.log('  GET /api/elections/:electionId/results');
console.log('  GET /api/receipts/:receiptCode');
console.log('  GET /api/test');

// Print a message so it's clear the server has started properly
console.log('==========================================================');
console.log('Server is ready to receive requests');
console.log('=========================================================='); 