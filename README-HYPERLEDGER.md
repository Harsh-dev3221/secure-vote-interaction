# Secure Vote Application with Hyperledger Fabric

This project implements a secure voting system using Hyperledger Fabric as the underlying blockchain technology. The implementation follows a hybrid approach that allows for both development/testing and production usage.

## Implementation Overview

The Hyperledger Fabric integration consists of:

1. **Smart Contract (Chaincode)**: A JavaScript implementation of voting logic
2. **API Server**: An Express.js server that interfaces with the Fabric network
3. **Frontend Integration**: React components that communicate with the API

## Key Features

- **Gas-free Transactions**: Unlike Ethereum, Hyperledger Fabric doesn't require gas fees
- **Private Permissioned Network**: Only authorized entities can participate
- **Transaction Privacy**: Votes are recorded with privacy in mind
- **Receipt Verification**: Each vote generates a verifiable receipt code
- **Auditable Results**: Election results can be verified by authorized parties

## Development Mode (Mock Server)

For development and testing, the application includes a mock implementation that simulates Hyperledger Fabric:

```bash
# Start the mock server
npm run fabric:dev

# Test the API with the mock server
npm run fabric:test
```

The mock server stores data in-memory but provides identical API endpoints to the real implementation.

## Production Mode (Real Fabric Network)

For production deployment with a real Hyperledger Fabric network:

```bash
# Start the server with real Fabric connection
npm run fabric:real
```

### Setting Up the Real Network

Detailed instructions for setting up the Hyperledger Fabric network are provided in:

1. [Implementation Details](./HYPERLEDGER_IMPLEMENTATION.md)
2. [Deployment Guide](./HYPERLEDGER_DEPLOYMENT.md)

## Client Integration

The frontend integrates with the blockchain through the `fabricBlockchainService.ts` service, which handles API communication. The same service works with both mock and real implementations.

## Directory Structure

```
secure-vote-interaction/
├── src/
│   ├── blockchain/              # Blockchain API server
│   │   ├── server.cjs           # Mock implementation
│   │   ├── server-real.cjs      # Real Fabric implementation
│   │   └── test-api.cjs         # API test script
│   ├── services/
│   │   └── fabricBlockchainService.ts  # Frontend service
│   └── components/              # React components
├── voting-chaincode/            # Fabric chaincode
├── wallet/                      # Identity storage for Fabric
└── docs/                        # Documentation
```

## Security Considerations

The Hyperledger Fabric implementation provides several security advantages:

1. **Immutability**: Once recorded, votes cannot be changed
2. **Consensus**: Multiple validators ensure transaction integrity
3. **Access Control**: Only authorized users can perform specific actions
4. **Auditability**: All transactions create an audit trail
5. **Privacy**: Sensitive voter data is protected

## Current Status

- ✅ Chaincode implementation complete
- ✅ Mock API server fully functional
- ✅ Real server implementation ready
- ✅ Frontend integration complete
- 🔄 Network setup documentation prepared
- 🔄 Full Fabric network setup pending

## Next Steps

1. Complete the Hyperledger Fabric network setup
2. Add enhanced identity verification
3. Implement private data collections for sensitive voter information
4. Add comprehensive monitoring and logging
5. Conduct security audits

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the mock server: `npm run fabric:dev`
4. Start the frontend: `npm run dev`
5. Test the API: `npm run fabric:test`

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Hyperledger Fabric SDK for Node.js](https://hyperledger.github.io/fabric-sdk-node/)
- [Hyperledger Fabric Chaincode Node](https://hyperledger.github.io/fabric-chaincode-node/) 