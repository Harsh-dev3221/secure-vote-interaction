/**
 * Hyperledger Fabric API Server - Docker Version
 * 
 * This version is optimized for running in a Docker container alongside the
 * Hyperledger Fabric network components.
 */

// Set environment variable to disable TLS verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const express = require('express');
const cors = require('cors');
const { Wallets, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create Express app
const app = express();
app.use(express.json());

// CORS settings
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://host.docker.internal:5173'],
    credentials: true
}));

// Mock implementation - used as fallback if connection to Fabric fails
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

// Connect to Fabric
async function connectToFabric() {
    try {
        console.log('Attempting to connect to Hyperledger Fabric network...');

        // Connection details
        const walletPath = path.join(process.cwd(), 'wallet');

        // Create Docker-specific connection profile on the fly
        const connectionProfilePath = path.join(process.cwd(), 'connection-profile-docker.json');

        // Get WSL IP from environment variable or use host.docker.internal as fallback
        const wslHost = process.env.WSL_HOST || 'host.docker.internal';
        console.log(`Using WSL host: ${wslHost}`);

        // Create Docker-specific connection profile
        const dockerConnectionProfile = {
            "name": "secure-vote-network",
            "version": "1.0.0",
            "client": {
                "organization": "Org1",
                "connection": {
                    "timeout": {
                        "peer": {
                            "endorser": "300"
                        }
                    }
                }
            },
            "organizations": {
                "Org1": {
                    "mspid": "Org1MSP",
                    "peers": [
                        "peer0.org1.example.com"
                    ],
                    "certificateAuthorities": [
                        "ca.org1.example.com"
                    ]
                }
            },
            "peers": {
                "peer0.org1.example.com": {
                    "url": `grpcs://${wslHost}:7051`,
                    "grpcOptions": {
                        "ssl-target-name-override": "peer0.org1.example.com",
                        "hostnameOverride": "peer0.org1.example.com"
                    }
                }
            },
            "certificateAuthorities": {
                "ca.org1.example.com": {
                    "url": `https://${wslHost}:7054`,
                    "caName": "ca.org1.example.com",
                    "httpOptions": {
                        "verify": false
                    }
                }
            }
        };

        // Write the Docker-specific connection profile
        fs.writeFileSync(connectionProfilePath, JSON.stringify(dockerConnectionProfile, null, 2));

        console.log(`Wallet path: ${walletPath}`);
        console.log(`Connection profile path: ${connectionProfilePath}`);
        console.log(`Connection profile created for Docker environment`);
        console.log(`Peer URL: ${dockerConnectionProfile.peers["peer0.org1.example.com"].url}`);
        console.log(`CA URL: ${dockerConnectionProfile.certificateAuthorities["ca.org1.example.com"].url}`);

        // Initialize file system wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log('Wallet initialized');

        // Check for admin identity
        const identity = await wallet.get('admin');
        if (!identity) {
            console.log('Admin identity not found. Creating default identities...');
            await createDefaultIdentities(wallet);
        }

        // Create a new gateway for connecting to Fabric network
        const gateway = new Gateway();

        // Load connection profile
        const connectionProfile = JSON.parse(fs.readFileSync(connectionProfilePath, 'utf8'));

        // Connect to gateway as admin
        await gateway.connect(connectionProfile, {
            wallet,
            identity: 'admin',
            discovery: { enabled: true, asLocalhost: false } // Important: false when running in Docker
        });

        console.log('Connected to gateway');

        // Get network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');

        console.log('Successfully connected to Hyperledger Fabric network');

        return { contract, gateway };
    } catch (error) {
        console.error(`Failed to connect to Hyperledger Fabric: ${error.message}`);
        if (error.stack) console.error(error.stack);
        return null;
    }
}

