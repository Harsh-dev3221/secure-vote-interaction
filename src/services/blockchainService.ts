
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";

// Smart contract ABI (Application Binary Interface)
// This is a placeholder and should be replaced with your actual contract ABI after deployment
const electionContractABI = [
  // Sample ABI for a voting contract
  "function castVote(uint256 candidateId) public",
  "function getCandidateVoteCount(uint256 candidateId) public view returns (uint256)"
];

// Contract addresses - replace with your actual deployed contract addresses
const ELECTION_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual address after deployment

// Blockchain configuration
export const blockchainConfig = {
  networkName: "Sepolia Test Network", // or your preferred network
  chainId: 11155111, // Sepolia chain ID (use appropriate ID for your target network)
  blockExplorerUrl: "https://sepolia.etherscan.io",
};

/**
 * Connects to Ethereum provider - either injected MetaMask or a fallback provider
 */
export async function getEthereumProvider() {
  if (window.ethereum) {
    // Connect to MetaMask
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      return provider;
    } catch (error) {
      console.error("Failed to connect to MetaMask:", error);
      throw new Error("Failed to connect to MetaMask");
    }
  } else {
    // Fallback to a public RPC endpoint for read-only operations
    // In production, use your own Infura/Alchemy endpoint
    return new ethers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");
  }
}

/**
 * Requests user to connect their wallet
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Please install MetaMask.");
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    return accounts[0];
  } catch (error) {
    console.error("User denied account access", error);
    throw new Error("User denied account access");
  }
}

/**
 * Gets the election contract instance
 */
export async function getElectionContract(withSigner = false) {
  const provider = await getEthereumProvider();
  
  if (withSigner) {
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask.");
    }
    
    // Get signer for transactions that modify state
    const signer = await provider.getSigner();
    return new ethers.Contract(ELECTION_CONTRACT_ADDRESS, electionContractABI, signer);
  }
  
  // For read-only operations
  return new ethers.Contract(ELECTION_CONTRACT_ADDRESS, electionContractABI, provider);
}

/**
 * Submits a vote to the blockchain
 */
export async function submitVoteToBlockchain(candidateId: number) {
  try {
    const contract = await getElectionContract(true);
    const tx = await contract.castVote(candidateId);
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error) {
    console.error("Error submitting vote to blockchain:", error);
    throw error;
  }
}

/**
 * Check if MetaMask or another Ethereum provider is installed
 */
export function isEthereumProviderAvailable() {
  return window.ethereum !== undefined;
}

// Add for TypeScript support
declare global {
  interface Window {
    ethereum?: any;
  }
}
