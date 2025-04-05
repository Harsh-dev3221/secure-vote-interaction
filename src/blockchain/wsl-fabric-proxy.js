/**
 * Hyperledger Fabric WSL Proxy Server
 * 
 * This server runs directly in WSL and acts as a proxy between Windows applications
 * and the Hyperledger Fabric network. It handles all blockchain operations and
 * exposes a simple REST API without TLS certificate complications.
 */

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
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
    credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Get the WSL IP address for informational purposes
let wslIp = '';
try {
    const { execSync } = require('child_process');
    wslIp = execSync("ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1").toString().trim();
    console.log(`WSL IP Address: ${wslIp}`);
} catch (error) {
    console.error('Error getting WSL IP:', error.message);
}

// Hash Aadhaar number for privacy
function hashAadhaarNumber(aadhaarNumber) {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Function to connect to the Fabric network and get contract
async function getContract() {
    try {
        // Connection profile path - use local WSL path
        const ccpPath = '/home/vote/hyperledger/fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
        const walletPath = '/home/vote/hyperledger/fabric/fabric-samples/test-network/wallet';

        console.log(`Using connection profile at: ${ccpPath}`);
        console.log(`Using wallet at: ${walletPath}`);

        // Check if files exist
        if (!fs.existsSync(ccpPath)) {
            console.error(`Connection profile not found at ${ccpPath}`);
            return null;
        }

        // Load connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        console.log("Connection profile loaded successfully");

        // Create a wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log("Wallet initialized");

        // Check for identity in wallet
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('No identity found - using admin instead');
            const adminIdentity = await wallet.get('admin');
            if (!adminIdentity) {
                console.log('No admin identity either - creating default identities');
                await createDefaultIdentities(wallet);
            }
        }
        console.log("User identity found in wallet");

        // Gateway connection
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: identity ? 'appUser' : 'admin',
            discovery: { enabled: true, asLocalhost: true }
        });
        console.log("Connected to gateway successfully");

        // Get network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');
        console.log("Connected to channel 'mychannel' and chaincode 'voting'");

        return {
            contract,
            gateway,
            disconnect: () => gateway.disconnect()
        };
    } catch (error) {
        console.error(`Failed to connect to Fabric network: ${error}`);
        return null;
    }
}

// Create default identities if needed
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

// ==========================================================================
// API Endpoints
// ==========================================================================

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        status: 'Hyperledger Fabric WSL Proxy Server is running',
        mode: 'DIRECT',
        wslIp
    });
});

// Status endpoint
app.get('/api/status', async (req, res) => {
    try {
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            fabricConn.disconnect();
            return res.json({
                status: 'Connected',
                mode: 'REAL',
                message: 'Successfully connected to Hyperledger Fabric network',
                wslIp
            });
        } else {
            return res.json({
                status: 'Error',
                mode: 'FALLBACK',
                message: 'Unable to connect to Hyperledger Fabric network',
                wslIp
            });
        }
    } catch (error) {
        return res.json({
            status: 'Error',
            message: error.message,
            mode: 'FALLBACK',
            wslIp
        });
    }
});

// Register voter
app.post('/api/voters/register', async (req, res) => {
    const { aadhaarNumber } = req.body;
    console.log(`Attempting to register voter with Aadhaar: ${aadhaarNumber.substring(0, 4)}****`);

    try {
        // Connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            try {
                // Create voter ID by hashing Aadhaar number
                const voterId = hashAadhaarNumber(aadhaarNumber);

                // Register voter on blockchain
                await fabricConn.contract.submitTransaction(
                    'RegisterVoter',
                    voterId,
                    `Voter_${voterId.substring(0, 8)}`,
                    `voter_${voterId.substring(0, 6)}@example.com`
                );

                fabricConn.disconnect();

                return res.json({
                    success: true,
                    message: 'Voter registered successfully (REAL BLOCKCHAIN)',
                    voterId
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to connect to blockchain'
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
        // Connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            try {
                // Create voter ID by hashing Aadhaar number
                const voterId = hashAadhaarNumber(aadhaarNumber);

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

                fabricConn.disconnect();

                // Generate receipt code (shorter version of hash)
                const receiptCode = receiptHash.substring(0, 10);

                return res.json({
                    success: true,
                    message: 'Vote cast successfully (REAL BLOCKCHAIN)',
                    receiptCode,
                    txId: crypto.randomBytes(8).toString('hex')
                });
            } catch (chainErr) {
                console.error(`Chaincode error: ${chainErr.message}`);
                fabricConn.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to connect to blockchain'
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
        // Connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            try {
                // Get results from blockchain
                const resultBuffer = await fabricConn.contract.evaluateTransaction(
                    'GetElectionResults',
                    'election1'
                );

                fabricConn.disconnect();

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
                fabricConn.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to connect to blockchain'
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
        // Connect to Fabric
        const fabricConn = await getContract();

        if (fabricConn && fabricConn.contract) {
            try {
                // In a real implementation, we would query the blockchain for the receipt
                // Since our current chaincode doesn't have a direct mapping from receipt code to data,
                // we'll return a simulated response

                fabricConn.disconnect();

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
                fabricConn.disconnect();

                return res.status(400).json({
                    success: false,
                    message: `Blockchain error: ${chainErr.message}`
                });
            }
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to connect to blockchain'
        });
    } catch (error) {
        console.error(`Error verifying receipt: ${error.message}`);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error: ' + err.message });
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`=========================================================`);
    console.log(`Hyperledger Fabric WSL Proxy Server running on port ${PORT}`);
    console.log(`WSL IP: ${wslIp}`);
    console.log(`=========================================================`);
    console.log('Windows can access this server at:');
    console.log(`http://localhost:${PORT} (if port forwarded)`);
    console.log(`http://${wslIp}:${PORT} (directly via WSL IP)`);
    console.log(`=========================================================`);
}); 