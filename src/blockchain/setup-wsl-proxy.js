
/**
 * Hyperledger Fabric WSL Proxy Setup
 * 
 * This script:
 * 1. Copies the wsl-fabric-proxy.js file to WSL
 * 2. Installs necessary packages in WSL
 * 3. Starts the proxy server in WSL
 * 4. Updates the Windows app to use the WSL proxy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const WSL_PROXY_PATH = '/home/vote/fabric-proxy';
const WIN_SRC_DIR = path.resolve(__dirname);
const PROXY_SCRIPT = path.join(WIN_SRC_DIR, 'wsl-fabric-proxy.js');

console.log('=================================================');
console.log('Hyperledger Fabric WSL Proxy Setup');
console.log('=================================================');

// Convert Windows path to WSL path
function convertToWslPath(windowsPath) {
  // Remove drive letter and convert backslashes to forward slashes
  const driveLetter = windowsPath.charAt(0).toLowerCase();
  let wslPath = windowsPath.replace(/^[A-Za-z]:/, '').replace(/\\/g, '/');
  return `/mnt/${driveLetter}${wslPath}`;
}

// Run a command in WSL
function runWslCommand(command) {
  console.log(`Running in WSL: ${command}`);
  try {
    // Wrap the command in bash -c to ensure all commands work
    return execSync(`wsl bash -c "${command.replace(/"/g, '\\"')}"`, {
      encoding: 'utf8',
      windowsHide: true
    });
  } catch (error) {
    console.error(`Error executing WSL command: ${error.message}`);
    if (error.stdout) console.log(`stdout: ${error.stdout}`);
    if (error.stderr) console.error(`stderr: ${error.stderr}`);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    // Check if WSL is available
    try {
      const wslCheck = execSync('wsl echo "WSL is available"', { encoding: 'utf8' });
      console.log(wslCheck.trim());
    } catch (error) {
      console.error('ERROR: WSL is not available or not properly configured.');
      console.error('Please make sure WSL is installed and configured correctly.');
      process.exit(1);
    }

    // Get the WSL IP address
    console.log('Getting WSL IP address...');
    let wslIp = '';
    try {
      // Try a simpler command to get WSL IP
      const ips = runWslCommand(`hostname -I`).trim();
      console.log(`Found IPs: ${ips}`);

      // Extract just the first IP address
      wslIp = ips.split(' ')[0];

      if (!wslIp) {
        // Hardcode fallback if all else fails
        wslIp = '127.0.0.1';
        console.log('Could not determine WSL IP, using localhost instead');
      }
      console.log(`Using WSL IP: ${wslIp}`);
    } catch (error) {
      console.error('Error getting WSL IP:', error);
      wslIp = '127.0.0.1';
      console.log('Using localhost as fallback');
    }

    // Convert proxy script path to WSL path
    const proxyScriptWslPath = convertToWslPath(PROXY_SCRIPT);
    console.log(`Windows script path: ${PROXY_SCRIPT}`);
    console.log(`WSL script path: ${proxyScriptWslPath}`);

    // Create proxy directory in WSL
    console.log(`Creating proxy directory in WSL: ${WSL_PROXY_PATH}`);
    runWslCommand(`mkdir -p ${WSL_PROXY_PATH}`);

    // Copy proxy script to WSL directory
    console.log('Copying proxy script to WSL...');
    // First output the file to a temporary location without spaces
    const tempScript = path.join(process.cwd(), 'temp-proxy-server.js');
    fs.copyFileSync(PROXY_SCRIPT, tempScript);
    const tempScriptWslPath = convertToWslPath(tempScript);

    try {
      // Copy from the temp location to the final destination
      runWslCommand(`cp "${tempScriptWslPath}" ${WSL_PROXY_PATH}/proxy-server.js`);
      console.log('Successfully copied proxy script to WSL');
    } catch (error) {
      console.error('Error copying script, attempting alternative method...');
      try {
        // Try to use cat to write the file directly
        const scriptContent = fs.readFileSync(PROXY_SCRIPT, 'utf8');
        const tempContentFile = path.join(process.cwd(), 'proxy-content.txt');
        fs.writeFileSync(tempContentFile, scriptContent);
        const tempContentWslPath = convertToWslPath(tempContentFile);

        runWslCommand(`cat "${tempContentWslPath}" > ${WSL_PROXY_PATH}/proxy-server.js`);
        console.log('Successfully created proxy script in WSL using alternative method');
      } catch (catError) {
        console.error('All copy methods failed:', catError);
        process.exit(1);
      }
    }

    // Clean up temp files
    try {
      if (fs.existsSync(tempScript)) fs.unlinkSync(tempScript);
      const tempContentFile = path.join(process.cwd(), 'proxy-content.txt');
      if (fs.existsSync(tempContentFile)) fs.unlinkSync(tempContentFile);
    } catch (cleanupError) {
      console.warn('Warning: Failed to clean up temporary files:', cleanupError.message);
    }

    // Create package.json for the proxy
    console.log('Creating package.json for the proxy...');
    const packageJson = {
      name: "fabric-wsl-proxy",
      version: "1.0.0",
      description: "Hyperledger Fabric WSL Proxy Server",
      main: "proxy-server.js",
      scripts: {
        start: "node proxy-server.js"
      },
      dependencies: {
        express: "^4.18.2",
        cors: "^2.8.5",
        "fabric-network": "^2.2.16"
      }
    };

    // Write package.json to WSL
    const packageJsonPath = path.join(process.cwd(), 'wsl-proxy-package.json');
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    try {
      const packageJsonWslPath = convertToWslPath(packageJsonPath);
      // Use echo to write the file directly
      runWslCommand(`cat "${packageJsonWslPath}" > ${WSL_PROXY_PATH}/package.json`);
      console.log('Successfully created package.json in WSL');
    } catch (error) {
      console.error('Error creating package.json in WSL:', error.message);
      process.exit(1);
    }

    // Clean up temp file
    try {
      if (fs.existsSync(packageJsonPath)) fs.unlinkSync(packageJsonPath);
    } catch (cleanupError) {
      console.warn('Warning: Failed to clean up temporary package.json file:', cleanupError.message);
    }

    // Install dependencies in WSL
    console.log('Installing dependencies in WSL...');
    try {
      // Make sure basic tools are installed
      runWslCommand(`sudo apt-get update && sudo apt-get install -y curl`);
      // Install npm if needed
      runWslCommand(`which npm || sudo apt-get install -y npm`);
      // Install the dependencies
      runWslCommand(`cd ${WSL_PROXY_PATH} && npm install`);
    } catch (error) {
      console.warn('Warning: Error installing dependencies, the proxy may not work correctly.');
      console.warn('You may need to run `sudo apt-get update && sudo apt-get install -y curl npm` in WSL manually.');
    }

    // Create a startup script in WSL
    console.log('Creating startup script in WSL...');
    const startupScript = `#!/bin/bash
cd ${WSL_PROXY_PATH}
export NODE_TLS_REJECT_UNAUTHORIZED=0
node proxy-server.js > proxy-server.log 2>&1 &
echo $! > proxy-server.pid
echo "Proxy server started with PID $(cat proxy-server.pid)"
`;

    const startupScriptPath = path.join(process.cwd(), 'start-proxy.sh');
    fs.writeFileSync(startupScriptPath, startupScript);

    try {
      const startupScriptWslPath = convertToWslPath(startupScriptPath);
      // Write the script directly
      runWslCommand(`cat "${startupScriptWslPath}" > ${WSL_PROXY_PATH}/start.sh`);
      // Make it executable
      runWslCommand(`chmod +x ${WSL_PROXY_PATH}/start.sh`);
      console.log('Successfully created startup script in WSL');
    } catch (error) {
      console.error('Error creating startup script in WSL:', error.message);
      process.exit(1);
    }

    // Clean up temp file
    try {
      if (fs.existsSync(startupScriptPath)) fs.unlinkSync(startupScriptPath);
    } catch (cleanupError) {
      console.warn('Warning: Failed to clean up temporary startup script file:', cleanupError.message);
    }

    // Start the proxy server in WSL
    console.log('Starting proxy server in WSL...');
    try {
      // Check if node is installed and working
      console.log('Checking Node.js in WSL...');
      const nodeVersion = runWslCommand('node --version');
      console.log(`Node.js version in WSL: ${nodeVersion.trim()}`);

      // Check if the proxy server exists
      console.log('Checking proxy files...');
      const lsResult = runWslCommand(`ls -la ${WSL_PROXY_PATH}`);
      console.log(`WSL directory contents:\n${lsResult}`);

      // Start the server in foreground mode first for debugging
      console.log('Starting proxy server in foreground mode for debugging...');
      try {
        // Just run for a couple of seconds to capture any startup errors
        runWslCommand(`cd ${WSL_PROXY_PATH} && NODE_TLS_REJECT_UNAUTHORIZED=0 node proxy-server.js & sleep 5 && echo "Server started in background"`);
      } catch (foregroundError) {
        console.log('Foreground run completed or errored, continuing with background mode');
        console.log(foregroundError.message);
      }

      // Now start in background mode
      runWslCommand(`${WSL_PROXY_PATH}/start.sh`);
      console.log('Proxy server started in background mode');

      // Print the log file for debugging
      console.log('Checking server logs...');
      try {
        const logs = runWslCommand(`cat ${WSL_PROXY_PATH}/proxy-server.log || echo "No logs found"`);
        console.log(`Server logs:\n${logs}`);
      } catch (logError) {
        console.warn('Warning: Could not read server logs:', logError.message);
      }
    } catch (error) {
      console.error('Error starting proxy server:', error.message);
    }

    // Wait for the server to start
    console.log('Waiting for the proxy server to start...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check if the server is running
    console.log('Checking if the proxy server is running...');
    let isServerRunning = false;
    let retryCount = 0;
    const maxRetries = 3;

    while (!isServerRunning && retryCount < maxRetries) {
      try {
        // Try to connect to the server using curl in WSL first
        console.log(`Attempt ${retryCount + 1}/${maxRetries} - Checking with WSL curl...`);
        try {
          const wslCheck = runWslCommand(`curl -s http://localhost:3003/api/test || echo "Failed"`);
          console.log(`WSL curl response: ${wslCheck}`);

          if (!wslCheck.includes("Failed")) {
            console.log('Proxy server is running according to WSL curl!');
            isServerRunning = true;
            break;
          }
        } catch (wslCurlError) {
          console.log('WSL curl check failed, trying Windows curl...');
        }

        // Try Windows curl to the WSL IP
        const result = execSync(`curl -s http://${wslIp}:3003/api/test`, { encoding: 'utf8' });
        console.log('Proxy server response:', result);
        console.log('Proxy server is running successfully!');
        isServerRunning = true;
      } catch (error) {
        console.warn(`Attempt ${retryCount + 1}/${maxRetries} - Could not connect to the proxy server.`);
        console.log('Waiting a bit more...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        retryCount++;
      }
    }

    if (!isServerRunning) {
      console.error('WARNING: Could not connect to the proxy server after multiple attempts.');
      console.error('The server might have failed to start or encountered an error.');
      console.error('Check the logs in WSL at:', `${WSL_PROXY_PATH}/proxy-server.log`);

      // Try to print the logs one more time
      try {
        const logs = runWslCommand(`cat ${WSL_PROXY_PATH}/proxy-server.log || echo "No logs found"`);
        console.log(`\nServer logs:\n${logs}`);
      } catch (error) {
        console.error('Could not read server logs.');
      }

      // As a last resort, try starting with foreground output
      console.log('\nAttempting to start server in foreground mode for direct output:');
      try {
        const foregroundOutput = runWslCommand(`cd ${WSL_PROXY_PATH} && NODE_TLS_REJECT_UNAUTHORIZED=0 node proxy-server.js`);
        console.log(foregroundOutput);
      } catch (error) {
        console.error('Foreground server start also failed:', error.message);
      }
    }

    // Create a Windows script to use the proxy
    console.log('Creating Windows script to use the proxy...');
    const proxyConfigScript = `/**
 * WSL Proxy Configuration for Windows Application
 */
