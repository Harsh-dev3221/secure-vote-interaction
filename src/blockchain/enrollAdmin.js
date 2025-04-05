'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
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

        // Create wallet directory if it doesn't exist
        if (!fs.existsSync(walletPath)) {
            try {
                fs.mkdirSync(walletPath, { recursive: true });
                console.log(`Created wallet directory at ${walletPath}`);
            } catch (e) {
                console.error(`Error creating wallet directory: ${e.message}`);
                // Try to use a local wallet instead
                walletPath = path.join(__dirname, '..', '..', 'wallet');
                fs.mkdirSync(walletPath, { recursive: true });
                console.log(`Using local wallet directory at ${walletPath} instead`);
            }
        }

        // Load connection profile
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a wallet for managing identities
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check if admin already exists
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Enroll the admin user
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main(); 