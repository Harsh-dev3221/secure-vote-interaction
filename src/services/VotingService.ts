import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import * as dotenv from 'dotenv';
import { createHash, createHmac, randomBytes } from 'crypto';
import rateLimit from 'express-rate-limit';
import contractABI from '../contracts/VotingContract.json';

// Load environment variables
dotenv.config();

// Environment variables
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const WEB3_PROVIDER = process.env.WEB3_PROVIDER || 'http://localhost:7545';
const SECURITY_KEY = process.env.SECURITY_KEY || randomBytes(32).toString('hex');

// Security constants
const MAX_REQUEST_WINDOW = 15 * 60 * 1000; // 15 minutes
const TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
const MAX_FAILED_ATTEMPTS = 5;

// In-memory security tracker (in production, use Redis or a database)
const securityTracker = {
    failedAttempts: new Map<string, { count: number, lastAttempt: number }>(),
    ipBlacklist: new Set<string>(),
    tokens: new Map<string, { expires: number, aadharHash: string, used: boolean }>()
};

// Create Web3 instance
const web3 = new Web3(WEB3_PROVIDER);

// Set up the contract
const votingContract = new web3.eth.Contract(
    contractABI.abi as AbiItem[],
    CONTRACT_ADDRESS
);

// Configure rate limiter middleware
export const apiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' }
});

// Security utility functions
const generateToken = (): { token: string, expires: number } => {
    const token = randomBytes(32).toString('hex');
    const expires = Date.now() + TOKEN_EXPIRY;
    return { token, expires };
};

const createSignature = (data: any): string => {
    const hmac = createHmac('sha256', SECURITY_KEY);
    hmac.update(JSON.stringify(data));
    return hmac.digest('hex');
};

const verifySignature = (signature: string, data: any): boolean => {
    const expectedSignature = createSignature(data);
    return signature === expectedSignature;
};

const hashAadhar = (aadharNumber: string): string => {
    return createHash('sha256').update(aadharNumber + SECURITY_KEY).digest('hex');
};

const recordFailedAttempt = (identifier: string): boolean => {
    const now = Date.now();
    const record = securityTracker.failedAttempts.get(identifier) || { count: 0, lastAttempt: now };

    // Reset if last attempt was outside our window
    if (now - record.lastAttempt > MAX_REQUEST_WINDOW) {
        record.count = 1;
        record.lastAttempt = now;
        securityTracker.failedAttempts.set(identifier, record);
        return false;
    }

    // Increment count and update time
    record.count += 1;
    record.lastAttempt = now;
    securityTracker.failedAttempts.set(identifier, record);

    // Block if too many attempts
    if (record.count >= MAX_FAILED_ATTEMPTS) {
        return true;
    }

    return false;
};

const checkSecurityBlock = (ipAddress: string, aadharNumber?: string): boolean => {
    // Check IP blacklist
    if (securityTracker.ipBlacklist.has(ipAddress)) {
        return true;
    }

    // Check failed attempts for IP
    if (securityTracker.failedAttempts.has(ipAddress)) {
        const record = securityTracker.failedAttempts.get(ipAddress)!;
        if (record.count >= MAX_FAILED_ATTEMPTS && Date.now() - record.lastAttempt < MAX_REQUEST_WINDOW) {
            return true;
        }
    }

    // Check failed attempts for Aadhar if provided
    if (aadharNumber) {
        const aadharIdentifier = `aadhar_${hashAadhar(aadharNumber)}`;
        if (securityTracker.failedAttempts.has(aadharIdentifier)) {
            const record = securityTracker.failedAttempts.get(aadharIdentifier)!;
            if (record.count >= MAX_FAILED_ATTEMPTS && Date.now() - record.lastAttempt < MAX_REQUEST_WINDOW) {
                return true;
            }
        }
    }

    return false;
};

// Service methods
export class VotingService {

    // Get all candidates
    async getCandidates() {
        try {
            const candidateCount = await votingContract.methods.candidateCount().call();
            const candidates = [];

            for (let i = 1; i <= candidateCount; i++) {
                const candidate = await votingContract.methods.candidates(i).call();
                candidates.push({
                    id: candidate.id,
                    name: candidate.name,
                    voteCount: candidate.voteCount
                });
            }

            return { success: true, candidates };
        } catch (error) {
            console.error('Error fetching candidates:', error);
            return { success: false, error: 'Failed to fetch candidates' };
        }
    }

    // Check if a voter has already voted
    async hasVoted(aadharNumber: string, ipAddress: string) {
        try {
            // Security check
            if (checkSecurityBlock(ipAddress, aadharNumber)) {
                return { success: false, error: 'Security block in effect', statusCode: 403 };
            }

            // Validate Aadhar format
            if (!this.validateAadhar(aadharNumber)) {
                const aadharIdentifier = `aadhar_invalid_${ipAddress}`;
                const blocked = recordFailedAttempt(aadharIdentifier);
                if (blocked) {
                    securityTracker.ipBlacklist.add(ipAddress);
                }
                return { success: false, error: 'Invalid Aadhar number format', statusCode: 400 };
            }

            // Hash the Aadhar number to create a unique identifier
            const hashedAadhar = hashAadhar(aadharNumber);

            // Check if this Aadhar has already voted
            const hasVoted = await votingContract.methods.voters(hashedAadhar).call();

            return { success: true, hasVoted };
        } catch (error) {
            console.error('Error checking if voted:', error);
            return { success: false, error: 'Failed to check voter status' };
        }
    }