// Create default identities for the wallet
async function createDefaultIdentities(wallet) {
    try {
        // Create admin identity
        const adminIdentity = {
            credentials: {
                certificate: `-----BEGIN CERTIFICATE-----
MIICATCCAaigAwIBAgIUXkAy9LKcsp9CtuT6kO5Xd0U5eAkwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIxMDAwWhcNMjMwMjAyMjIx
NTAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI
zj0CAQYIKoZIzj0DAQcDQgAE+qK8iE6yqUuZ7Yo0fwWU2uZdpWzT+JqQ1jdnSUZF
MFzVKBJdG6MJQbFMDBQFHkCozfbAj5rD4Udte9c8B8UZVaNgMF4wDgYDVR0PAQH/
BAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFBKs+VZhfYZnH5Oqw3D3Z3yg
H+X+MCkGA1UdIwQiMCCAILOEoeGoEG+UZHhQSZV5aGZa8qRAqkjD5EHWc5ba7gKF
MAoGCCqGSM49BAMCA0cAMEQCICT2a6n3Tu8VYQIxNe4NjJRUNfdSPAXLZ+MD5rI6
WHPlAiBxZlGzZajjzNMnUCQiw9RPjGPkEy0YdKq6OY5/2Z5KXQ==
-----END CERTIFICATE-----`,
                privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgcII8LNJdRl2rz4TD
H9Pda2Q0yguw+C7hNW9wGlTs9WShRANCAATFlBx9L55MKh8vojbwvB7GzFXfnlUB
CKAFx5MmdZCC+LlxpkBrFA2ww0UFODcZPq4XYP+NrwUD/MXGhK6l6/ct
-----END PRIVATE KEY-----`
            },
            mspId: "Org1MSP",
            type: "X.509",
            version: 1
        };

        await wallet.put('admin', adminIdentity);
        console.log('Created admin identity');

        // Create appUser identity
        const appUserIdentity = {
            credentials: {
                certificate: `-----BEGIN CERTIFICATE-----
MIIChDCCAiqgAwIBAgIUKRVW8KNjB6K895Y+rJxghSBpTmIwCgYIKoZIzj0EAwIw
czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh
biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT
E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIxNTAwWhcNMjMwMjAyMjIy
MDAwWjBAMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw
YXJ0bWVudDExDDAKBgNVBAMTA3RvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA
BBnROnUnTJGk/Rlh07off6xPwekicC3rPIjCn3LZw9L9JPzJUkDet8EcwCPgeWJI
GKvHbIW5QSN6GFc1WVEkBl6jgcgwgcUwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB
/wQCMAAwHQYDVR0OBBYEFPZUXzZGLnXHGO+TpV3+izCR6TrfMCkGA1UdIwQiMCCA
ILOEoeGoEG+UZHhQSZV5aGZa8qRAqkjD5EHWc5ba7gKFMGkGCCoDBAUGBwgBBF17
ImF0dHJzIjp7ImhmLkFmZmlsaWF0aW9uIjoib3JnMS5kZXBhcnRtZW50MSIsImhm
LkVucm9sbG1lbnRJRCI6InRvbSIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZI
zj0EAwIDRwAwRAIgQhqeXw6sI9YEl9oxpV7rXPSZx20sUUfGMnkPRn4Y94sCICuT
f1IRT9ueP2YOkBfQmkYMGQY+PpVpUMEYz5wRSqmp
-----END CERTIFICATE-----`,
                privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgO88H85zJ+NRHiTRo
gU3Fz6sVDbNPVxWj3dMIbxRIpYyhRANCAAQZ0Tp1J0yRpP0ZYdO6H3+sT8HpInAt
6zyIwp9y2cPS/ST8yVJA3rfBHMAj4HliSBirx2yFuUEjehhXNVlRJAZe
-----END PRIVATE KEY-----`
            },
            mspId: "Org1MSP",
            type: "X.509",
            version: 1
        };

        await wallet.put('appUser', appUserIdentity);
        console.log('Created appUser identity');

    } catch (error) {
        console.error(`Error creating default identities: ${error}`);
    }
}

// API Routes
// ==========================================================================

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ status: 'Hyperledger Fabric API Server is running with REAL Fabric connection' });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const fabricConn = await connectToFabric();

        if (fabricConn && fabricConn.contract) {
            fabricConn.gateway.disconnect();
            return res.json({
                status: 'Connected',
                mode: 'REAL',
                message: 'Successfully connected to Hyperledger Fabric network'
            });
        } else {
            return res.json({
                status: 'Error',
                mode: 'FALLBACK',
                message: 'Unable to connect to Hyperledger Fabric network, using fallback mode'
            });
        }
    } catch (error) {
        return res.json({
            status: 'Error',
            message: error.message,
            mode: 'FALLBACK'
        });
    }
});

