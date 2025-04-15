import { createHash, createHmac, randomBytes } from 'crypto';

/**
 * Custom security module for voting system
 * Implements cryptographic functions and security utilities
 */
export class CryptoUtils {
    // Secret key for HMAC operations - in production, this should be in environment variables
    private static readonly SECRET_KEY = process.env.HMAC_SECRET || 'secure-voting-secret-key-change-in-production';

    // Salt length for hashing operations
    private static readonly SALT_LENGTH = 16;

    /**
     * Generate a secure hash of an Aadhar number with salting
     * Uses SHA-256 algorithm with a unique salt for each Aadhar
     */
    static secureHashAadhar(aadharNumber: string): { hash: string; salt: string } {
        // Generate random salt
        const salt = this.generateRandomSalt();

        // Create SHA-256 hash with salt
        const hash = createHash('sha256')
            .update(salt + aadharNumber)
            .digest('hex');

        return { hash, salt };
    }

    /**
     * Verify an Aadhar hash with its original salt
     */
    static verifyAadharHash(aadharNumber: string, salt: string, storedHash: string): boolean {
        const computedHash = createHash('sha256')
            .update(salt + aadharNumber)
            .digest('hex');

        return computedHash === storedHash;
    }

    /**
     * Generate a digital signature for a vote transaction
     * Uses HMAC-SHA256 to create an authentication code
     */
    static generateVoteSignature(candidateId: number, aadharHash: string, timestamp: number): string {
        const dataToSign = `${aadharHash}:${candidateId}:${timestamp}`;

        return createHmac('sha256', this.SECRET_KEY)
            .update(dataToSign)
            .digest('hex');
    }

    /**
     * Verify a vote signature to prevent tampering
     */
    static verifyVoteSignature(
        signature: string,
        candidateId: number,
        aadharHash: string,
        timestamp: number
    ): boolean {
        const expectedSignature = this.generateVoteSignature(candidateId, aadharHash, timestamp);
        return signature === expectedSignature;
    }

    /**
     * Generate a secure token with expiration for session management
     */
    static generateSecureToken(data: string, expiryMinutes: number = 30): { token: string; expires: number } {
        const expires = Date.now() + expiryMinutes * 60 * 1000;
        const tokenData = `${data}:${expires}`;

        const token = createHmac('sha256', this.SECRET_KEY)
            .update(tokenData)
            .digest('hex');

        return { token, expires };
    }

    /**
     * Verify a secure token and check if it's still valid
     */
    static verifySecureToken(token: string, data: string, expires: number): boolean {
        if (Date.now() > expires) {
            return false; // Token expired
        }

        const tokenData = `${data}:${expires}`;
        const expectedToken = createHmac('sha256', this.SECRET_KEY)
            .update(tokenData)
            .digest('hex');

        return token === expectedToken;
    }

    /**
     * Generate a random salt for hashing
     */
    private static generateRandomSalt(): string {
        return randomBytes(this.SALT_LENGTH).toString('hex');
    }

    /**
     * Obfuscate an Aadhar number for logging (show only last 4 digits)
     */
    static obfuscateAadhar(aadharNumber: string): string {
        if (aadharNumber.length < 4) return '****';
        return '********' + aadharNumber.slice(-4);
    }
}

/**
 * Rate limiting implementation to prevent brute force attacks
 */
export class RateLimiter {
    private requests: Map<string, number[]> = new Map();
    private readonly windowMs: number;
    private readonly maxRequests: number;

    constructor(windowMs: number = 60000, maxRequests: number = 10) {
        this.windowMs = windowMs;
        this.maxRequests = maxRequests;
    }

    /**
     * Check if a request from an IP should be rate limited
     */
    isRateLimited(ip: string): boolean {
        const now = Date.now();

        // Get existing timestamps for this IP
        const timestamps = this.requests.get(ip) || [];

        // Filter timestamps to only include those within the current window
        const recentTimestamps = timestamps.filter(timestamp => now - timestamp < this.windowMs);

        // Update the timestamps for this IP
        this.requests.set(ip, [...recentTimestamps, now]);

        // Check if the request count exceeds the maximum allowed
        return recentTimestamps.length >= this.maxRequests;
    }

    /**
     * Reset the rate limit for an IP
     */
    resetLimit(ip: string): void {
        this.requests.delete(ip);
    }
}

/**
 * Security audit logger for tracking sensitive operations
 */
export class SecurityAuditLogger {
    /**
     * Log a security event with pertinent details
     */
    static logSecurityEvent(
        eventType: 'LOGIN' | 'VOTE' | 'VALIDATION_FAILURE' | 'RATE_LIMIT' | 'SUSPICIOUS_ACTIVITY',
        details: Record<string, any>,
        ipAddress: string
    ): void {
        // Sanitize sensitive data
        const sanitizedDetails = { ...details };

        if (sanitizedDetails.aadharNumber) {
            sanitizedDetails.aadharNumber = CryptoUtils.obfuscateAadhar(sanitizedDetails.aadharNumber);
        }

        const logEntry = {
            timestamp: new Date().toISOString(),
            eventType,
            ipAddress,
            ...sanitizedDetails
        };

        // In production, you would log to a secure audit database or service
        // For now, we'll log to console in JSON format
        console.log(`SECURITY_AUDIT: ${JSON.stringify(logEntry)}`);
    }
} 