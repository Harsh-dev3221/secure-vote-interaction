#!/bin/bash

# Hyperledger Fabric Docker Setup Script

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RESET='\033[0m'

# Print section headers
section() {
  echo -e "${BLUE}========== $1 ==========${RESET}"
}

success() {
  echo -e "${GREEN}$1${RESET}"
}

warn() {
  echo -e "${YELLOW}$1${RESET}"
}

error() {
  echo -e "${RED}$1${RESET}"
}

# Check if Docker is installed and running
section "Checking Docker"
if ! command -v docker &>/dev/null; then
  error "Docker is not installed. Please install Docker first."
  exit 1
fi

if ! docker info &>/dev/null; then
  error "Docker daemon is not running. Please start Docker."
  exit 1
fi

success "Docker is installed and running."

# Check if Docker Compose is installed
section "Checking Docker Compose"
if ! command -v docker-compose &>/dev/null; then
  warn "Docker Compose not found as standalone command. Checking if it's available via docker."
  if ! docker compose version &>/dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose."
    exit 1
  else
    success "Docker Compose is available via 'docker compose'."
    COMPOSE_CMD="docker compose"
  fi
else
  success "Docker Compose is installed."
  COMPOSE_CMD="docker-compose"
fi

# Create wallet directory if it doesn't exist
section "Setting up directories"
mkdir -p wallet
success "Created wallet directory"

# Stop any existing containers
section "Stopping existing containers"
$COMPOSE_CMD -f docker-compose-direct.yaml down
success "Stopped any existing containers"

# Build Docker images
section "Building Docker images"
docker build -t secure-vote-api -f Dockerfile.api .
success "Built API server Docker image"

# Start Docker Compose
section "Starting Docker Compose services"
$COMPOSE_CMD -f docker-compose-direct.yaml up -d
success "Started Docker Compose services"

# Wait for services to start
section "Waiting for services to start"
sleep 5
success "Services should be running now"

# Check if services are running
section "Checking service status"
docker ps

# Print connection information
section "Connection Information"
echo "API Server: http://localhost:3002"
echo "Peer: localhost:7051"
echo "CA: localhost:7054"

section "Testing API Connection"
curl -s http://localhost:3002/api/test
echo ""

section "Setup Complete"
echo "Your Hyperledger Fabric network and API server are now running in Docker."
echo "You can access the API at http://localhost:3002"
echo "To stop the services, run: $COMPOSE_CMD -f docker-compose-direct.yaml down" 