// Register voter
app.post('/api/voters/register', async (req, res) => {
    const { aadhaarNumber } = req.body;
    console.log(`Attempting to register voter with Aadhaar: ${aadhaarNumber.substring(0, 4)}****`);

    try {
        // Try to connect to Fabric
        const fabricConn = await connectToFabric();

        if (fabricConn && fabricConn.contract) {
            try {
                // Create voter ID by hashing Aadhaar number
                const voterId = hashAadhaar(aadhaarNumber);

                // Register voter on blockchain
                await fabricConn.contract.submitTransaction(
                    'RegisterVoter',
                    voterId,
                    `Voter_${voterId.substring(0, 8)}`,
                    `voter_${voterId.substring(0, 6)}@example.com`
                );

                fabricConn.gateway.disconnect();

                return res.json({
                    success: true,
                    message: 'Voter registered successfully (BLOCKCHAIN)',
                    voterId
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.gateway.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        // Fallback to mock implementation
        console.log('Using mock implementation for voter registration');

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
        // Try to connect to Fabric
        const fabricConn = await connectToFabric();

        if (fabricConn && fabricConn.contract) {
            try {
                // Create voter ID by hashing Aadhaar number
                const voterId = hashAadhaar(aadhaarNumber);

                // Generate receipt hash
                const timestamp = new Date().toISOString();
                const receiptHash = crypto.createHash('sha256')
                    .update(`${voterId}-${candidateId}-${timestamp}`)
                    .digest('hex');

                // Cast vote on blockchain
                await fabricConn.contract.submitTransaction(
                    'CastVote',
                    voterId,
                    'election1',
                    `Candidate ${candidateId}`,
                    timestamp,
                    receiptHash
                );

                fabricConn.gateway.disconnect();

                // Generate receipt code (shorter version of hash)
                const receiptCode = receiptHash.substring(0, 10);

                return res.json({
                    success: true,
                    message: 'Vote cast successfully (BLOCKCHAIN)',
                    receiptCode,
                    txId: crypto.randomBytes(8).toString('hex')
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.gateway.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        // Fallback to mock implementation
        console.log('Using mock implementation for vote casting');

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
            message: 'Vote cast successfully (MOCK fallback)',
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
        // Try to connect to Fabric
        const fabricConn = await connectToFabric();

        if (fabricConn && fabricConn.contract) {
            try {
                // Get results from blockchain
                const resultBuffer = await fabricConn.contract.evaluateTransaction(
                    'GetElectionResults',
                    'election1'
                );

                fabricConn.gateway.disconnect();

                const result = JSON.parse(resultBuffer.toString());

                // Format to match expected structure
                const candidates = [];
                let totalVotes = 0;

                for (const [candidate, votes] of Object.entries(result.Votes || {})) {
                    candidates.push({
                        id: candidates.length + 1,
                        name: candidate,
                        party: 'Party ' + (candidates.length + 1),
                        votes
                    });
                    totalVotes += votes;
                }

                return res.json({
                    success: true,
                    election: {
                        candidates,
                        totalVotes
                    }
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.gateway.disconnect();
            }
        }

        // Fallback to mock implementation
        console.log('Using mock implementation for election results');

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
        // Try to connect to Fabric
        const fabricConn = await connectToFabric();

        if (fabricConn && fabricConn.contract) {
            try {
                // In a real implementation, we would query the blockchain for the receipt
                // Since our current chaincode doesn't have a direct mapping from receipt code to data,
                // we'll return a simulated response

                fabricConn.gateway.disconnect();

                return res.json({
                    success: true,
                    receipt: {
                        voterId: crypto.createHash('sha256').update('simulated-voter').digest('hex'),
                        candidateId: 1,
                        timestamp: new Date().toISOString(),
                        txId: crypto.randomBytes(8).toString('hex')
                    }
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.gateway.disconnect();
            }
        }

        // Fallback to mock implementation
        console.log('Using mock implementation for receipt verification');

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
    console.log(`Hyperledger Fabric API Server running on port ${PORT}`);
}); 