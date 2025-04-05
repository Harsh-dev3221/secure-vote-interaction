import * as crypto from 'crypto';
import { useToast } from "@/hooks/use-toast";

// This service interacts with the Hyperledger Fabric API
// The backend API server acts as middleware between the frontend and the blockchain

// API URL for the Fabric server
const API_URL = 'http://localhost:3002';

// Election ID
const ELECTION_ID = 'election2024';

// Track server availability
let serverAvailable = false;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_INTERVAL = 5000; // 5 seconds

// Hash voter ID (Aadhaar number) for privacy
export function hashVoterId(aadhaarNumber: string): string {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Check server connectivity with timeout
async function checkServerConnectivity(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_URL}/api/test`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            console.log("Server status:", data.status);
            serverAvailable = true;
            return true;
        }

        serverAvailable = false;
        return false;
    } catch (error) {
        console.warn("Fabric server connectivity check failed:", error);
        serverAvailable = false;
        return false;
    }
}

// Register a voter for the election
export async function registerVoter(aadhaarNumber: string): Promise<{ success: boolean, error?: string, message?: string }> {
    // Check server connectivity if needed
    if (!serverAvailable && Date.now() - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
        lastConnectionAttempt = Date.now();
        await checkServerConnectivity();
    }

    if (!serverAvailable) {
        console.warn("Fabric server not available for voter registration");
        return {
            success: false,
            error: "Blockchain server is not available",
            message: "Unable to connect to the blockchain network. Please try again later."
        };
    }

    try {
        // Call the backend API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/api/voters/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return await response.json();
    } catch (error: any) {
        console.error("Error registering voter:", error);
        // Check if it's an abort error (timeout)
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: "Request timed out",
                message: "Blockchain network is slow to respond. Please try again."
            };
        }
        return {
            success: false,
            error: error.message,
            message: "Unable to complete voter registration. Please try again."
        };
    }
}

// Cast a vote on the blockchain
export async function castVote(aadhaarNumber: string, candidateId: number): Promise<{
    success: boolean,
    receiptCode?: string,
    transactionId?: string,
    error?: string,
    message?: string
}> {
    // Check server connectivity if needed
    if (!serverAvailable && Date.now() - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
        lastConnectionAttempt = Date.now();
        await checkServerConnectivity();
    }

    if (!serverAvailable) {
        console.warn("Fabric server not available for vote casting");
        return {
            success: false,
            error: "Blockchain server is not available",
            message: "Unable to connect to the blockchain network. Please try again later."
        };
    }

    try {
        console.log(`Submitting vote to Hyperledger Fabric for candidate ${candidateId}`);
        console.log(`Using API endpoint: ${API_URL}/api/votes/cast`);

        // Call the backend API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds for vote casting

        const response = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber, candidateId }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const data = await response.json();
        console.log('Vote submission response:', data);

        // Update server availability status
        serverAvailable = true;

        return data;
    } catch (error: any) {
        console.error("Error casting vote:", error);
        console.error("API endpoint:", `${API_URL}/api/votes/cast`);
        console.error("Request data:", { aadhaarNumber: "***masked***", candidateId });

        // Check if it's an abort error (timeout)
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: "Request timed out",
                message: "Vote submission is taking longer than expected. Your vote may still be processed."
            };
        }

        return {
            success: false,
            error: error.message,
            message: "Unable to cast your vote at this time. Please try again."
        };
    }
}

// Get election results
export async function getElectionResults(): Promise<{
    success: boolean,
    election?: any,
    error?: string,
    message?: string
}> {
    // Check server connectivity if needed
    if (!serverAvailable && Date.now() - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
        lastConnectionAttempt = Date.now();
        await checkServerConnectivity();
    }

    if (!serverAvailable) {
        console.warn("Fabric server not available for election results");
        return {
            success: false,
            error: "Blockchain server is not available",
            message: "Unable to retrieve election results. Please try again later."
        };
    }

    try {
        // Call the backend API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/api/elections/${ELECTION_ID}/results`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Update server availability status
        serverAvailable = true;

        return await response.json();
    } catch (error: any) {
        console.error("Error getting election results:", error);

        // Check if it's an abort error (timeout)
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: "Request timed out",
                message: "Unable to retrieve election results due to network delay."
            };
        }

        return {
            success: false,
            error: error.message,
            message: "Failed to load election results. Please try again."
        };
    }
}

// Verify a vote receipt
export async function verifyReceipt(receiptCode: string): Promise<{
    success: boolean,
    receipt?: any,
    error?: string,
    message?: string
}> {
    // Check server connectivity if needed
    if (!serverAvailable && Date.now() - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
        lastConnectionAttempt = Date.now();
        await checkServerConnectivity();
    }

    if (!serverAvailable) {
        console.warn("Fabric server not available for receipt verification");
        return {
            success: false,
            error: "Blockchain server is not available",
            message: "Unable to verify receipt. Please try again later."
        };
    }

    try {
        // Call the backend API with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${API_URL}/api/receipts/${receiptCode}`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Update server availability status
        serverAvailable = true;

        return await response.json();
    } catch (error: any) {
        console.error("Error verifying receipt:", error);

        // Check if it's an abort error (timeout)
        if (error.name === 'AbortError') {
            return {
                success: false,
                error: "Request timed out",
                message: "Receipt verification is taking longer than expected."
            };
        }

        return {
            success: false,
            error: error.message,
            message: "Failed to verify receipt. Please try again."
        };
    }
}

// Check if Fabric connection is available
export function isFabricAvailable(): boolean {
    // Check connectivity if we haven't checked recently
    if (Date.now() - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
        lastConnectionAttempt = Date.now();
        checkServerConnectivity()
            .then(available => {
                console.log(`Fabric server is ${available ? 'available' : 'not available'}`);
                serverAvailable = available;
            })
            .catch(() => {
                console.warn("Fabric server availability check failed");
                serverAvailable = false;
            });
    }

    return serverAvailable;
}

// Get server status details
export async function getServerStatus(): Promise<{
    available: boolean,
    status?: string,
    mode?: string
}> {
    try {
        const available = await checkServerConnectivity();

        if (!available) {
            return {
                available: false
            };
        }

        const response = await fetch(`${API_URL}/api/test`);
        const data = await response.json();

        return {
            available: true,
            status: data.status,
            mode: data.status.includes('REAL') ? 'REAL' : 'MOCK'
        };
    } catch (error) {
        return {
            available: false
        };
    }
}

// Hook for displaying toast notifications during blockchain operations
export function useBlockchainStatus() {
    const { toast } = useToast();

    const showBlockchainError = (message: string) => {
        toast({
            title: "Blockchain Error",
            description: message,
            variant: "destructive",
        });
    };

    const showBlockchainSuccess = (message: string) => {
        toast({
            title: "Success",
            description: message,
        });
    };

    return { showBlockchainError, showBlockchainSuccess };
} 