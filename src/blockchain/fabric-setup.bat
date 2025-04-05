@echo off
echo Installing Hyperledger Fabric dependencies...
npm install fabric-network fabric-ca-client

echo Creating wallet directory...
mkdir wallet

echo.
echo To start working with Hyperledger Fabric:
echo 1. Make sure your Fabric network is running
echo 2. Run node enrollAdmin.js to set up admin identity
echo 3. Run node registerUser.js to set up app user
echo 4. Start the API server with: npm run fabric:dev
echo. 