/**
 * Utility for debugging API calls
 */

// API URL for the Fabric server
const API_URL = 'http://localhost:3002';

/**
 * Tests the connection to the Fabric API server
 */
export async function testFabricConnection(): Promise<boolean> {
    try {
        console.log('Testing Fabric API server connection...');
        const response = await fetch(`${API_URL}/api/test`);
        const data = await response.json();
        console.log('Fabric API server response:', data);
        return true;
    } catch (error) {
        console.error('Failed to connect to Fabric API server:', error);
        return false;
    }
}

/**
 * Make a test vote request to the Fabric API server
 */
export async function testVoteSubmission(): Promise<any> {
    try {
        console.log('Testing vote submission to Fabric API server...');
        const response = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                aadhaarNumber: '123456789012',
                candidateId: 1
            })
        });

        const data = await response.json();
        console.log('Vote submission test response:', data);
        return data;
    } catch (error) {
        console.error('Failed to test vote submission:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Gets the current election results from the Fabric API server
 */
export async function getElectionResults(): Promise<any> {
    try {
        console.log('Getting election results from Fabric API server...');
        const response = await fetch(`${API_URL}/api/elections/election2024/results`);
        const data = await response.json();
        console.log('Election results:', data);
        return data;
    } catch (error) {
        console.error('Failed to get election results:', error);
        return { success: false, error: error.message };
    }
}

// Export an object for easy debugging in the browser console
const apiDebug = {
    testConnection: testFabricConnection,
    testVote: testVoteSubmission,
    getResults: getElectionResults,
    apiUrl: API_URL
};

// Add to window object for browser console access
if (typeof window !== 'undefined') {
    (window as any).apiDebug = apiDebug;
}

export default apiDebug; 