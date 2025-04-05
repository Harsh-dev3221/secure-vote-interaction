#!/bin/bash
# Script to download Hyperledger Fabric binaries and Docker images

# Create temp directory
mkdir -p /tmp/fabric-download
cd /tmp/fabric-download

# Download Fabric samples, binaries, and Docker images
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.2.3 1.5.0

# Create bin directory in our project
mkdir -p ../../blockchain/bin

# Copy binaries to our project
cp -r ./fabric-samples/bin/* ../../blockchain/bin/

# Copy configuration templates 
mkdir -p ../../blockchain/config/templates
cp -r ./fabric-samples/config/* ../../blockchain/config/templates/

echo "Hyperledger Fabric binaries downloaded successfully" 