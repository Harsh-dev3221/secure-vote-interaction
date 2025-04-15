import express from 'express';
import { blockchainService } from '../services/blockchainService';
import { CryptoUtils, SecurityAuditLogger, RateLimiter } from '../utils/securityUtils';
import { AadharValidator, AntiSpoofingDetector } from '../utils/aadharValidator';

const router = express.Router();

// Initialize rate limiter
const rateLimiter = new RateLimiter(60000, 5); // 5 requests per minute

// Middleware to protect all routes from rate limiting
router.use((req, res, next) => {
    const ipAddress = req.ip || '0.0.0.0';

    // Check if request should be rate limited
    if (rateLimiter.isRateLimited(ipAddress)) {
        SecurityAuditLogger.logSecurityEvent(
            'RATE_LIMIT',
            { endpoint: req.path },
            ipAddress
        );

        return res.status(429).json({
            success: false,
            error: 'Too many requests. Please try again later.'
        });
    }

    next();
});

// Get all candidates
router.get('/candidates', async (req, res) => {
    try {
        const result = await blockchainService.getCandidates();
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Cast a vote with enhanced security
router.post('/cast-vote', async (req, res) => {
    const ipAddress = req.ip || '0.0.0.0';

    try {
        const { candidateId, aadharNumber } = req.body;

        // Generate a secure token for this vote request
        const { token, expires } = CryptoUtils.generateSecureToken(
            `${aadharNumber}:${candidateId}`,
            5 // expires in 5 minutes
        );

        // Comprehensive validation
        // First, validate Aadhar format
        if (!aadharNumber || aadharNumber.length !== 12 || !/^\d+$/.test(aadharNumber)) {
            SecurityAuditLogger.logSecurityEvent(
                'VALIDATION_FAILURE',
                {
                    aadharNumber: CryptoUtils.obfuscateAadhar(aadharNumber),
                    reason: 'Invalid Aadhar format'
                },
                ipAddress
            );

            return res.status(400).json({
                success: false,
                error: 'Invalid Aadhar number. Must be 12 digits.'
            });
        }

        // Advanced Aadhar validation
        const validation = AadharValidator.validateAadhar(aadharNumber);
        if (!validation.isValid) {
            SecurityAuditLogger.logSecurityEvent(
                'VALIDATION_FAILURE',
                {
                    aadharNumber: CryptoUtils.obfuscateAadhar(aadharNumber),
                    errors: validation.errors
                },
                ipAddress
            );

            return res.status(400).json({
                success: false,
                error: validation.errors.join(', ')
            });
        }

        // Check for suspicious activity
        const spoofCheck = AntiSpoofingDetector.checkForSuspiciousActivity(
            ipAddress,
            aadharNumber,
            req.headers['user-agent'] || 'unknown'
        );

        if (spoofCheck.isSuspicious) {
            SecurityAuditLogger.logSecurityEvent(
                'SUSPICIOUS_ACTIVITY',
                {
                    aadharNumber: CryptoUtils.obfuscateAadhar(aadharNumber),
                    reason: spoofCheck.reason
                },
                ipAddress
            );

            return res.status(403).json({
                success: false,
                error: 'Security check failed. Please try again later.'
            });
        }

        // Cast the vote using the enhanced service with IP address
        const result = await blockchainService.castVote(candidateId, aadharNumber, ipAddress);

        if (result.success) {
            // Add the security token to the response
            res.json({
                ...result,
                token,
                expires
            });
        } else {
            res.status(500).json(result);
        }
    } catch (error: any) {
        console.error("Error in cast-vote endpoint:", error);

        SecurityAuditLogger.logSecurityEvent(
            'VOTE',
            {
                status: 'ERROR',
                error: error.message
            },
            ipAddress
        );

        res.status(500).json({ success: false, error: error.message });
    }
});

// Check if an Aadhar number has already voted
router.get('/has-voted/:aadhar', async (req, res) => {
    const ipAddress = req.ip || '0.0.0.0';

    try {
        const { aadhar } = req.params;

        // Validate Aadhar number
        if (!aadhar || aadhar.length !== 12 || !/^\d+$/.test(aadhar)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Aadhar number. Must be 12 digits.'
            });
        }

        // Check for suspicious activity
        const spoofCheck = AntiSpoofingDetector.checkForSuspiciousActivity(
            ipAddress,
            aadhar,
            req.headers['user-agent'] || 'unknown'
        );

        if (spoofCheck.isSuspicious) {
            return res.status(403).json({
                success: false,
                error: 'Security check failed. Please try again later.'
            });
        }

        const result = await blockchainService.hasVoted(aadhar, ipAddress);
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error: any) {
        console.error("Error in has-voted endpoint:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify the authenticity of a vote (new endpoint)
router.post('/verify-vote', async (req, res) => {
    try {
        const { signature, candidateId, aadharNumber, timestamp, token, expires } = req.body;

        // Verify security token
        const isValidToken = CryptoUtils.verifySecureToken(
            token,
            `${aadharNumber}:${candidateId}`,
            expires
        );

        if (!isValidToken) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }

        // Verify vote signature
        const isValidSignature = blockchainService.verifyVoteSignature(
            signature,
            candidateId,
            aadharNumber,
            timestamp
        );

        return res.json({
            success: true,
            verified: isValidSignature
        });
    } catch (error: any) {
        console.error("Error in verify-vote endpoint:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router; 