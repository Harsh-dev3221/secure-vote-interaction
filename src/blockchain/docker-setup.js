const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function runCommand(command, description) {
    console.log(`\n${description}...`);
    console.log(`Command: ${command}`);

    try {
        const { stdout, stderr } = await execPromise(command);
        if (stdout) console.log(stdout);
        if (stderr) console.log(`STDERR: ${stderr}`);
        return { success: true, stdout, stderr };
    } catch (error) {
        console.error(`Error executing command: ${error.message}`);
        return { success: false, error };
    }
}

function ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
    }
}

async function main() {
    try {
        console.log("Starting Hyperledger Fabric setup for Docker Desktop...");

        const currentDir = process.cwd();
        console.log(`Current directory: ${currentDir}`);

        // Create necessary directories
        const orgDir = path.join(currentDir, 'organizations', 'peerOrganizations', 'org1.example.com');
        ensureDirectoryExists(orgDir);
        ensureDirectoryExists(path.join(orgDir, 'tlsca'));
        ensureDirectoryExists(path.join(orgDir, 'ca'));
        ensureDirectoryExists(path.join(currentDir, 'wallet'));

        // Create connection profile for Docker (localhost)
        console.log("\n=== Creating connection profile ===");

        const connectionProfile = {
            name: "test-network-org1",
            version: "1.0.0",
            client: {
                organization: "Org1",
                connection: { timeout: { peer: { endorser: "300" } } }
            },
            organizations: {
                Org1: {
                    mspid: "Org1MSP",
                    peers: ["peer0.org1.example.com"],
                    certificateAuthorities: ["ca.org1.example.com"]
                }
            },
            peers: {
                "peer0.org1.example.com": {
                    url: "grpcs://localhost:7051",
                    tlsCACerts: {
                        path: path.join(currentDir, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'tlsca', 'tlsca.org1.example.com-cert.pem')
                    },
                    grpcOptions: {
                        "ssl-target-name-override": "peer0.org1.example.com",
                        hostnameOverride: "peer0.org1.example.com"
                    }
                }
            },
            certificateAuthorities: {
                "ca.org1.example.com": {
                    url: "https://localhost:7054",
                    caName: "ca-org1",
                    tlsCACerts: {
                        path: path.join(currentDir, 'fabric-samples', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'ca', 'ca.org1.example.com-cert.pem')
                    },
                    httpOptions: { verify: false }
                }
            }
        };

        // Write connection profile to file
        fs.writeFileSync(path.join(orgDir, 'connection-org1.json'), JSON.stringify(connectionProfile, null, 2));
        console.log(`Connection profile created at ${path.join(orgDir, 'connection-org1.json')}`);

        // Create wallet identities
        console.log("\n=== Creating wallet identities ===");

        // Create Docker server configuration
        console.log("\n=== Creating Docker server configuration ===");
        const dockerServerPath = path.join(currentDir, 'src', 'blockchain', 'server-docker.cjs');

        // Copy the existing server file and modify it for Docker
        if (fs.existsSync(path.join(currentDir, 'src', 'blockchain', 'server-wsl.cjs'))) {
            let serverContent = fs.readFileSync(path.join(currentDir, 'src', 'blockchain', 'server-wsl.cjs'), 'utf8');
            serverContent = serverContent.replace(
                /discovery: { enabled: true, asLocalhost: false }/g,
                'discovery: { enabled: true, asLocalhost: true }'
            );
            serverContent = serverContent.replace(
                'Hyperledger Fabric API Server (WSL MODE)',
                'Hyperledger Fabric API Server (DOCKER MODE)'
            );
            fs.writeFileSync(dockerServerPath, serverContent);
            console.log("Docker server configuration created");
        }

        // Update package.json to add the Docker server script
        const packageJsonPath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            packageJson.scripts['fabric:docker'] = 'node src/blockchain/server-docker.cjs';
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log("Added 'fabric:docker' script to package.json");
        }

        console.log("\n=== Setup completed successfully! ===");
        console.log("Now run the following commands to start the application:");
        console.log("npm run fabric:docker");
        console.log("npm run dev");

    } catch (error) {
        console.error(`Setup failed: ${error.message}`);
    }
}

main();