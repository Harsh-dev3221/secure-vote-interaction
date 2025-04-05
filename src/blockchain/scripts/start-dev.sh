#!/bin/bash
# Script to start the development environment for the Hyperledger Fabric integration

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install express cors body-parser nodemon
fi

# Start the API server
echo "Starting mock Hyperledger Fabric API server..."
npx nodemon src/blockchain/server.js

echo "API server running on port 3001" 