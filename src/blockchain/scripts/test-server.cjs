// Test script for the Fabric API server
const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002';

async function testServer() {
    try {
        // Test the endpoints
        console.log('Testing server connection...');

        // 1. Register a voter
        console.log('\nTesting voter registration...');
        const registerResponse = await fetch(`${API_URL}/api/voters/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber: '123456789012' })
        });

        const registerData = await registerResponse.json();
        console.log('Register response:', registerData);

        // 2. Cast a vote
        console.log('\nTesting vote casting...');
        const voteResponse = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber: '123456789012', candidateId: 1 })
        });

        const voteData = await voteResponse.json();
        console.log('Vote response:', voteData);

        // 3. Get election results
        console.log('\nTesting election results...');
        const resultsResponse = await fetch(`${API_URL}/api/elections/election2024/results`);
        const resultsData = await resultsResponse.json();
        console.log('Results response:', resultsData);

        // 4. Verify receipt
        if (voteData.receiptCode) {
            console.log('\nTesting receipt verification...');
            const receiptResponse = await fetch(`${API_URL}/api/receipts/${voteData.receiptCode}`);
            const receiptData = await receiptResponse.json();
            console.log('Receipt verification response:', receiptData);
        }

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Error testing server:', error);
    }
}

testServer(); 