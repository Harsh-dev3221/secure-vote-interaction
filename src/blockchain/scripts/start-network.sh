#!/bin/bash
# Script to start the Hyperledger Fabric test network

# Navigate to test-network directory
cd /tmp/fabric-download/fabric-samples/test-network

# Bring down any running networks
./network.sh down

# Start the network with CouchDB
./network.sh up createChannel -c electionchannel -s couchdb

# Deploy the voting chaincode
./network.sh deployCC -ccn voting -ccp ../../../secure-vote-interaction/src/blockchain/chaincode/voting -ccl javascript

echo "Network started successfully with channel 'electionchannel'"
echo "Chaincode 'voting' has been deployed" 