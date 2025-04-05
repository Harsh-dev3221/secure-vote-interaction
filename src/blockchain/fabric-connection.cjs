'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function getContract() {
    try {
        // Check if we're running in WSL or Windows
        const isWSL = fs.existsSync('/proc/version') &&
            fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');

        let ccpPath, walletPath;

        if (isWSL) {
            // WSL paths
            ccpPath = '/home/vote/hyperledger/fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
            walletPath = '/home/vote/hyperledger/fabric/fabric-samples/test-network/wallet';
        } else {
            // Windows paths
            ccpPath = path.resolve(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            walletPath = path.resolve(__dirname, '..', '..', 'wallet');

            // Check if the connection profile exists
            if (!fs.existsSync(ccpPath)) {
                // Try WSL path via Windows path mapping
                ccpPath = path.resolve('D:\\wsl\\Ubuntu-22.04\\home\\vote\\hyperledger\\fabric\\fabric-samples\\test-network\\organizations\\peerOrganizations\\org1.example.com\\connection-org1.json');
                walletPath = path.resolve('D:\\wsl\\Ubuntu-22.04\\home\\vote\\hyperledger\\fabric\\fabric-samples\\test-network\\wallet');

                // If still doesn't exist, try another common location
                if (!fs.existsSync(ccpPath)) {
                    console.log("Connection profile not found, trying alternative paths...");
                    // Try a direct WSL path
                    ccpPath = '\\\\wsl$\\Ubuntu-22.04\\home\\vote\\hyperledger\\fabric\\fabric-samples\\test-network\\organizations\\peerOrganizations\\org1.example.com\\connection-org1.json';
                    walletPath = '\\\\wsl$\\Ubuntu-22.04\\home\\vote\\hyperledger\\fabric\\fabric-samples\\test-network\\wallet';
                }
            }
        }

        // Check if the connection profile exists
        if (!fs.existsSync(ccpPath)) {
            console.error(`Connection profile not found at ${ccpPath}`);
            return null;
        }

        console.log(`Using connection profile at: ${ccpPath}`);
        console.log(`Using wallet at: ${walletPath}`);

        // Load connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        console.log("Connection profile loaded successfully");

        // Create a wallet
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log("Wallet initialized");

        // Check for identity in wallet
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('No identity found - please enroll admin and register user first');
            return null;
        }
        console.log("User identity found in wallet");

        // Gateway connection
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });
        console.log("Connected to gateway successfully");

        // Get network and contract
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('voting');
        console.log("Connected to channel 'mychannel' and chaincode 'voting'");

        return {
            contract,
            gateway,
            disconnect: () => gateway.disconnect()
        };
    } catch (error) {
        console.error(`Failed to connect to gateway: ${error}`);
        return null;
    }
}

module.exports = {
    getContract
}; 