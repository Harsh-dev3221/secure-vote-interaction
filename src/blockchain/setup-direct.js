/**
 * This script uses the WSL mounted Windows filesystem to run our scripts
 * directly from the Windows directory instead of copying them
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Function to run commands and log output
async function runCommand(command, description) {
    console.log(`\n${description}...`);
    console.log(`Command: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command);
        if (stdout) console.log(stdout);
        if (stderr) console.log(`STDERR: ${stderr}`);
        return true;
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        if (error.stdout) console.log(error.stdout);
        if (error.stderr) console.log(`STDERR: ${error.stderr}`);
        return false;
    }
}

// Function to run WSL commands - uses the Windows filesystem via /mnt paths
async function runWslCommand(command, description) {
    // Properly escape the command for WSL
    const wslCommand = `wsl -d Ubuntu-22.04 -e bash -c "${command.replace(/"/g, '\\"')}"`;
    return runCommand(wslCommand, description);
}

// Function to fix WSL path - handling spaces properly
function fixWslPath(windowsPath) {
    // Replace backslashes with forward slashes
    let wslPath = windowsPath.replace(/\\/g, '/');

    // Replace drive letter (e.g., C:) with /mnt/c format
    wslPath = wslPath.replace(/^([A-Z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);

    // Escape spaces for bash
    wslPath = wslPath.replace(/ /g, '\\ ');

    return wslPath;
}

// Function to create directories if they don't exist
function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

// Main function
async function main() {
    try {
        console.log("Starting secure-vote-interaction Fabric setup...");

        // Get the current directory paths
        const currentDir = process.cwd();
        console.log(`Current directory: ${currentDir}`);

        // Convert Windows path to WSL path format with proper space handling
        const wslProjectPath = fixWslPath(currentDir);
        console.log(`WSL project path: ${wslProjectPath}`);

        // Create necessary directories
        const orgDir = path.join(currentDir, 'organizations', 'peerOrganizations', 'org1.example.com');
        ensureDirectoryExists(orgDir);
        ensureDirectoryExists(path.join(orgDir, 'tlsca'));
        ensureDirectoryExists(path.join(orgDir, 'ca'));
        ensureDirectoryExists(path.join(currentDir, 'wallet'));

        // Check if WSL is available
        const wslAvailable = await runCommand('wsl -l -v', 'Checking WSL availability');

        if (!wslAvailable) {
            console.error("WSL is not available. Please install WSL with Ubuntu-22.04");
            return;
        }

        // Copy scripts to a temporary location in WSL without spaces
        console.log("\n=== Copying scripts to WSL ===");
        await runWslCommand("mkdir -p ~/temp-scripts", "Creating temporary scripts directory");

        const deployScript = fixWslPath(path.join(currentDir, 'src', 'blockchain', 'deploy-wsl.sh'));
        const updateScript = fixWslPath(path.join(currentDir, 'src', 'blockchain', 'update-connection.sh'));

        await runWslCommand(`cp ${deployScript} ~/temp-scripts/deploy-wsl.sh`, "Copying deploy script");
        await runWslCommand(`cp ${updateScript} ~/temp-scripts/update-connection.sh`, "Copying update script");
        await runWslCommand("chmod +x ~/temp-scripts/*.sh", "Making scripts executable");

        // Deploy chaincode in WSL
        console.log("\n=== Deploying chaincode in WSL ===");
        const deploySuccess = await runWslCommand(`cd ~/temp-scripts && ./deploy-wsl.sh`, 'Deploying chaincode in WSL');

        if (!deploySuccess) {
            console.warn("Chaincode deployment encountered issues, but continuing with setup...");
        }

        // Update connection profile in WSL
        console.log("\n=== Updating connection profile ===");
        const updateSuccess = await runWslCommand(`cd ~/temp-scripts && ./update-connection.sh`, 'Updating connection profile');

        if (!updateSuccess) {
            console.error("Failed to update connection profile");
            return;
        }

        // After updating connection profile in WSL
        console.log("\n=== Copying files from WSL to Windows ===");
        const copySuccess = await runWslCommand(`~/copy-to-windows.sh "/mnt/d/Android\\ Projects/secure-vote-interaction"`, 'Copying files from WSL to Windows');

        if (!copySuccess) {
            console.error("Failed to copy files from WSL to Windows");
            return;
        }

        // Update server configuration
        console.log("\n=== Updating server configuration ===");
        const serverPath = path.join(currentDir, 'src', 'blockchain', 'server-wsl.cjs');

        if (fs.existsSync(serverPath)) {
            let serverContent = fs.readFileSync(serverPath, 'utf8');
            serverContent = serverContent.replace(
                /discovery: { enabled: true, asLocalhost: true }/g,
                'discovery: { enabled: true, asLocalhost: false }'
            );
            fs.writeFileSync(serverPath, serverContent);
            console.log("Server configuration updated to use non-localhost discovery");
        } else {
            console.warn(`Warning: Server file not found at ${serverPath}`);
        }

        console.log("\n=== Setup completed successfully! ===");
        console.log("Now run the following commands to start the application:");
        console.log("npm run fabric:wsl");
        console.log("npm run dev");

    } catch (error) {
        console.error(`Setup failed: ${error.message}`);
    }
}

// Execute the main function
main(); 