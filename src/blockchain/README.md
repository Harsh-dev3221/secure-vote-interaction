# Hyperledger Fabric Integration for Secure Vote Interaction

This directory contains all the necessary files to integrate the Secure Vote Interaction app with Hyperledger Fabric.

## Current Status: Mock Mode

The application currently runs in "Mock Mode," which means it simulates blockchain operations without requiring an actual Hyperledger Fabric network. This allows for development and testing of the application logic while Fabric infrastructure is being set up.

All API endpoints are functional and provide realistic responses, but data is stored in-memory rather than in a blockchain.

### Running the Mock Server

```bash
# Start the API server in mock mode
npm run fabric:dev
```

### Testing the Mock Server

```bash
npm run fabric:test
```

## Setting Up Real Hyperledger Fabric (Future Steps)

### Prerequisites
- Docker Desktop installed and running
- Node.js v14+ and npm
- Hyperledger Fabric binaries and docker images

### Step 1: Install Fabric Prerequisites
```bash
# Navigate to the blockchain directory
cd src/blockchain

# Install required npm packages
npm install fabric-network fabric-ca-client
```

### Step 2: Start the Fabric Test Network
To start a Hyperledger Fabric test network, you need to:

1. Download the Fabric samples:
```bash
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.2 1.5.2
```

2. Navigate to the test-network directory:
```bash
cd fabric-samples/test-network
```

3. Start the network and create a channel:
```bash
./network.sh up createChannel -c votingchannel
```

4. Deploy the chaincode:
```bash
./network.sh deployCC -ccn voting -ccp /path/to/voting-chaincode -ccl javascript
```

### Step 3: Set Up Fabric Identities
```bash
# Enroll admin user
npm run fabric:enroll-admin

# Register application user
npm run fabric:register-user
```

### Step 4: Start the API Server
```bash
# Start the API server
npm run fabric:dev
```

## Testing
You can test if the Fabric API server is working correctly by running:
```bash
npm run fabric:test
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test` | GET | Check if the server is running |
| `/api/voters/register` | POST | Register a voter with their Aadhaar number |
| `/api/votes/cast` | POST | Cast a vote for a specific candidate |
| `/api/elections/:electionId/results` | GET | Get the current election results |
| `/api/receipts/:receiptCode` | GET | Verify a vote receipt |

## Troubleshooting

1. **"Failed to connect to Fabric network"**
   - Ensure the test network is running
   - Check if the wallet contains the required identities
   - Verify the connection profile is correctly configured

2. **"No identity found"**
   - Run the enrollAdmin.js and registerUser.js scripts to create the necessary identities

3. **Docker issues**
   - Try restarting Docker Desktop
   - Clear Docker containers with `docker rm -f $(docker ps -aq)`
   - Clear Docker volumes with `docker volume prune`

## Features

1. **No Gas Fees**: Transactions are processed without gas fees
2. **Private & Permissioned**: Only authorized entities can participate
3. **Vote Privacy**: Votes are recorded with privacy in mind
4. **Receipt Verification**: Each vote generates a verifiable receipt
5. **Auditable**: Results can be audited by authorized parties

## Production Deployment

For a production deployment, you would:

1. Set up a real Hyperledger Fabric network
2. Deploy the chaincode to the network
3. Configure proper authentication and authorization
4. Use secure identity management for voter verification
5. Set up proper TLS security for API endpoints

## Resources

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Chaincode Tutorial](https://hyperledger-fabric.readthedocs.io/en/latest/chaincode4ade.html)
- [Fabric Node.js SDK](https://hyperledger.github.io/fabric-sdk-node/) 