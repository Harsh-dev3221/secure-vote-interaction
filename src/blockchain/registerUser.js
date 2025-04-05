'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
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
            return;
        }

        console.log(`Using connection profile at: ${ccpPath}`);
        console.log(`Using wallet at: ${walletPath}`);

        // Load the connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a wallet for managing identities
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if user already exists
        const userIdentity = await wallet.get('appUser');
        if (userIdentity) {
            console.log('An identity for the user "appUser" already exists in the wallet');
            return;
        }

        // Check if admin exists
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Build a CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a provider to use the admin identity
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register and enroll the user
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: 'appUser',
            role: 'client'
        }, adminUser);

        const enrollment = await ca.enroll({
            enrollmentID: 'appUser',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        await wallet.put('appUser', x509Identity);
        console.log('Successfully registered and enrolled user "appUser" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "appUser": ${error}`);
        process.exit(1);
    }
}

main(); 