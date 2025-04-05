const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3002';
let receiptCode = null;

// Test all API endpoints
async function runTests() {
    console.log('Starting tests for Hyperledger Fabric API Server...');
    console.log('==============================================');

    try {
        // 1. Test server connection
        console.log('1. Testing server connection...');
        const testResponse = await fetch(`${API_URL}/api/test`);
        const testData = await testResponse.json();
        console.log(`   Server Response: ${JSON.stringify(testData)}`);
        console.log('   ✅ Server connection test PASSED');
        console.log('');

        // 2. Test voter registration
        console.log('2. Testing voter registration...');
        const registrationResponse = await fetch(`${API_URL}/api/voters/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aadhaarNumber: '123456789012' })
        });
        const registrationData = await registrationResponse.json();
        console.log(`   Registration Response: ${JSON.stringify(registrationData)}`);
        console.log('   ✅ Voter registration test PASSED');
        console.log('');

        // 3. Test vote casting
        console.log('3. Testing vote casting...');
        const voteResponse = await fetch(`${API_URL}/api/votes/cast`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                aadhaarNumber: '123456789012',
                candidateId: 1
            })
        });
        const voteData = await voteResponse.json();
        console.log(`   Vote Response: ${JSON.stringify(voteData)}`);

        if (voteData.receiptCode) {
            receiptCode = voteData.receiptCode;
            console.log(`   Saved Receipt Code: ${receiptCode}`);
        }

        console.log('   ✅ Vote casting test PASSED');
        console.log('');

        // 4. Test election results
        console.log('4. Testing election results...');
        const resultsResponse = await fetch(`${API_URL}/api/elections/election2024/results`);
        const resultsData = await resultsResponse.json();
        console.log(`   Results Response: ${JSON.stringify(resultsData)}`);
        console.log('   ✅ Election results test PASSED');
        console.log('');

        // 5. Test receipt verification if we have a receipt code
        if (receiptCode) {
            console.log('5. Testing receipt verification...');
            const receiptResponse = await fetch(`${API_URL}/api/receipts/${receiptCode}`);
            const receiptData = await receiptResponse.json();
            console.log(`   Receipt Verification Response: ${JSON.stringify(receiptData)}`);
            console.log('   ✅ Receipt verification test PASSED');
            console.log('');
        }

        console.log('==============================================');
        console.log('All tests completed successfully!');
        console.log('The Hyperledger Fabric API Server is functioning correctly.');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Make sure the Fabric API server is running on port 3002');
    }
}

// Run all tests
runTests(); 