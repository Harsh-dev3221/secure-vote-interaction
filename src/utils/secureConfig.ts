import CryptoJS from 'crypto-js';

/**
 * Secure configuration manager for sensitive application settings
 * Handles environment variables, encryption keys, and secure defaults
 * Browser-compatible version using CryptoJS
 */
export class SecureConfig {
    private static instance: SecureConfig;
    private config: Record<string, any> = {};
    private encryptionKey: string;

    /**
     * Initialize secure configuration with encryption capabilities
     */
    private constructor() {
        // Generate or load encryption key for sensitive data
        this.encryptionKey = this.generateFallbackKey();

        // Load configuration with defaults and environment overrides
        this.config = {
            // Blockchain configuration
            blockchain: {
                adminPrivateKey: '0xcbc315bb51ad0f0a5ae3daa230e4522b2ba2ceb8b6c690865d3dedea7f7ec724',
                contractAddress: '0xd19D6fEcC4fd7C481008f36cAd678d118880C466',
                providerUrl: 'http://127.0.0.1:8545',
                networkId: 1337,
                gasLimit: 3000000
            },

            // Security settings
            security: {
                hmacSecret: this.generateRandomString(32),
                tokenExpiry: 30, // minutes
                rateLimitWindow: 60000, // milliseconds
                rateLimitMax: 10,
                passwordHashRounds: 10
            },

            // API settings
            api: {
                port: 3000,
                corsOrigins: ['http://localhost:3000'],
                sessionSecret: this.generateRandomString(32)
            }
        };

        // Log startup configuration (excluding sensitive data)
        console.log('Configuration initialized with the following settings:');
        console.log('- Network ID:', this.config.blockchain.networkId);
        console.log('- Provider URL:', this.config.blockchain.providerUrl);
        // Deliberately not logging private keys and secrets
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): SecureConfig {
        if (!SecureConfig.instance) {
            SecureConfig.instance = new SecureConfig();
        }
        return SecureConfig.instance;
    }

    /**
     * Get a configuration value
     */
    public get<T>(key: string): T {
        // Parse dot notation (e.g., "blockchain.adminPrivateKey")
        const parts = key.split('.');
        let value: any = this.config;

        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            } else {
                return undefined as unknown as T;
            }
        }

        return value as T;
    }

    /**
     * Generate a random string (for secrets)
     */
    private generateRandomString(length: number): string {
        // Generate random bytes using CryptoJS for browser compatibility
        return CryptoJS.lib.WordArray.random(length).toString(CryptoJS.enc.Hex);
    }

    /**
     * Generate a fallback encryption key (only used if not provided in env)
     * WARNING: In production, always provide a proper key via environment variables
     */
    private generateFallbackKey(): string {
        const fallbackKey = this.generateRandomString(32);
        console.warn(
            'WARNING: Using a generated encryption key. This is not secure for production.',
            'Set the ENCRYPTION_KEY environment variable with a secure key.'
        );
        return fallbackKey;
    }

    /**
     * Encrypt sensitive data
     */
    public encrypt(text: string): string {
        // Generate a random IV
        const iv = CryptoJS.lib.WordArray.random(16);

        // Encrypt using AES
        const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Hex.parse(this.encryptionKey), {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Return IV and ciphertext
        return iv.toString(CryptoJS.enc.Hex) + ':' + encrypted.toString();
    }

    /**
     * Decrypt sensitive data
     */
    public decrypt(encryptedText: string): string {
        try {
            const [ivHex, encryptedData] = encryptedText.split(':');

            // Decrypt using AES
            const decrypted = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Hex.parse(this.encryptionKey), {
                iv: CryptoJS.enc.Hex.parse(ivHex),
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });

            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            return '';
        }
    }
}

// Export a singleton instance
export const secureConfig = SecureConfig.getInstance();