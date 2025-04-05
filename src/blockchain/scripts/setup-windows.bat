@echo off
echo Setting up Hyperledger Fabric development environment for Windows...

:: Create required directories
mkdir src\blockchain\bin 2>nul
mkdir src\blockchain\config\templates 2>nul

:: Install required npm packages
echo Installing required packages...
call npm install express cors body-parser nodemon concurrently

echo Setup complete! You can now run:
echo npm run fabric:dev - to start the Fabric server
echo npm run dev:all - to start both the React app and Fabric server 