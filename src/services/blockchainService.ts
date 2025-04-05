
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
const POLYGON_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with Polygon contract address

// Blockchain configuration
export const blockchainConfig = {
  // Ethereum (Sepolia) configuration
  ethereum: {
    networkName: "Sepolia Test Network",
    chainId: 11155111, // Sepolia chain ID
    blockExplorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://eth-sepolia.public.blastapi.io",
  },
  // Polygon (Mumbai testnet) configuration
  polygon: {
    networkName: "Polygon Mumbai",
    chainId: 80001, // Mumbai testnet chain ID
    blockExplorerUrl: "https://mumbai.polygonscan.com",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
  }
};

// Track which blockchain to use
let activeBlockchain: "ethereum" | "polygon" = "polygon"; // Default to Polygon for lower fees

/**
 * Sets which blockchain to use
 */
export function setActiveBlockchain(blockchain: "ethereum" | "polygon") {
  activeBlockchain = blockchain;
}

/**
 * Gets current active blockchain
 */
export function getActiveBlockchain() {
  return activeBlockchain;
}

/**
 * Connects to provider for the active blockchain
 */
export async function getEthereumProvider() {
  const config = blockchainConfig[activeBlockchain];
  
  if (window.ethereum) {
    // Connect to MetaMask
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check if we need to switch networks
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(config.chainId)) {
        try {
          // Request network switch
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${config.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If network doesn't exist in wallet, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${config.chainId.toString(16)}`,
                  chainName: config.networkName,
                  rpcUrls: [config.rpcUrl],
                  blockExplorerUrls: [config.blockExplorerUrl],
                  nativeCurrency: {
                    name: activeBlockchain === "ethereum" ? "Ether" : "MATIC",
                    symbol: activeBlockchain === "ethereum" ? "ETH" : "MATIC",
                    decimals: 18
                  }
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      return provider;
    } catch (error) {
      console.error(`Failed to connect to ${activeBlockchain}:`, error);
      throw new Error(`Failed to connect to ${config.networkName}`);
    }
  } else {
    // Fallback to a public RPC endpoint for read-only operations
    return new ethers.JsonRpcProvider(config.rpcUrl);
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
 * Gets the election contract instance for the active blockchain
 */
export async function getElectionContract(withSigner = false) {
  const provider = await getEthereumProvider();
  const contractAddress = activeBlockchain === "ethereum" ? 
    ELECTION_CONTRACT_ADDRESS : POLYGON_CONTRACT_ADDRESS;
  
  if (withSigner) {
    if (!window.ethereum) {
      throw new Error("No Ethereum wallet found. Please install MetaMask.");
    }
    
    // Get signer for transactions that modify state
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, electionContractABI, signer);
  }
  
  // For read-only operations
  return new ethers.Contract(contractAddress, electionContractABI, provider);
}

// For the hybrid approach - store votes in memory/local storage first
interface PendingVote {
  candidateId: number;
  timestamp: number;
  voterAddress?: string; // If available
  voteId: string; // Unique ID for the vote
  submitted: boolean;
}

const PENDING_VOTES_KEY = "PENDING_VOTES";

/**
 * Saves a vote to local storage first (hybrid approach)
 */
export function saveVoteLocally(candidateId: number): string {
  const voteId = `vote_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  const pendingVote: PendingVote = {
    candidateId,
    timestamp: Date.now(),
    voterAddress: window.ethereum ? undefined : undefined, // Can add address if connected
    voteId,
    submitted: false
  };
  
  // Get existing pending votes
  const existingVotesJson = localStorage.getItem(PENDING_VOTES_KEY);
  const existingVotes: PendingVote[] = existingVotesJson ? JSON.parse(existingVotesJson) : [];
  
  // Add the new vote
  existingVotes.push(pendingVote);
  
  // Save back to localStorage
  localStorage.setItem(PENDING_VOTES_KEY, JSON.stringify(existingVotes));
  
  return voteId;
}

/**
 * Get all pending votes that haven't been submitted to blockchain yet
 */
export function getPendingVotes(): PendingVote[] {
  const existingVotesJson = localStorage.getItem(PENDING_VOTES_KEY);
  const allVotes: PendingVote[] = existingVotesJson ? JSON.parse(existingVotesJson) : [];
  return allVotes.filter(vote => !vote.submitted);
}

/**
 * Mark a vote as submitted to blockchain
 */
export function markVoteAsSubmitted(voteId: string) {
  const existingVotesJson = localStorage.getItem(PENDING_VOTES_KEY);
  const existingVotes: PendingVote[] = existingVotesJson ? JSON.parse(existingVotesJson) : [];
  
  const updatedVotes = existingVotes.map(vote => {
    if (vote.voteId === voteId) {
      return { ...vote, submitted: true };
    }
    return vote;
  });
  
  localStorage.setItem(PENDING_VOTES_KEY, JSON.stringify(updatedVotes));
}

/**
 * Submits a vote to the blockchain
 */
export async function submitVoteToBlockchain(candidateId: number) {
  try {
    // First save locally (hybrid approach)
    const voteId = saveVoteLocally(candidateId);
    
    // Then try to submit to blockchain if wallet is available
    if (isEthereumProviderAvailable()) {
      const contract = await getElectionContract(true);
      const tx = await contract.castVote(candidateId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Mark as submitted in local storage
      markVoteAsSubmitted(voteId);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        voteId,
        blockchain: activeBlockchain
      };
    } else {
      // Return successful response for hybrid approach even without blockchain
      return {
        success: true,
        transactionHash: null,
        blockNumber: null,
        voteId,
        blockchain: "hybrid_local"
      };
    }
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

// Batch submit pending votes to blockchain (for admin use)
export async function batchSubmitPendingVotes() {
  if (!isEthereumProviderAvailable()) {
    throw new Error("Ethereum provider needed for batch submission");
  }
  
  const pendingVotes = getPendingVotes();
  const results = [];
  
  for (const vote of pendingVotes) {
    try {
      const contract = await getElectionContract(true);
      const tx = await contract.castVote(vote.candidateId);
      const receipt = await tx.wait();
      
      markVoteAsSubmitted(vote.voteId);
      
      results.push({
        voteId: vote.voteId,
        success: true,
        transactionHash: receipt.hash
      });
    } catch (error) {
      results.push({
        voteId: vote.voteId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Add for TypeScript support
declare global {
  interface Window {
    ethereum?: any;
  }
}
