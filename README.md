# Secure Voting System with Blockchain Integration

A secure voting application that uses Aadhar-based identity verification and blockchain technology for transparent, tamper-proof vote recording.

## Project Structure

The project has been cleaned and optimized to focus only on the essential files needed for the Ganache blockchain integration. The current implementation uses the first Ganache account as both the contract address and transaction signer - creating a simplified but functional blockchain voting experience.

## Project Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will run at http://localhost:8080/ or http://localhost:8081/

## Blockchain Integration (Ganache)

This application connects to a local Ganache blockchain instance running on port 7545.

### How to Setup:

1. Make sure Ganache is running on port 7545
2. Access the update page: http://localhost:8080/updateContract.html (or :8081)
3. Click the "Use First Account as Contract" button to update the contract address
4. Navigate back to the main application

### Implementation Details:

- **Demo Mode**: The application uses the first Ganache account (with 100 ETH) as both the contract address and the transaction signer
- **Aadhar to Wallet Mapping**: Each Aadhar number gets deterministically mapped to a wallet address
- **Real Transactions**: Each vote creates a real transaction on the Ganache blockchain
- **Transaction Verification**: You can see the transactions in the Ganache UI

## Important Files

- `src/services/ganacheService.ts` - Main service for Ganache blockchain interaction
- `src/services/aadharWalletService.ts` - Maps Aadhar numbers to blockchain wallets
- `public/updateContract.html` - Helper page to update contract address
- `contracts/Voting.sol` - The original smart contract (reference only)

## Tech Stack

- React with TypeScript
- Vite for build/development
- Ethers.js for blockchain interaction
- Ganache for local blockchain development 