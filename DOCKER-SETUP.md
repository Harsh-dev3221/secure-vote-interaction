# Docker Setup for Secure Vote Application

This guide explains how to set up and run the Secure Vote application using Docker, which simplifies the deployment and avoids WSL compatibility issues.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (usually comes with Docker Desktop)
- Port 3002 free on your machine (for the API server)
- Ports 7051 and 7054 free on your machine (for Fabric peer and CA)

## Quick Start

Run the following command to set up and start the Docker environment:

```bash
npm run fabric:docker-setup
```

This will:
1. Build the Docker images
2. Start the Hyperledger Fabric network
3. Start the API server
4. Test the connection

Once started, you can access the API at http://localhost:3002

## Architecture

The Docker setup includes:

1. **API Server Container**: Runs your Node.js application with direct access to the Fabric network
2. **Peer Container**: Runs the Hyperledger Fabric peer node
3. **CA Container**: Runs the Hyperledger Fabric certificate authority

All containers are connected via a Docker network, allowing seamless communication without certificate issues.

## Stopping the Environment

To stop all services:

```bash
npm run fabric:docker-down
```

## Manually Testing the API

You can test the API using curl commands:

```bash
# Check status
curl http://localhost:3002/api/status

# Register a voter
curl -X POST -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012"}' \
  http://localhost:3002/api/voters/register

# Cast a vote
curl -X POST -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012", "candidateId": 1}' \
  http://localhost:3002/api/votes/cast

# Get election results
curl http://localhost:3002/api/elections/election2024/results
```

## Troubleshooting

### Container not starting
Check Docker logs:
```bash
docker logs secure-vote-api
docker logs peer0.org1.example.com
docker logs ca.org1.example.com
```

### API not accessible
Check if containers are running:
```bash
docker ps
```

### Database issues
The data is stored in Docker volumes. To reset all data:
```bash
docker-compose -f docker-compose-direct.yaml down -v
```

## How It Works

This approach uses Docker's networking capabilities to connect all components. Key improvements:

1. **Direct access**: API server has direct access to Fabric network
2. **No certificate issues**: All containers trust each other within the Docker network
3. **Identical environments**: Development and production environments can be kept identical
4. **No WSL dependency**: Eliminates Windows-WSL integration issues
5. **Portable setup**: Works the same on Windows, Mac, and Linux 