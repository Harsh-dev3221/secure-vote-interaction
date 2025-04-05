@echo off
echo ========== Checking Docker ==========
docker --version
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop.
    exit /b 1
)

echo ========== Creating wallet directory ==========
mkdir wallet 2>nul
echo Created wallet directory

echo ========== Stopping existing containers ==========
docker-compose -f docker-compose-direct.yaml down
if %ERRORLEVEL% NEQ 0 (
    echo Failed to stop containers.
    echo Trying with 'docker compose' command...
    docker compose -f docker-compose-direct.yaml down
)

echo ========== Building Docker images ==========
docker build -t secure-vote-api -f Dockerfile.api .
echo Built API server Docker image

echo ========== Starting Docker Compose services ==========
docker-compose -f docker-compose-direct.yaml up -d
if %ERRORLEVEL% NEQ 0 (
    echo Failed to start containers.
    echo Trying with 'docker compose' command...
    docker compose -f docker-compose-direct.yaml up -d
)

echo ========== Waiting for services to start ==========
timeout /t 5 /nobreak > nul
echo Services should be running now

echo ========== Checking service status ==========
docker ps

echo ========== Connection Information ==========
echo API Server: http://localhost:3002
echo Peer: localhost:7051
echo CA: localhost:7054

echo ========== Testing API Connection ==========
curl -s http://localhost:3002/api/test

echo.
echo ========== Setup Complete ==========
echo Your Hyperledger Fabric network and API server are now running in Docker.
echo You can access the API at http://localhost:3002
echo To stop the services, run: npm run fabric:docker-down 