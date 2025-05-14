import { CryptoUtils } from "../utils/securityUtils";

/**
 * Service to securely map Aadhar numbers to blockchain wallet addresses
 * This is a crucial security component that ensures:
 * 1. Aadhar numbers are never stored in plain text
 * 2. Each Aadhar maps deterministically to a specific wallet
 * 3. The mapping is one-way and cannot be reversed
 */
export class AadharWalletService {
  private static instance: AadharWalletService;

  // In-memory mapping of hashed Aadhar to wallet addresses
  // In a production system, this would be stored in a secure database
  private aadharToWalletMap: Map<string, string> = new Map();

  // Ganache wallet addresses (from your screenshot)
  private ganacheWallets: string[] = [
    "0xf2859C2af2b6CF5C6590e6Aed14e649bc524Cb76",
    "0x691A738cb9Aa34CFBbD284A393D2F6DdE5c65617",
    "0x114a924107E83e2351117201658d237Adc7e0De4",
    "0x9eDcDb5F34D7dAd28a7A536651bE730C3ca521C0",
    "0x962e198Ed39C7F12AB48a6b28AA0a06EcB5896C6",
    "0xF5F75d37Fba81439CD2465cC698752d7B1D90972",
    "0xF445c1C96Db6CcfA1418E1B16EA2e1026d6192d2",
    "0x6a8425933707834fd9babB3F70556Aea49b0650D"
  ];

  private constructor() {
    console.log("AadharWalletService initialized");
  }

  public static getInstance(): AadharWalletService {
    if (!AadharWalletService.instance) {
      AadharWalletService.instance = new AadharWalletService();
    }
    return AadharWalletService.instance;
  }

  /**
   * Get a wallet address for an Aadhar number
   * If the Aadhar has been used before, returns the same wallet
   * If it's new, assigns a wallet from the available pool
   */
  public getWalletForAadhar(aadharNumber: string): string {
    // Create a secure hash of the Aadhar number
    const { hash: aadharHash } = CryptoUtils.secureHashAadhar(aadharNumber);

    // Check if we already have a wallet for this Aadhar
    if (this.aadharToWalletMap.has(aadharHash)) {
      const walletAddress = this.aadharToWalletMap.get(aadharHash)!;
      // Return the address - ethers.utils.getAddress will be applied later
      return walletAddress;
    }

    // If not, deterministically assign a wallet based on the hash
    // This ensures the same Aadhar always gets the same wallet
    const walletIndex = parseInt(aadharHash.substring(0, 8), 16) % this.ganacheWallets.length;
    const walletAddress = this.ganacheWallets[walletIndex];

    // Store the mapping
    this.aadharToWalletMap.set(aadharHash, walletAddress);

    console.log(`Mapped Aadhar (hashed: ${aadharHash.substring(0, 8)}...) to wallet: ${walletAddress}`);
    return walletAddress;
  }

  /**
   * Check if an Aadhar number has been assigned a wallet
   */
  public hasWalletMapping(aadharNumber: string): boolean {
    const { hash: aadharHash } = CryptoUtils.secureHashAadhar(aadharNumber);
    return this.aadharToWalletMap.has(aadharHash);
  }

  /**
   * Get all current mappings (for debugging only)
   * In a production system, this would not be exposed
   */
  public getAllMappings(): { aadharHash: string, wallet: string }[] {
    const mappings: { aadharHash: string, wallet: string }[] = [];
    this.aadharToWalletMap.forEach((wallet, aadharHash) => {
      mappings.push({
        aadharHash: aadharHash.substring(0, 8) + '...',
        wallet
      });
    });
    return mappings;
  }
}

// Export singleton instance
export const aadharWalletService = AadharWalletService.getInstance();
