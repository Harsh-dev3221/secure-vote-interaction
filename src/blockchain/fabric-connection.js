'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function getContract() {
    try {
        // Load connection profile
        const ccpPath = path.resolve(__dirname, 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a wallet
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Identity in wallet?
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('No identity found - please enroll admin and register user first');
            return null;
        }

        // Gateway connection
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'appUser',
            discovery: { enabled: true, asLocalhost: true }
        });

        // Get network and contract
        const network = await gateway.getNetwork('votingchannel');
        const contract = network.getContract('voting');

        return {
            contract,
            gateway,
            disconnect: () => gateway.disconnect()
        };
    } catch (error) {
        console.error(`Failed to connect to gateway: ${error}`);
        throw error;
    }
}

module.exports = {
    getContract
}; 