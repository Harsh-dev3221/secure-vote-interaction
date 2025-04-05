'use strict';

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function runCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`Running command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Command stderr: ${stderr}`);
            }
            console.log(`Command stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}

async function main() {
    try {
        console.log('Setting up connection to Hyperledger Fabric network');

        // Create directories if they don't exist
        const orgDir = path.join(__dirname, '..', '..', 'organizations', 'peerOrganizations', 'org1.example.com');
        const walletDir = path.join(__dirname, '..', '..', 'wallet');

        // Creating directory structure
        fs.mkdirSync(orgDir, { recursive: true });
        fs.mkdirSync(walletDir, { recursive: true });

        console.log(`Created organization directory at: ${orgDir}`);
        console.log(`Created wallet directory at: ${walletDir}`);

        // Check if we have WSL available
        try {
            await runCommand('wsl -l -v');
            console.log('WSL is available on this system');

            // Try to copy connection profile from WSL
            try {
                const wslCopyCmd = 'wsl -d Ubuntu-22.04 -e bash -c "cp /home/vote/hyperledger/fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json /mnt/d/Android\\ Projects/secure-vote-interaction/organizations/peerOrganizations/org1.example.com/"';
                await runCommand(wslCopyCmd);
                console.log('Successfully copied connection profile from WSL');

                // Now check if the connection profile was copied successfully
                const connProfile = path.join(orgDir, 'connection-org1.json');
                if (fs.existsSync(connProfile)) {
                    console.log(`Connection profile exists at: ${connProfile}`);
                } else {
                    console.error(`Failed to copy connection profile to ${connProfile}`);
                }
            } catch (wslErr) {
                console.error(`Error copying from WSL: ${wslErr.message}`);
            }
        } catch (wslCheckErr) {
            console.log('WSL is not available or not properly set up on this system');
        }

        // Now call enrollAdmin and registerUser
        console.log('Enrolling admin user...');
        try {
            await runCommand('node src/blockchain/enrollAdmin.js');
            console.log('Admin user enrolled successfully');

            console.log('Registering application user...');
            await runCommand('node src/blockchain/registerUser.js');
            console.log('Application user registered successfully');
        } catch (enrollErr) {
            console.error(`Error enrolling users: ${enrollErr.message}`);
        }

        console.log('Setup complete');
    } catch (error) {
        console.error(`Error setting up connection: ${error.message}`);
        process.exit(1);
    }
}

main(); 