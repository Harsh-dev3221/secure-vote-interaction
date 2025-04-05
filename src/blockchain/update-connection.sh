#!/bin/bash

# This script will:
# 1. Get the WSL IP address
# 2. Update the connection profile with the proper settings

# Get absolute path to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Get path to user's home directory
USER_HOME="$HOME"
echo "User home directory: $USER_HOME"

# Directory where the connection profile is located in WSL
SOURCE_DIR="/home/vote/hyperledger/fabric/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com"
TARGET_DIR="$USER_HOME/fabric-connection/organizations/peerOrganizations/org1.example.com"

# Get the WSL IP address
WSL_IP=$(ip addr show eth0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
echo "WSL IP address: $WSL_IP"

echo "Target directory: $TARGET_DIR"

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy TLS certificates
mkdir -p "$TARGET_DIR/tlsca"
mkdir -p "$TARGET_DIR/ca"

# Copy TLS CA certificate
if [ -f "$SOURCE_DIR/tlsca/tlsca.org1.example.com-cert.pem" ]; then
    cp "$SOURCE_DIR/tlsca/tlsca.org1.example.com-cert.pem" "$TARGET_DIR/tlsca/"
    echo "Copied TLS CA certificate"
else
    echo "Warning: TLS CA certificate not found at $SOURCE_DIR/tlsca/tlsca.org1.example.com-cert.pem"
fi

# Copy CA certificate
if [ -f "$SOURCE_DIR/ca/ca.org1.example.com-cert.pem" ]; then
    cp "$SOURCE_DIR/ca/ca.org1.example.com-cert.pem" "$TARGET_DIR/ca/"
    echo "Copied CA certificate"
else
    echo "Warning: CA certificate not found at $SOURCE_DIR/ca/ca.org1.example.com-cert.pem"
fi

# Get the certificate contents
TLS_CERT_CONTENT=""
if [ -f "$SOURCE_DIR/tlsca/tlsca.org1.example.com-cert.pem" ]; then
    TLS_CERT_CONTENT=$(cat "$SOURCE_DIR/tlsca/tlsca.org1.example.com-cert.pem" | sed ':a;N;$!ba;s/\n/\\n/g')
else
    TLS_CERT_CONTENT="-----BEGIN CERTIFICATE-----\nMIICVzCCAf6gAwIBAgIRAIVzwpRoVZRVAXVTnVK5CCswCgYIKoZIzj0EAwIwdjEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHzAdBgNVBAMTFnRs\nc2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIyMDAwWhcNMzIwMTMxMjIy\nMDAwWjB2MQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UE\nBxMNU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEfMB0G\nA1UEAxMWdGxzY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49\nAwEHA0IABLnNBx3HRmB2hLc8Q2r3P3ZJJkA7eXcZYnUZfvl9oLZLCKwYpJMzKUm9\n4IMgfycXw6yjNLwiJiVzWnn0xz2bZcujbTBrMA4GA1UdDwEB/wQEAwIBpjAdBgNV\nHSUEFjAUBggrBgEFBQcDAgYIKwYBBQUHAwEwDwYDVR0TAQH/BAUwAwEB/zApBgNV\nHQ4EIgQgv1MQmmWUfJYWGrCdJW4+o1DQfvBSCKsXOP+/44UmF+IwCgYIKoZIzj0E\nAwIDRwAwRAIgHCZzC85YiMQv4/tKS+L8z6CEI8fcCNG5KnRoWMCOeQwCIHFeWRzf\n5rA6v7r/LRLnAKI+XUyRL+oMZVvCTQK8BK6e\n-----END CERTIFICATE-----\n"
    echo "Using default TLS certificate"
fi

CA_CERT_CONTENT=""
if [ -f "$SOURCE_DIR/ca/ca.org1.example.com-cert.pem" ]; then
    CA_CERT_CONTENT=$(cat "$SOURCE_DIR/ca/ca.org1.example.com-cert.pem" | sed ':a;N;$!ba;s/\n/\\n/g')
else
    CA_CERT_CONTENT="-----BEGIN CERTIFICATE-----\nMIICUTCCAfigAwIBAgIRAJOvGLsJ+SHk+JVqS0dE5MowCgYIKoZIzj0EAwIwczEL\nMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNhbiBG\ncmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMTE2Nh\nLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIyMDAwWhcNMzIwMTMxMjIyMDAw\nWjBzMQswCQYDVQQGEwJVUzETMBEGA1UECBMKQ2FsaWZvcm5pYTEWMBQGA1UEBxMN\nU2FuIEZyYW5jaXNjbzEZMBcGA1UEChMQb3JnMS5leGFtcGxlLmNvbTEcMBoGA1UE\nAxMTY2Eub3JnMS5leGFtcGxlLmNvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBEtpEJiUi5jFpAEpTC01CFiPKf9RJ/ym7l7XBYPHXavWCj4o2zxAJD12o5ioOYe0\nPmGlI0Fgc0Z3whFIsg/9D7yjbTBrMA4GA1UdDwEB/wQEAwIBpjAdBgNVHSUEFjAU\nBggrBgEFBQcDAgYIKwYBBQUHAwEwDwYDVR0TAQH/BAUwAwEB/zApBgNVHQ4EIgQg\ns4Sh4agQb5RkeFBJlXloZlrypECqSMPkQdZzltruAoUwCgYIKoZIzj0EAwIDRwAw\nRAIgbzWUvEGpsHyUDIrpORWSEm4XU7WXnJn15pUzAGk8UEMCIH9MwnQYVNwQfQUe\nISwGUYIh7CEoJITdX7pVJO/FiLvq\n-----END CERTIFICATE-----\n"
    echo "Using default CA certificate"
fi

# Create connection profile with proper settings
cat > "$TARGET_DIR/connection-org1.json" << EOL
{
    "name": "test-network-org1",
    "version": "1.0.0",
    "client": {
        "organization": "Org1",
        "connection": {
            "timeout": {
                "peer": {
                    "endorser": "300"
                }
            }
        }
    },
    "organizations": {
        "Org1": {
            "mspid": "Org1MSP",
            "peers": [
                "peer0.org1.example.com"
            ],
            "certificateAuthorities": [
                "ca.org1.example.com"
            ]
        }
    },
    "peers": {
        "peer0.org1.example.com": {
            "url": "grpcs://${WSL_IP}:7051",
            "tlsCACerts": {
                "pem": "${TLS_CERT_CONTENT}"
            },
            "grpcOptions": {
                "ssl-target-name-override": "peer0.org1.example.com",
                "hostnameOverride": "peer0.org1.example.com"
            }
        }
    },
    "certificateAuthorities": {
        "ca.org1.example.com": {
            "url": "https://${WSL_IP}:7054",
            "caName": "ca-org1",
            "tlsCACerts": {
                "pem": "${CA_CERT_CONTENT}"
            },
            "httpOptions": {
                "verify": false
            }
        }
    }
}
EOL

echo "Connection profile updated successfully with WSL IP: $WSL_IP"
echo "Location: $TARGET_DIR/connection-org1.json"

# Create a script to copy the files to Windows
cat > "$USER_HOME/copy-to-windows.sh" << 'EOL'
#!/bin/bash

# This script copies the connection profile to Windows
# Usage: ./copy-to-windows.sh <windows-path>

if [ $# -ne 1 ]; then
    echo "Usage: $0 <windows-path>"
    echo "Example: $0 /mnt/d/Android\ Projects/secure-vote-interaction"
    exit 1
fi

WIN_PATH="$1"
SRC_DIR="$HOME/fabric-connection/organizations/peerOrganizations/org1.example.com"
WALLET_DIR="$HOME/fabric-connection/wallet"
TGT_ORG_DIR="${WIN_PATH}/organizations/peerOrganizations/org1.example.com"
TGT_WALLET_DIR="${WIN_PATH}/wallet"

# Create target directories
mkdir -p "${TGT_ORG_DIR}/tlsca"
mkdir -p "${TGT_ORG_DIR}/ca"
mkdir -p "${TGT_WALLET_DIR}"

# Copy files
cp -f "${SRC_DIR}/connection-org1.json" "${TGT_ORG_DIR}/"
cp -f "${SRC_DIR}/tlsca/"* "${TGT_ORG_DIR}/tlsca/" 2>/dev/null || true
cp -f "${SRC_DIR}/ca/"* "${TGT_ORG_DIR}/ca/" 2>/dev/null || true

# Copy wallet files if they exist
if [ -d "${WALLET_DIR}" ]; then
    cp -f "${WALLET_DIR}/"* "${TGT_WALLET_DIR}/" 2>/dev/null || true
fi

echo "Files copied to Windows at: ${WIN_PATH}"
EOL

chmod +x "$USER_HOME/copy-to-windows.sh"
echo "Created copy script at $USER_HOME/copy-to-windows.sh"

# Create wallet directory if it doesn't exist
WALLET_DIR="$USER_HOME/fabric-connection/wallet"
mkdir -p "$WALLET_DIR"

# Now, create admin and user identities to use with Fabric
echo "Creating admin identity..."
cat > "$WALLET_DIR/admin.id" << 'EOL'
{
    "credentials": {
        "certificate": "-----BEGIN CERTIFICATE-----\nMIICATCCAaigAwIBAgIUXkAy9LKcsp9CtuT6kO5Xd0U5eAkwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIxMDAwWhcNMjMwMjAyMjIx\nNTAwWjAhMQ8wDQYDVQQLEwZjbGllbnQxDjAMBgNVBAMTBWFkbWluMFkwEwYHKoZI\nzj0CAQYIKoZIzj0DAQcDQgAE+qK8iE6yqUuZ7Yo0fwWU2uZdpWzT+JqQ1jdnSUZF\nMFzVKBJdG6MJQbFMDBQFHkCozfbAj5rD4Udte9c8B8UZVaNgMF4wDgYDVR0PAQH/\nBAQDAgeAMAwGA1UdEwEB/wQCMAAwHQYDVR0OBBYEFBKs+VZhfYZnH5Oqw3D3Z3yg\nH+X+MCkGA1UdIwQiMCCAILOEoeGoEG+UZHhQSZV5aGZa8qRAqkjD5EHWc5ba7gKF\nMAoGCCqGSM49BAMCA0cAMEQCICT2a6n3Tu8VYQIxNe4NjJRUNfdSPAXLZ+MD5rI6\nWHPlAiBxZlGzZajjzNMnUCQiw9RPjGPkEy0YdKq6OY5/2Z5KXQ==\n-----END CERTIFICATE-----",
        "privateKey": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgcII8LNJdRl2rz4TD\nH9Pda2Q0yguw+C7hNW9wGlTs9WShRANCAATFlBx9L55MKh8vojbwvB7GzFXfnlUB\nCKAFx5MmdZCC+LlxpkBrFA2ww0UFODcZPq4XYP+NrwUD/MXGhK6l6/ct\n-----END PRIVATE KEY-----"
    },
    "mspId": "Org1MSP",
    "type": "X.509",
    "version": 1
}
EOL

echo "Creating application user identity..."
cat > "$WALLET_DIR/appUser.id" << 'EOL'
{
    "credentials": {
        "certificate": "-----BEGIN CERTIFICATE-----\nMIIChDCCAiqgAwIBAgIUKRVW8KNjB6K895Y+rJxghSBpTmIwCgYIKoZIzj0EAwIw\nczELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh\nbiBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT\nE2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMjIwMjAyMjIxNTAwWhcNMjMwMjAyMjIy\nMDAwWjBAMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw\nYXJ0bWVudDExDDAKBgNVBAMTA3RvbTBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IA\nBBnROnUnTJGk/Rlh07off6xPwekicC3rPIjCn3LZw9L9JPzJUkDet8EcwCPgeWJI\nGKvHbIW5QSN6GFc1WVEkBl6jgcgwgcUwDgYDVR0PAQH/BAQDAgeAMAwGA1UdEwEB\n/wQCMAAwHQYDVR0OBBYEFPZUXzZGLnXHGO+TpV3+izCR6TrfMCkGA1UdIwQiMCCA\nILOEoeGoEG+UZHhQSZV5aGZa8qRAqkjD5EHWc5ba7gKFMGkGCCoDBAUGBwgBBF17\nImF0dHJzIjp7ImhmLkFmZmlsaWF0aW9uIjoib3JnMS5kZXBhcnRtZW50MSIsImhm\nLkVucm9sbG1lbnRJRCI6InRvbSIsImhmLlR5cGUiOiJjbGllbnQifX0wCgYIKoZI\nzj0EAwIDRwAwRAIgQhqeXw6sI9YEl9oxpV7rXPSZx20sUUfGMnkPRn4Y94sCICuT\nf1IRT9ueP2YOkBfQmkYMGQY+PpVpUMEYz5wRSqmp\n-----END CERTIFICATE-----",
        "privateKey": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgO88H85zJ+NRHiTRo\ngU3Fz6sVDbNPVxWj3dMIbxRIpYyhRANCAAQZ0Tp1J0yRpP0ZYdO6H3+sT8HpInAt\n6zyIwp9y2cPS/ST8yVJA3rfBHMAj4HliSBirx2yFuUEjehhXNVlRJAZe\n-----END PRIVATE KEY-----"
    },
    "mspId": "Org1MSP",
    "type": "X.509",
    "version": 1
}
EOL

echo "Wallet identities created successfully at $WALLET_DIR"

echo "============================================================"
echo "Setup complete! Now run the following commands from Windows:"
echo "wsl -d Ubuntu-22.04 -e ~/copy-to-windows.sh \"/mnt/d/Android Projects/secure-vote-interaction\""
echo "npm run fabric:wsl"
echo "npm run dev" 