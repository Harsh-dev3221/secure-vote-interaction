/**
 * This script handles setup and deployment of the Hyperledger Fabric voting application
 * It will:
 * 1. Transfer our shell scripts to WSL
 * 2. Run the scripts to deploy the chaincode
 * 3. Update the connection profile for our application
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Execute a command in WSL
function runWslCommand(command) {
    return new Promise((resolve, reject) => {
        console.log(`Executing in WSL: ${command}`);

        exec(`wsl -d Ubuntu-22.04 -e bash -c "${command.replace(/"/g, '\\"')}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
            }
            console.log(`stdout: ${stdout}`);
            resolve(stdout);
        });
    });
}

// Transfer a file to WSL
function transferFileToWsl(sourceFile, targetPath) {
    return new Promise((resolve, reject) => {
        // Read the file
        const content = fs.readFileSync(sourceFile, 'utf8');

        // Create command to write the content to target path in WSL
        const command = `cat > ${targetPath} << 'EOFMARKER'\n${content}\nEOFMARKER\nchmod +x ${targetPath}`;

        // Execute the command
        runWslCommand(command)
            .then(resolve)
            .catch(reject);
    });
}

async function main() {
    try {
        console.log('Starting Hyperledger Fabric setup process...');

        // Create directory for our scripts in WSL
        await runWslCommand('mkdir -p /home/vote/scripts');

        // Source files and target locations
        const files = [
            {
                source: path.join(__dirname, 'deploy-wsl.sh'),
                target: '/home/vote/scripts/deploy-wsl.sh'
            },
            {
                source: path.join(__dirname, 'update-connection.sh'),
                target: '/home/vote/scripts/update-connection.sh'
            }
        ];

        // Transfer files to WSL
        console.log('Transferring scripts to WSL...');
        for (const file of files) {
            await transferFileToWsl(file.source, file.target);
            console.log(`Transferred ${file.source} to ${file.target}`);
        }

        // First, deploy the chaincode
        console.log('Deploying chaincode to Hyperledger Fabric network...');
        await runWslCommand('cd /home/vote/scripts && ./deploy-wsl.sh');

        // Then, update the connection profile
        console.log('Updating connection profile for Windows application...');
        await runWslCommand('cd /home/vote/scripts && ./update-connection.sh');

        console.log('Setup completed successfully!');
        console.log('--------------------------------------');
        console.log('Now you can run the following commands:');
        console.log('1. npm run fabric:wsl  - to start the server');
        console.log('2. npm run dev         - to start the frontend');

    } catch (error) {
        console.error('Error during setup:', error);
        process.exit(1);
    }
}

// Run the main function
main(); 