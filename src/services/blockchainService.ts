import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import VotingABI from '../../blockchain/artifacts/contracts/Voting.sol/Voting.json';
import { CryptoUtils, SecurityAuditLogger } from "../utils/securityUtils";
import { AadharValidator, AntiSpoofingDetector } from "../utils/aadharValidator";
import { secureConfig } from "../utils/secureConfig";

// Smart contract ABI (Application Binary Interface)
// This is a placeholder and should be replaced with your actual contract ABI after deployment
const electionContractABI = [
  // Sample ABI for a voting contract
  "function castVote(uint256 candidateId) public",
  "function getCandidateVoteCount(uint256 candidateId) public view returns (uint256)"
];

// Use secure configuration for contract address and admin private key
const VOTING_CONTRACT_ADDRESS = secureConfig.get<string>('blockchain.contractAddress');
const ADMIN_PRIVATE_KEY = secureConfig.get<string>('blockchain.adminPrivateKey');

// Database to store vote records and hashed Aadhar information
// In a real application, this would be a proper database
interface VoteRecord {
  aadharHash: string;
  salt: string;
  candidateId: number;
  timestamp: number;
  signature: string;
  transactionHash?: string;
}

/**
 * Enhanced BlockchainService with security features
 */
class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private adminWallet: ethers.Wallet;
  private contract: ethers.Contract;
  private voteRecords: VoteRecord[] = [];
  private static instance: BlockchainService;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    // Connect to blockchain provider
    this.provider = new ethers.JsonRpcProvider(secureConfig.get<string>('blockchain.providerUrl'));

    // Initialize admin wallet securely
    this.adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, this.provider);

    // Initialize contract with admin wallet
    this.contract = new ethers.Contract(
      VOTING_CONTRACT_ADDRESS,
      VotingABI.abi,
      this.adminWallet
    );

    console.log("BlockchainService initialized and connected to provider");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService();
    }
    return BlockchainService.instance;
  }

  /**
   * Cast a vote securely using advanced security measures
   */
  async castVote(candidateId: number, aadharNumber: string, ipAddress: string): Promise<any> {
    try {
      // Step 1: Advanced Aadhar validation
      const validation = AadharValidator.validateAadhar(aadharNumber);
      if (!validation.isValid) {
        SecurityAuditLogger.logSecurityEvent(
          'VALIDATION_FAILURE',
          {
            aadharNumber,
            candidateId,
            errors: validation.errors
          },
          ipAddress
        );
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Step 2: Anti-spoofing check
      const spoofingCheck = AntiSpoofingDetector.checkForSuspiciousActivity(
        ipAddress,
        aadharNumber,
        'browser-user-agent' // In real app, get this from request
      );

      if (spoofingCheck.isSuspicious) {
        SecurityAuditLogger.logSecurityEvent(
          'SUSPICIOUS_ACTIVITY',
          {
            aadharNumber,
            reason: spoofingCheck.reason
          },
          ipAddress
        );
        return {
          success: false,
          error: 'Suspicious activity detected. Please try again later.'
        };
      }

      // Step 3: Secure hashing of Aadhar
      const { hash: aadharHash, salt } = CryptoUtils.secureHashAadhar(aadharNumber);

      // Step 4: Check if this Aadhar hash has already voted
      const existingVote = this.voteRecords.find(record => record.aadharHash === aadharHash);
      if (existingVote) {
        SecurityAuditLogger.logSecurityEvent(
          'VOTE',
          {
            aadharNumber,
            status: 'DUPLICATE'
          },
          ipAddress
        );
        return {
          success: false,
          error: 'This Aadhar number has already been used to vote'
        };
      }

      // Step 5: Generate a unique blockchain address from the Aadhar hash
      const aadharDerivedAddress = this.generateBlockchainAddressFromHash(aadharHash);

      // Step 6: Check if this address has already voted on the blockchain
      const hasVoted = await this.contract.hasVoted(aadharDerivedAddress);
      if (hasVoted) {
        SecurityAuditLogger.logSecurityEvent(
          'VOTE',
          {
            aadharNumber,
            status: 'BLOCKCHAIN_DUPLICATE'
          },
          ipAddress
        );
        return {
          success: false,
          error: 'This Aadhar number has already been used to vote on the blockchain'
        };
      }

      // Step 7: Create digital signature for the vote
      const timestamp = Date.now();
      const signature = CryptoUtils.generateVoteSignature(candidateId, aadharHash, timestamp);

      // Step 8: Record vote details before blockchain transaction
      const voteRecord: VoteRecord = {
        aadharHash,
        salt,
        candidateId,
        timestamp,
        signature
      };
      this.voteRecords.push(voteRecord);

      // Step 9: Cast the vote on the blockchain
      // In a real application with Aadhar, you would use a secure oracle or validator
      // to verify the Aadhar before allowing the vote
      const tx = await this.contract.vote(candidateId);
      const receipt = await tx.wait();

      // Step 10: Update record with transaction hash
      const recordIndex = this.voteRecords.findIndex(record => record.aadharHash === aadharHash);
      if (recordIndex >= 0) {
        this.voteRecords[recordIndex].transactionHash = receipt.hash;
      }

      // Step 11: Log the successful vote
      SecurityAuditLogger.logSecurityEvent(
        'VOTE',
        {
          aadharNumber,
          candidateId,
          status: 'SUCCESS',
          transactionHash: receipt.hash
        },
        ipAddress
      );

      // Return success response
      return {
        success: true,
        transactionHash: receipt.hash,
        signature: signature
      };
    } catch (error: any) {
      // Log the error
      console.error("Error in castVote:", error);
      SecurityAuditLogger.logSecurityEvent(
        'VOTE',
        {
          aadharNumber,
          candidateId,
          status: 'ERROR',
          error: error.message
        },
        ipAddress
      );

      // Record failed attempt for rate limiting
      AntiSpoofingDetector.recordFailedAttempt(ipAddress);

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all candidates and their vote counts
   */
  async getCandidates(): Promise<any> {
    try {
      const candidateCount = await this.contract.getCandidateCount();
      const candidates = [];

      for (let i = 0; i < Number(candidateCount); i++) {
        const candidate = await this.contract.getCandidate(i);
        candidates.push({
          id: i,
          name: candidate[0], // First return value is name
          voteCount: candidate[1].toString() // Second return value is voteCount
        });
      }

      return {
        success: true,
        candidates
      };
    } catch (error: any) {
      console.error("Error in getCandidates:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if an Aadhar number has already been used to vote
   */
  async hasVoted(aadharNumber: string, ipAddress: string): Promise<any> {
    try {
      // First validate the Aadhar
      const validation = AadharValidator.validateAadhar(aadharNumber);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      // Generate hash of Aadhar
      const { hash: aadharHash } = CryptoUtils.secureHashAadhar(aadharNumber);

      // Check local records first
      const existingVote = this.voteRecords.find(record => record.aadharHash === aadharHash);
      if (existingVote) {
        return {
          success: true,
          hasVoted: true,
          voteDetails: {
            timestamp: existingVote.timestamp,
            candidateId: existingVote.candidateId
          }
        };
      }

      // If not found locally, check the blockchain as a fallback
      const aadharDerivedAddress = this.generateBlockchainAddressFromHash(aadharHash);
      const voted = await this.contract.hasVoted(aadharDerivedAddress);

      return {
        success: true,
        hasVoted: voted
      };
    } catch (error: any) {
      console.error("Error in hasVoted:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate a vote signature to prevent tampering
   */
  verifyVoteSignature(signature: string, candidateId: number, aadharNumber: string, timestamp: number): boolean {
    // Generate Aadhar hash
    const { hash: aadharHash } = CryptoUtils.secureHashAadhar(aadharNumber);

    // Verify the signature
    return CryptoUtils.verifyVoteSignature(signature, candidateId, aadharHash, timestamp);
  }

  /**
   * Generate a blockchain address from an Aadhar hash
   */
  private generateBlockchainAddressFromHash(aadharHash: string): string {
    // Create a deterministic address from the hash
    const derivedAddress = ethers.getAddress('0x' + aadharHash.slice(-40));
    return derivedAddress;
  }
}

// Export as singleton instance
export const blockchainService = BlockchainService.getInstance();

// For compatibility with existing code, provide these functions
export function isEthereumProviderAvailable() {
  // Always return true since we're using the admin wallet approach
  return true;
}

export function getActiveBlockchain() {
  // Return a default value for compatibility
  return "local";
}

export function getPendingVotes() {
  // Return empty array for compatibility
  return [];
}

//