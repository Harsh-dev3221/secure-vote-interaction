/**
 * Custom Aadhar validation module with enhanced security features
 * Implements the Verhoeff algorithm for checksum validation
 */
export class AadharValidator {
    // Multiplication table for Verhoeff algorithm
    private static readonly d: number[][] = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    // Permutation table for Verhoeff algorithm
    private static readonly p: number[][] = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    // Inverse table for Verhoeff algorithm
    private static readonly inv: number[] = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

    /**
     * Validates an Aadhar number using multiple checks
     */
    static validateAadhar(aadharNumber: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Basic format check (12 digits)
        if (!this.isValidFormat(aadharNumber)) {
            errors.push('Aadhar number must be exactly 12 digits');
            return { isValid: false, errors };
        }

        // Check for common test numbers
        if (this.isTestNumber(aadharNumber)) {
            errors.push('Test Aadhar numbers are not allowed');
            return { isValid: false, errors };
        }

        // Check for sequential or repeated digits
        if (this.hasSequentialOrRepeatedDigits(aadharNumber)) {
            errors.push('Invalid Aadhar pattern detected');
            return { isValid: false, errors };
        }

        // Verhoeff algorithm checksum validation
        if (!this.verhoeffValidation(aadharNumber)) {
            errors.push('Checksum validation failed');
            return { isValid: false, errors };
        }

        // All validations passed
        return { isValid: true, errors: [] };
    }

    /**
     * Basic format validation
     */
    private static isValidFormat(aadharNumber: string): boolean {
        return /^\d{12}$/.test(aadharNumber);
    }

    /**
     * Check for known test numbers
     */
    private static isTestNumber(aadharNumber: string): boolean {
        const testNumbers = [
            '000000000000',
            '111111111111',
            '222222222222',
            '333333333333',
            '444444444444',
            '555555555555',
            '666666666666',
            '777777777777',
            '888888888888',
            '999999999999',
            '123456789012'
        ];

        return testNumbers.includes(aadharNumber);
    }

    /**
     * Check for suspicious patterns
     */
    private static hasSequentialOrRepeatedDigits(aadharNumber: string): boolean {
        // Check for more than 6 consecutive identical digits
        const repeatedPattern = /(\d)\\1{5,}/;
        if (repeatedPattern.test(aadharNumber)) {
            return true;
        }

        // Check for sequential digits (e.g., 123456)
        let sequential = 0;
        for (let i = 1; i < aadharNumber.length; i++) {
            const current = parseInt(aadharNumber[i]);
            const previous = parseInt(aadharNumber[i - 1]);

            if (current === previous + 1 || (previous === 9 && current === 0)) {
                sequential++;
                if (sequential >= 5) { // 6 digits in sequence
                    return true;
                }
            } else {
                sequential = 0;
            }
        }

        return false;
    }

    /**
     * Verhoeff algorithm for checksum validation
     * This is a sophisticated algorithm that can detect most common transcription errors
     */
    private static verhoeffValidation(aadharNumber: string): boolean {
        // For demo purposes, assuming all valid Aadhar numbers pass this check
        // In a real implementation, this would use the actual Verhoeff algorithm
        // to validate the checksum digit

        let c = 0;
        const digits = aadharNumber.split('').map(Number).reverse();

        for (let i = 0; i < digits.length; i++) {
            c = this.d[c][this.p[i % 8][digits[i]]];
        }

        return c === 0;
    }
}

/**
 * Anti-spoofing detection for Aadhar verification
 * Provides additional security against fraud attempts
 */
export class AntiSpoofingDetector {
    // Records of suspicious activity
    private static suspiciousIps = new Set<string>();
    private static failedAttempts = new Map<string, number>();

    /**
     * Check for suspicious patterns in submission behavior
     */
    static checkForSuspiciousActivity(
        ipAddress: string,
        aadharNumber: string,
        userAgent: string
    ): { isSuspicious: boolean; reason?: string } {
        // Check if IP is already marked as suspicious
        if (this.suspiciousIps.has(ipAddress)) {
            return { isSuspicious: true, reason: 'IP previously marked as suspicious' };
        }

        // Check for multiple failed attempts
        const attempts = this.failedAttempts.get(ipAddress) || 0;
        if (attempts >= 3) {
            this.suspiciousIps.add(ipAddress);
            return { isSuspicious: true, reason: 'Multiple failed verification attempts' };
        }

        // Additional checks could be implemented here, such as:
        // - Abnormal voting timing patterns
        // - Unusual user agent strings
        // - Geolocation inconsistencies

        return { isSuspicious: false };
    }

    /**
     * Record a failed verification attempt
     */
    static recordFailedAttempt(ipAddress: string): void {
        const attempts = this.failedAttempts.get(ipAddress) || 0;
        this.failedAttempts.set(ipAddress, attempts + 1);
    }

    /**
     * Reset suspicious status for an IP
     */
    static clearSuspiciousStatus(ipAddress: string): void {
        this.suspiciousIps.delete(ipAddress);
        this.failedAttempts.delete(ipAddress);
    }
} 