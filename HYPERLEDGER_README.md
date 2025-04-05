# Hyperledger Fabric Integration for Secure Voting

This project implements a secure voting system using Hyperledger Fabric as the underlying blockchain technology. It provides two modes of operation:

1. **Mock Mode** - For development and testing without a real Fabric network
2. **Real Mode** - For connecting to an actual Hyperledger Fabric network

## Current Status

The project is currently set up with a fully functional **Mock Mode** that simulates all Hyperledger Fabric operations. This allows for development and testing of the application without requiring a real blockchain network.

The **Real Mode** implementation is complete and ready to be used once a Hyperledger Fabric network is properly set up.

## Project Structure

```
secure-vote-interaction/
├── src/
│   ├── blockchain/
│   │   ├── server.cjs             # Mock Fabric API server
│   │   ├── server-real.cjs        # Real Fabric API server
│   │   ├── fabric-connection.cjs  # Fabric SDK connector
│   │   ├── enrollAdmin.cjs        # Admin enrollment script
│   │   ├── registerUser.cjs       # User registration script
│   │   ├── connection-org1.json   # Connection profile for Org1
│   │   └── test-api.cjs           # Test script for API endpoints
│   └── services/
│       └── fabricBlockchainService.ts  # Frontend service for Fabric
├── voting-chaincode/              # Chaincode implementation
├── HYPERLEDGER_IMPLEMENTATION.md  # Implementation details
├── HYPERLEDGER_DEPLOYMENT.md      # Deployment instructions
└── wallet/                        # Identity storage
```

## Running in Mock Mode

The mock mode is perfect for development and doesn't require any blockchain infrastructure. It simulates blockchain operations with in-memory storage.

```bash
# Start the server in mock mode
npm run fabric:dev

# Test the API endpoints
npm run fabric:test
```

## Running in Real Mode

To run with a real Hyperledger Fabric network:

1. Follow the setup instructions in `HYPERLEDGER_DEPLOYMENT.md`
2. Start the server with:

```bash
npm run fabric:real
```

## Testing

The test script works with both mock and real modes:

```bash
npm run fabric:test
```

## Security Considerations

The mock implementation provides a functional demo but lacks the security guarantees of a real blockchain:

| Feature | Mock Mode | Real Mode |
|---------|-----------|-----------|
| Immutability | ❌ In-memory storage | ✅ Blockchain-backed |
| Distributed consensus | ❌ Single server | ✅ Multiple organizations |
| Identity management | ❌ Simulated | ✅ Certificate-based |
| Data privacy | ❌ Basic | ✅ Channel-based isolation |
| Auditability | ❌ Limited | ✅ Full transaction history |

## Transitioning from Mock to Real

When transitioning from mock to real mode:

1. Set up the Hyperledger Fabric network as described in `HYPERLEDGER_DEPLOYMENT.md`
2. Deploy the chaincode
3. Set up identities with the enrollment scripts
4. Start the server in real mode with `npm run fabric:real`

No changes are needed to the frontend code - it will work with either mode transparently.

## Next Steps

1. Complete the Hyperledger Fabric network setup
2. Enhance the chaincode with additional features
3. Implement proper identity verification for voters
4. Add monitoring and logging for the network

## References

- [Hyperledger Fabric Documentation](https://hyperledger-fabric.readthedocs.io/)
- [Fabric Node.js SDK](https://hyperledger.github.io/fabric-sdk-node/) 