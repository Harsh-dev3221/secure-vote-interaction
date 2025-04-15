import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load environment variables
dotenv.config();

/**
 * Secure configuration manager for sensitive application settings
 * Handles environment variables, encryption keys, and secure defaults
 */
export class SecureConfig {
    private static instance: SecureConfig;
    private config: Record<string, any> = {};
    private encryptionKey: Buffer;

    /**
     * Initialize secure configuration with encryption capabilities
     */
    private constructor() {
        // Generate or load encryption key for sensitive data
        const keyString = process.env.ENCRYPTION_KEY || this.generateFallbackKey();
        this.encryptionKey = Buffer.from(keyString, 'hex');

        // Load configuration with defaults and environment overrides
        this.config = {
            // Blockchain configuration
            blockchain: {
                adminPrivateKey: this.getEnv('ADMIN_PRIVATE_KEY', '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
                contractAddress: this.getEnv('CONTRACT_ADDRESS', '0xD8459cc85e702D3e3504c3a25fe5c5A015Bab842'),
                providerUrl: this.getEnv('PROVIDER_URL', 'http://127.0.0.1:7545'),
                networkId: parseInt(this.getEnv('NETWORK_ID', '1337')),
                gasLimit: parseInt(this.getEnv('GAS_LIMIT', '3000000'))
            },

            // Security settings
            security: {
                hmacSecret: this.getEnv('HMAC_SECRET', this.generateRandomString(32)),
                tokenExpiry: parseInt(this.getEnv('TOKEN_EXPIRY', '30')), // minutes
                rateLimitWindow: parseInt(this.getEnv('RATE_LIMIT_WINDOW', '60000')), // milliseconds
                rateLimitMax: parseInt(this.getEnv('RATE_LIMIT_MAX', '10')),
                passwordHashRounds: parseInt(this.getEnv('PASSWORD_HASH_ROUNDS', '10'))
            },

            // API settings
            api: {
                port: parseInt(this.getEnv('PORT', '3000')),
                corsOrigins: this.getEnv('CORS_ORIGINS', 'http://localhost:3000').split(','),
                sessionSecret: this.getEnv('SESSION_SECRET', this.generateRandomString(32))
            }
        };

        // Log startup configuration (excluding sensitive data)
        console.log('Configuration initialized with the following settings:');
        console.log('- API Port:', this.config.api.port);
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
     * Get environment variable with fallback
     */
    private getEnv(key: string, defaultValue: string): string {
        return process.env[key] || defaultValue;
    }

    /**
     * Generate a random string (for secrets)
     */
    private generateRandomString(length: number): string {
        return crypto.randomBytes(length).toString('hex');
    }

    /**
     * Generate a fallback encryption key (only used if not provided in env)
     * WARNING: In production, always provide a proper key via environment variables
     */
    private generateFallbackKey(): string {
        const fallbackKey = crypto.randomBytes(32).toString('hex');
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
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', this.encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypt sensitive data
     */
    public decrypt(encryptedText: string): string {
        const [ivHex, encryptedData] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', this.encryptionKey, iv);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }
}

// Export a singleton instance
export const secureConfig = SecureConfig.getInstance(); 