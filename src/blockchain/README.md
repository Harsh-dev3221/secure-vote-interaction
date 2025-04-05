# Hyperledger Fabric Integration for Secure Voting

This directory contains the implementation of a Hyperledger Fabric blockchain network for the secure voting application.

## Structure

- `chaincode/` - Contains the smart contract (chaincode) implementation
- `config/` - Configuration files for the Hyperledger Fabric network
- `scripts/` - Helper scripts for starting and managing the network
- `server.js` - A simple Express server that simulates the Fabric API

## Development

To start the development environment:

```bash
# Start the development server
npm run fabric:dev

# Start both React app and Fabric server
npm run dev:all
```

## Features

1. **No Gas Fees**: Transactions are processed without gas fees
2. **Private & Permissioned**: Only authorized entities can participate
3. **Vote Privacy**: Votes are recorded with privacy in mind
4. **Receipt Verification**: Each vote generates a verifiable receipt
5. **Auditable**: Results can be audited by authorized parties

## API Endpoints

- **POST /api/voters/register** - Register a voter by Aadhaar number
- **POST /api/votes/cast** - Cast a vote
- **GET /api/elections/:electionId/results** - Get election results
- **GET /api/receipts/:receiptCode** - Verify a vote receipt

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