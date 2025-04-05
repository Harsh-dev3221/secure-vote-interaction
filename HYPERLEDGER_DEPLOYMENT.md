# Hyperledger Fabric Deployment Guide

This document provides instructions for deploying the Secure Vote Application on a real Hyperledger Fabric network.

## Prerequisites

- Ubuntu 22.04 or Windows with WSL 2 enabled
- Docker Desktop installed and configured for WSL 2
- Node.js v14+ and npm

## 1. Set Up Hyperledger Fabric

### 1.1. Install Prerequisites

```bash
# Install cURL
sudo apt update
sudo apt install -y curl

# Install Docker
sudo apt install -y docker.io
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install -y docker-compose
```

### 1.2. Download Fabric Samples and Binaries

```bash
# Create a directory for Hyperledger Fabric
mkdir -p ~/hyperledger/fabric
cd ~/hyperledger/fabric

# Download Fabric samples and binaries
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.2 1.5.2
```

### 1.3. Start the Test Network

```bash
cd ~/hyperledger/fabric/fabric-samples/test-network

# Start the network with a channel
./network.sh up createChannel -c votingchannel
```

## 2. Deploy the Chaincode

### 2.1. Package the Chaincode

```bash
# Copy the voting-chaincode directory to the WSL environment
cp -r /mnt/d/Android\ Projects/secure-vote-interaction/voting-chaincode ~/hyperledger/fabric/

# Package the chaincode
cd ~/hyperledger/fabric
./fabric-samples/bin/peer lifecycle chaincode package voting.tar.gz --path ./voting-chaincode --lang node --label voting_1.0
```

### 2.2. Install and Approve the Chaincode

```bash
cd ~/hyperledger/fabric/fabric-samples/test-network

# Set environment variables for Org1
export PATH=${PWD}/../bin:$PATH
export FABRIC_CFG_PATH=$PWD/../config/
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Install the chaincode on Org1
peer lifecycle chaincode install ~/hyperledger/fabric/voting.tar.gz

# Get the chaincode package ID
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep voting | awk '{print $3}' | sed 's/,//g')

# Approve the chaincode for Org1
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID votingchannel --name voting --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Set environment variables for Org2
export CORE_PEER_LOCALMSPID="Org2MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
export CORE_PEER_ADDRESS=localhost:9051

# Install the chaincode on Org2
peer lifecycle chaincode install ~/hyperledger/fabric/voting.tar.gz

# Approve the chaincode for Org2
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID votingchannel --name voting --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Commit the chaincode definition
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID votingchannel --name voting --version 1.0 --sequence 1 --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
```

## 3. Set Up the API Server

### 3.1. Create Connection Profiles

```bash
# Create connection profile directories
mkdir -p ~/hyperledger/fabric/secure-vote-api/connection-profiles

# Copy the connection profiles from the test network
cd ~/hyperledger/fabric/secure-vote-api
cp -r ../fabric-samples/test-network/organizations .
```

### 3.2. Initialize the Wallet

```bash
# Set up identities for the API server
cd ~/hyperledger/fabric/secure-vote-api

# Copy the enrollment scripts from the Secure Vote application
cp /mnt/d/Android\ Projects/secure-vote-interaction/src/blockchain/enrollAdmin.cjs .
cp /mnt/d/Android\ Projects/secure-vote-interaction/src/blockchain/registerUser.cjs .

# Run the enrollment scripts
node enrollAdmin.cjs
node registerUser.cjs
```

### 3.3. Start the API Server

```bash
# Copy the API server files
cp /mnt/d/Android\ Projects/secure-vote-interaction/src/blockchain/server.cjs .
cp /mnt/d/Android\ Projects/secure-vote-interaction/src/blockchain/fabric-connection.cjs .

# Install dependencies
npm install fabric-network fabric-ca-client express cors

# Start the server in real Fabric mode
node server.cjs --real-fabric
```

## 4. Configure the Frontend

### 4.1. Update the Frontend Configuration

Edit the `src/services/fabricBlockchainService.ts` file to point to the correct API server:

```typescript
const API_URL = 'http://localhost:3002'; // Update if using a different port
```

### 4.2. Start the Frontend Application

```bash
npm run dev
```

## 5. Testing

### 5.1. Test the Deployed Chaincode

```bash
# Initialize the ledger
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C votingchannel -n voting --peerAddresses localhost:7051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt --peerAddresses localhost:9051 --tlsRootCertFiles ${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt -c '{"function":"initLedger","Args":[]}'
```

### 5.2. Test the API with Fabric

```bash
# Run the API test script
node src/blockchain/test-api.cjs
```

## Troubleshooting

### Certificate Issues
If you encounter certificate issues, ensure that the paths in the connection profile match your actual file paths.

### Docker Issues
Make sure Docker is running and has sufficient resources allocated.

### WSL Issues
If using WSL, ensure that Docker Desktop's WSL 2 integration is enabled.

### Network Issues
If the network cannot be started, try stopping and removing any existing networks and containers:

```bash
cd ~/hyperledger/fabric/fabric-samples/test-network
./network.sh down
docker ps -a
docker rm -f $(docker ps -aq)
docker volume prune
```

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Node.js SDK Documentation](https://hyperledger.github.io/fabric-sdk-node/)
- [Fabric Chaincode Node Documentation](https://hyperledger.github.io/fabric-chaincode-node/) 