/**
 * This script sets up a workaround for TLS certificate verification issues
 * IMPORTANT: Only use for development/testing, not for production!
 */

const fs = require('fs');
const path = require('path');

console.log('Setting up TLS certificate verification workaround...');

// 1. Set environment variable to disable certificate verification
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
console.log('NODE_TLS_REJECT_UNAUTHORIZED set to 0');

// 2. Modify the server-wsl.cjs file to include this setting
const serverWslPath = path.join(__dirname, 'server-wsl.cjs');

if (fs.existsSync(serverWslPath)) {
    console.log(`Modifying ${serverWslPath}...`);

    let content = fs.readFileSync(serverWslPath, 'utf8');

    // Check if already modified
    if (content.includes('NODE_TLS_REJECT_UNAUTHORIZED')) {
        console.log('File already contains TLS verification workaround.');
    } else {
        // Add at the top, after the requires
        const insertPos = content.indexOf('const app = express();');
        if (insertPos !== -1) {
            const newContent =
                content.slice(0, insertPos) +
                "\n// SECURITY WARNING: Disable TLS certificate verification - ONLY FOR DEVELOPMENT\n" +
                "process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';\n" +
                "console.log('TLS certificate verification disabled for development');\n\n" +
                content.slice(insertPos);

            fs.writeFileSync(serverWslPath, newContent);
            console.log('Added TLS verification workaround to server-wsl.cjs');
        } else {
            console.log('Could not find appropriate position to insert code.');
        }
    }
} else {
    console.log(`File ${serverWslPath} not found!`);
}

// 3. Update grpc settings in connection handling
console.log('\nUpdating connection profile handling...');

// Function to patch a file with grpc settings
function patchFileWithGrpcSettings(filePath) {
    if (fs.existsSync(filePath)) {
        console.log(`Modifying ${filePath}...`);

        let content = fs.readFileSync(filePath, 'utf8');

        // Check if already modified
        if (content.includes('grpc.ssl_target_name_override')) {
            console.log(`File ${filePath} already contains gRPC settings.`);
            return;
        }

        // Find the gateway.connect call
        const gatewayConnectPos = content.indexOf('await gateway.connect(ccp,');
        if (gatewayConnectPos !== -1) {
            // Find the closing bracket of the connect options
            let optionsEnd = content.indexOf('})', gatewayConnectPos);
            if (optionsEnd !== -1) {
                // Insert grpc settings before the closing bracket
                const newContent =
                    content.slice(0, optionsEnd) +
                    ",\n      eventHandlerOptions: {\n" +
                    "        commitTimeout: 100,\n" +
                    "        endorseTimeout: 30\n" +
                    "      },\n" +
                    "      'grpc.ssl_target_name_override': 'peer0.org1.example.com',\n" +
                    "      'grpc.default_authority': 'peer0.org1.example.com',\n" +
                    "      'grpc.max_receive_message_length': 100 * 1024 * 1024,\n" +
                    "      'grpc.max_send_message_length': 100 * 1024 * 1024\n" +
                    content.slice(optionsEnd);

                fs.writeFileSync(filePath, newContent);
                console.log(`Added gRPC settings to ${filePath}`);
            } else {
                console.log(`Could not find options end in ${filePath}`);
            }
        } else {
            console.log(`Could not find gateway.connect in ${filePath}`);
        }
    } else {
        console.log(`File ${filePath} not found!`);
    }
}

// Patch files that handle connection
patchFileWithGrpcSettings(serverWslPath);

console.log('\nTLS workaround setup complete. Please restart the server.');
console.log('IMPORTANT: This workaround should only be used in development!'); 