    // Cast a vote
    async castVote(candidateId: number, aadharNumber: string, ipAddress: string) {
        try {
            // Security check
            if (checkSecurityBlock(ipAddress, aadharNumber)) {
                return { success: false, error: 'Security block in effect', statusCode: 403 };
            }

            // Validate Aadhar format
            if (!this.validateAadhar(aadharNumber)) {
                const aadharIdentifier = `aadhar_invalid_${ipAddress}`;
                recordFailedAttempt(aadharIdentifier);
                return { success: false, error: 'Invalid Aadhar number format', statusCode: 400 };
            }

            // Hash the Aadhar number to create a unique identifier
            const hashedAadhar = hashAadhar(aadharNumber);

            // Check if this Aadhar has already voted
            const hasVoted = await votingContract.methods.voters(hashedAadhar).call();
            if (hasVoted) {
                const aadharIdentifier = `aadhar_${hashedAadhar}`;
                recordFailedAttempt(aadharIdentifier);
                return { success: false, error: 'This Aadhar number has already voted', statusCode: 409 };
            }

            // Prepare the transaction
            const adminAccount = web3.eth.accounts.privateKeyToAccount(ADMIN_PRIVATE_KEY);
            web3.eth.accounts.wallet.add(adminAccount);

            const gasEstimate = await votingContract.methods.vote(candidateId, hashedAadhar).estimateGas({ from: adminAccount.address });

            // Execute the transaction
            const receipt = await votingContract.methods.vote(candidateId, hashedAadhar).send({
                from: adminAccount.address,
                gas: Math.floor(gasEstimate * 1.2) // Add 20% buffer for gas estimation
            });

            // Generate a secure token for this vote
            const { token, expires } = generateToken();

            // Store token (in production, use a more persistent storage)
            securityTracker.tokens.set(token, {
                expires,
                aadharHash: hashedAadhar,
                used: false
            });

            // Create a signature for verification
            const signatureData = {
                candidateId,
                aadharHash: hashedAadhar,
                timestamp: Date.now()
            };
            const signature = createSignature(signatureData);

            // Clear any failed attempts for this Aadhar
            const aadharIdentifier = `aadhar_${hashedAadhar}`;
            securityTracker.failedAttempts.delete(aadharIdentifier);

            return {
                success: true,
                transactionHash: receipt.transactionHash,
                signature,
                token,
                expires
            };
        } catch (error) {
            console.error('Error casting vote:', error);
            return { success: false, error: 'Failed to cast vote' };
        }
    }

    // Verify a vote
    async verifyVote(data: {
        signature: string,
        candidateId: number,
        aadharNumber: string,
        timestamp: number,
        token: string,
        expires: number
    }, ipAddress: string) {
        try {
            // Security check
            if (checkSecurityBlock(ipAddress, data.aadharNumber)) {
                return { success: false, error: 'Security block in effect', statusCode: 403 };
            }

            // Check if token exists and is valid
            const tokenData = securityTracker.tokens.get(data.token);
            if (!tokenData) {
                recordFailedAttempt(ipAddress);
                return { success: false, error: 'Invalid token', statusCode: 400 };
            }

            // Check if token has expired
            if (Date.now() > tokenData.expires || Date.now() > data.expires) {
                recordFailedAttempt(ipAddress);
                return { success: false, error: 'Token has expired', statusCode: 400 };
            }

            // Check if token has been used
            if (tokenData.used) {
                recordFailedAttempt(ipAddress);
                return { success: false, error: 'Token has already been used', statusCode: 400 };
            }

            // Hash the Aadhar number
            const hashedAadhar = hashAadhar(data.aadharNumber);

            // Verify token matches Aadhar
            if (tokenData.aadharHash !== hashedAadhar) {
                recordFailedAttempt(ipAddress);
                return { success: false, error: 'Token does not match Aadhar', statusCode: 400 };
            }

            // Verify the signature
            const signatureData = {
                candidateId: data.candidateId,
                aadharHash: hashedAadhar,
                timestamp: data.timestamp
            };

            const isValidSignature = verifySignature(data.signature, signatureData);
            if (!isValidSignature) {
                recordFailedAttempt(ipAddress);
                return { success: false, error: 'Invalid signature', statusCode: 400 };
            }

            // Mark token as used
            tokenData.used = true;
            securityTracker.tokens.set(data.token, tokenData);

            return { success: true, verified: true };
        } catch (error) {
            console.error('Error verifying vote:', error);
            return { success: false, error: 'Failed to verify vote' };
        }
    }

    // Validate Aadhar format (basic validation for 12 digits)
    private validateAadhar(aadharNumber: string): boolean {
        return /^\d{12}$/.test(aadharNumber);
    }
}

export default new VotingService(); 