const WSL_PROXY_URL = 'http://${wslIp}:3003';

// Configure application to use the WSL proxy
function configureWslProxy() {
    // Set environment variable to indicate we're using the WSL proxy
    process.env.FABRIC_WSL_PROXY = WSL_PROXY_URL;
    
    console.log('=====================================================');
    console.log('Secure Vote Application - WSL Proxy Mode');
    console.log('=====================================================');
    console.log(\`Using Hyperledger Fabric WSL Proxy at: \${WSL_PROXY_URL}\`);
    console.log('=====================================================');
}

module.exports = {
    configureWslProxy,
    WSL_PROXY_URL
};
`;

    // Write the proxy config file
    const proxyConfigPath = path.join(WIN_SRC_DIR, 'wsl-proxy-config.js');
    fs.writeFileSync(proxyConfigPath, proxyConfigScript);
    console.log(`Created proxy configuration at: ${proxyConfigPath}`);

    // Update server-wsl.cjs to use the proxy
    console.log('Updating server-wsl.cjs to use the proxy...');
    const serverPath = path.join(WIN_SRC_DIR, 'server-wsl.cjs');

    if (fs.existsSync(serverPath)) {
      let serverContent = fs.readFileSync(serverPath, 'utf8');

      // Add proxy configuration
      const proxyImport = "const { configureWslProxy, WSL_PROXY_URL } = require('./wsl-proxy-config.js');";
      if (!serverContent.includes('configureWslProxy')) {
        // Add import
        serverContent = proxyImport + '\n\n' + serverContent;

        // Add configuration call at the beginning of the file
        serverContent = serverContent.replace(
          /const express = require\('express'\);/,
          "const express = require('express');\n\n// Configure WSL proxy\nconfigureWslProxy();"
        );

        // Modify the API endpoints to use the proxy
        serverContent = serverContent.replace(
          /app\.post\('\/api\/voters\/register', async \(req, res\) => {/g,
          `app.post('/api/voters/register', async (req, res) => {
  // If using WSL proxy, forward the request
  if (process.env.FABRIC_WSL_PROXY) {
    try {
      const { default: fetch } = await import('node-fetch');
      const proxyResponse = await fetch(\`\${WSL_PROXY_URL}/api/voters/register\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await proxyResponse.json();
      return res.json(data);
    } catch (error) {
      console.error('Error forwarding to WSL proxy:', error);
      // Continue with fallback if proxy fails
    }
  }`
        );

        // Similar modifications for other endpoints
        // Cast vote endpoint
        serverContent = serverContent.replace(
          /app\.post\('\/api\/votes\/cast', async \(req, res\) => {/g,
          `app.post('/api/votes/cast', async (req, res) => {
  // If using WSL proxy, forward the request
  if (process.env.FABRIC_WSL_PROXY) {
    try {
      const { default: fetch } = await import('node-fetch');
      const proxyResponse = await fetch(\`\${WSL_PROXY_URL}/api/votes/cast\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await proxyResponse.json();
      return res.json(data);
    } catch (error) {
      console.error('Error forwarding to WSL proxy:', error);
      // Continue with fallback if proxy fails
    }
  }`
        );

        // Election results endpoint
        serverContent = serverContent.replace(
          /app\.get\('\/api\/elections\/:electionId\/results', async \(req, res\) => {/g,
          `app.get('/api/elections/:electionId/results', async (req, res) => {
  // If using WSL proxy, forward the request
  if (process.env.FABRIC_WSL_PROXY) {
    try {
      const { default: fetch } = await import('node-fetch');
      const proxyResponse = await fetch(\`\${WSL_PROXY_URL}/api/elections/\${req.params.electionId}/results\`);
      const data = await proxyResponse.json();
      return res.json(data);
    } catch (error) {
      console.error('Error forwarding to WSL proxy:', error);
      // Continue with fallback if proxy fails
    }
  }`
        );

        // Receipt verification endpoint
        serverContent = serverContent.replace(
          /app\.get\('\/api\/receipts\/:receiptCode', async \(req, res\) => {/g,
          `app.get('/api/receipts/:receiptCode', async (req, res) => {
  // If using WSL proxy, forward the request
  if (process.env.FABRIC_WSL_PROXY) {
    try {
      const { default: fetch } = await import('node-fetch');
      const proxyResponse = await fetch(\`\${WSL_PROXY_URL}/api/receipts/\${req.params.receiptCode}\`);
      const data = await proxyResponse.json();
      return res.json(data);
    } catch (error) {
      console.error('Error forwarding to WSL proxy:', error);
      // Continue with fallback if proxy fails
    }
  }`
        );

        // Status endpoint
        serverContent = serverContent.replace(
          /app\.get\('\/api\/status', async \(req, res\) => {/g,
          `app.get('/api/status', async (req, res) => {
  // If using WSL proxy, check proxy status
  if (process.env.FABRIC_WSL_PROXY) {
    try {
      const { default: fetch } = await import('node-fetch');
      const proxyResponse = await fetch(\`\${WSL_PROXY_URL}/api/status\`);
      const data = await proxyResponse.json();
      return res.json(data);
    } catch (error) {
      console.error('Error connecting to WSL proxy:', error);
      // Continue with fallback if proxy fails
    }
  }`
        );

        // Write updated content
        fs.writeFileSync(serverPath, serverContent);
        console.log('Updated server-wsl.cjs to use WSL proxy');
      } else {
        console.log('server-wsl.cjs already configured for WSL proxy');
      }
    } else {
      console.error(`WARNING: Could not find server file at ${serverPath}`);
    }

    // Add node-fetch dependency to package.json
    console.log('Adding node-fetch dependency to package.json...');
    const packageJsonPath2 = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath2)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath2, 'utf8'));
      if (!packageJson.dependencies['node-fetch']) {
        packageJson.dependencies['node-fetch'] = "^3.3.1";
        fs.writeFileSync(packageJsonPath2, JSON.stringify(packageJson, null, 2));
        console.log('Added node-fetch dependency to package.json');

        // Install dependency
        console.log('Installing node-fetch...');
        execSync('npm install', { stdio: 'inherit' });
      }
    }

    // Add script to package.json for WSL proxy mode
    console.log('Adding script to package.json for WSL proxy mode...');
    if (fs.existsSync(packageJsonPath2)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath2, 'utf8'));
      packageJson.scripts['fabric:wsl-proxy'] = 'node src/blockchain/server-wsl.cjs';
      fs.writeFileSync(packageJsonPath2, JSON.stringify(packageJson, null, 2));
      console.log('Added script to package.json for WSL proxy mode');
    }

    console.log('=================================================');
    console.log('WSL Proxy Setup Complete!');
    console.log('=================================================');
    console.log('To use the WSL proxy:');
    console.log('1. Start the application with: npm run fabric:wsl-proxy');
    console.log('2. The application will automatically connect to the WSL proxy');
    console.log('3. If the proxy is unreachable, the app will fall back to mock mode');
    console.log('=================================================');
    console.log(`WSL Proxy URL: http://${wslIp}:3003`);
    console.log('=================================================');

  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the setup
main(); 