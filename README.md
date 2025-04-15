# Secure Vote Application - IBM Blockchain Platform

This application uses the Hyperledger Fabric Gateway method to connect to the IBM Blockchain Platform test network.

## Prerequisites

1. Node.js (v14 or later)
2. OpenSSL (for certificate generation)
3. IBM Cloud account (free)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the IBM Blockchain Platform test network:
```bash
setup-ibp-test-network.bat
```

3. Register for an IBM Cloud account:
   - Go to https://cloud.ibm.com/registration
   - Create a free account
   - Get your API key from the IBM Cloud dashboard

4. Start the server:
```bash
node src/blockchain/fabric-server.js
```

## Configuration

The application is configured to connect to the IBM Blockchain Platform test network:

- Channel: `mychannel`
- Chaincode: `voting`
- Organization: `Org1`
- MSP ID: `Org1MSP`

## API Endpoints

- `GET /api/status`: Check connection status
- `POST /api/votes`: Create a new vote
- `POST /api/votes/:id/cast`: Cast a vote
- `GET /api/votes/:id`: Get vote results

## Using the IBM Test Network

1. The test network provides:
   - A running Fabric network
   - Pre-configured channels
   - Sample chaincodes
   - Free access for development

2. To deploy your chaincode:
   - Use the IBM Blockchain Platform console
   - Package and install your chaincode
   - Approve and commit the chaincode definition

## Security

- All certificates are stored in the `wallet` directory
- TLS is enabled for all network connections
- Admin identity is required for all operations

## Troubleshooting

1. If connection fails:
   - Check your IBM Cloud API key
   - Verify certificate paths in `gateway-config.yaml`
   - Ensure the wallet contains valid certificates

2. If transactions fail:
   - Check if the chaincode is installed and instantiated
   - Verify channel configuration
   - Check network logs in the IBM Blockchain Platform console
