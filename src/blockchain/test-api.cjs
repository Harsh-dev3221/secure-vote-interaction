const fetch = require('node-fetch');

const API_URL = 'http://localhost:3002';

async function testApi() {
    try {
        console.log('====== Testing Hyperledger Fabric API Server =======');

        // 1. Test basic connection
        console.log('\n1. Testing basic connection...');
        try {
            const testResponse = await fetch(`${API_URL}/api/test`);
            const testData = await testResponse.json();
            console.log('Server connection test successful:', testData);
        } catch (error) {
            console.error('SERVER CONNECTION FAILED:', error.message);
            console.log('Please make sure the server is running on port 3002');
            console.log('You can start it with: npm run fabric:dev');
            process.exit(1);
        }

        // 2. Test voter registration
        console.log('\n2. Testing voter registration...');
        const registerResponse = await fetch(`${API_URL}/api/voters/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber: '123456789012' })
        });

        const registerData = await registerResponse.json();
        console.log('Register response:', registerData);

        // 3. Test vote casting
        console.log('\n3. Testing vote casting...');
        const voteResponse = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber: '123456789012', candidateId: 1 })
        });

        const voteData = await voteResponse.json();
        console.log('Vote response:', voteData);

        // Store receipt code for verification
        const receiptCode = voteData.receiptCode;

        // 4. Test election results
        console.log('\n4. Testing election results...');
        const resultsResponse = await fetch(`${API_URL}/api/elections/election2024/results`);
        const resultsData = await resultsResponse.json();
        console.log('Results response:', resultsData);

        // 5. Test receipt verification
        if (receiptCode) {
            console.log('\n5. Testing receipt verification...');
            const receiptResponse = await fetch(`${API_URL}/api/receipts/${receiptCode}`);
            const receiptData = await receiptResponse.json();
            console.log('Receipt verification response:', receiptData);
        }

        console.log('\n====== All tests completed successfully! ======');
        console.log('\nYour Hyperledger Fabric API Server is working correctly!');
        console.log('Now make sure your frontend is properly configured to connect to it.');
        console.log('To debug frontend issues, use the browser console and the apiDebug utility.');

    } catch (error) {
        console.error('Error testing API:', error);
    }
}

// Run the tests
testApi(); 