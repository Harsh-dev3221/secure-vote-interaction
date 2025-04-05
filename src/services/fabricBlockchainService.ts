import * as crypto from 'crypto';
import { useToast } from "@/hooks/use-toast";

// This is a placeholder service that simulates interacting with Hyperledger Fabric
// In a real implementation, you would use the fabric-network SDK
// Since we can't directly interact with Fabric from a browser, this would be handled by a backend API

// API URL for the Fabric server
const API_URL = 'http://localhost:3002';

// Mock connection profiles and identities
const ELECTION_ID = 'election2024';

// Hash voter ID (Aadhaar number) for privacy
export function hashVoterId(aadhaarNumber: string): string {
    return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
}

// Register a voter for the election
export async function registerVoter(aadhaarNumber: string): Promise<{ success: boolean, error?: string }> {
    try {
        // Call the backend API
        const response = await fetch(`${API_URL}/api/voters/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber })
        });

        return await response.json();
    } catch (error: any) {
        console.error("Error registering voter:", error);
        return { success: false, error: error.message };
    }
}

// Cast a vote on the blockchain
export async function castVote(aadhaarNumber: string, candidateId: number): Promise<{
    success: boolean,
    receiptCode?: string,
    transactionId?: string,
    error?: string
}> {
    try {
        console.log(`Submitting vote to Hyperledger Fabric for candidate ${candidateId}`);
        console.log(`Using API endpoint: ${API_URL}/api/votes/cast`);

        // Call the backend API
        const response = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber, candidateId })
        });

        const data = await response.json();
        console.log('Vote submission response:', data);
        return data;
    } catch (error: any) {
        console.error("Error casting vote:", error);
        console.error("API endpoint:", `${API_URL}/api/votes/cast`);
        console.error("Request data:", { aadhaarNumber: "***masked***", candidateId });
        return { success: false, error: error.message };
    }
}

// Get election results
export async function getElectionResults(): Promise<{
    success: boolean,
    results?: Array<{ candidateId: string, name: string, party: string, voteCount: number }>,
    error?: string
}> {
    try {
        // Call the backend API
        const response = await fetch(`${API_URL}/api/elections/${ELECTION_ID}/results`);
        return await response.json();
    } catch (error: any) {
        console.error("Error getting election results:", error);
        return { success: false, error: error.message };
    }
}

// Verify a vote receipt
export async function verifyReceipt(receiptCode: string): Promise<{
    success: boolean,
    verified?: boolean,
    timestamp?: string,
    error?: string
}> {
    try {
        // Call the backend API
        const response = await fetch(`${API_URL}/api/receipts/${receiptCode}`);
        return await response.json();
    } catch (error: any) {
        console.error("Error verifying receipt:", error);
        return { success: false, error: error.message };
    }
}

// Check if Fabric connection is available
export function isFabricAvailable(): boolean {
    // Try to connect to the server asynchronously, but return optimistic result immediately
    fetch(`${API_URL}/api/elections/${ELECTION_ID}/results`)
        .then(() => true)
        .catch(() => console.warn("Fabric server not available"));

    return true; // Optimistic response
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