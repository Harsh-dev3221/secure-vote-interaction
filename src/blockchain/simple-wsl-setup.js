/**
 * Simple WSL Proxy Setup Script
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Simple WSL Proxy Setup ===');

// Function to run WSL commands
function runWsl(cmd) {
    console.log(`Running in WSL: ${cmd}`);
    return execSync(`wsl bash -c "${cmd.replace(/"/g, '\\"')}"`, { encoding: 'utf8' });
}

async function main() {
    try {
        // Check if WSL is available
        console.log('Checking WSL...');
        const wslCheck = execSync('wsl echo "WSL is working"', { encoding: 'utf8' });
        console.log(wslCheck);

        // Get WSL IP
        const wslIp = runWsl('hostname -I').trim().split(' ')[0];
        console.log(`WSL IP: ${wslIp}`);

        // Create a test directory
        console.log('Creating test directory...');
        runWsl('mkdir -p ~/wsl-test');

        // Save the simple proxy script to a temp file
        const simplePath = path.join(__dirname, 'simple-wsl-proxy.js');
        const tempPath = path.join(__dirname, 'temp-proxy.js');
        fs.copyFileSync(simplePath, tempPath);

        // Convert the Windows path to WSL path
        const driveLetter = tempPath.charAt(0).toLowerCase();
        const wslPath = `/mnt/${driveLetter}${tempPath.slice(2).replace(/\\/g, '/')}`;

        // Copy the file to WSL
        console.log('Copying proxy script to WSL...');
        runWsl(`cat "${wslPath}" > ~/wsl-test/proxy.js`);

        // Create a package.json
        console.log('Creating package.json...');
        const packageJson = {
            name: "wsl-test-proxy",
            version: "1.0.0",
            main: "proxy.js",
            dependencies: {
                express: "^4.18.2",
                cors: "^2.8.5"
            }
        };

        const tempPackagePath = path.join(__dirname, 'temp-package.json');
        fs.writeFileSync(tempPackagePath, JSON.stringify(packageJson, null, 2));

        const wslPackagePath = `/mnt/${driveLetter}${tempPackagePath.slice(2).replace(/\\/g, '/')}`;
        runWsl(`cat "${wslPackagePath}" > ~/wsl-test/package.json`);

        // Install dependencies
        console.log('Installing dependencies in WSL...');
        try {
            runWsl('cd ~/wsl-test && npm install');
        } catch (error) {
            console.warn('Warning: npm install failed, checking if npm is available...');
            const npmCheck = runWsl('which npm || echo "not found"');
            console.log(`npm check: ${npmCheck}`);

            if (npmCheck.includes('not found')) {
                console.log('npm not found, attempting to install...');
                try {
                    runWsl('sudo apt-get update && sudo apt-get install -y nodejs npm');
                    runWsl('cd ~/wsl-test && npm install');
                } catch (npmError) {
                    console.error('Failed to install npm:', npmError);
                    console.log('Please install nodejs and npm manually in WSL');
                }
            }
        }

        // Start the server
        console.log('Starting the proxy server...');
        runWsl('cd ~/wsl-test && node proxy.js > proxy.log 2>&1 &');

        // Wait for it to start
        console.log('Waiting for the server to start...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Test the server
        console.log('Testing the proxy server...');
        try {
            // Test from WSL
            const wslTest = runWsl('curl -s localhost:3003/api/test || echo "Failed from WSL"');
            console.log(`WSL test: ${wslTest}`);

            // Test from Windows
            const winTest = execSync(`curl -s http://${wslIp}:3003/api/test || echo "Failed from Windows"`, { encoding: 'utf8' });
            console.log(`Windows test: ${winTest}`);

            if (!wslTest.includes('Failed') || !winTest.includes('Failed')) {
                console.log('Proxy server is running!');
            } else {
                console.log('Proxy server is not responding correctly');
            }
        } catch (error) {
            console.error('Error testing the proxy:', error.message);
        }

        // Clean up temp files
        fs.unlinkSync(tempPath);
        fs.unlinkSync(tempPackagePath);

        console.log('Setup complete');
        console.log(`Proxy running at: http://${wslIp}:3003/api/test`);

    } catch (error) {
        console.error('Setup failed:', error.message);
    }
}

main(); 