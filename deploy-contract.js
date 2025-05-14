// Simple script to deploy the Voting contract to Ganache
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

async function main() {
    // Connect to Ganache
    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:7545');

    // Get the first account as the deployer
    const accounts = await provider.listAccounts();
    const deployer = provider.getSigner(accounts[0]);
    const deployerAddress = await deployer.getAddress();

    console.log('Deploying from account:', deployerAddress);

    // Read the contract artifact
    const votingABI = [
        {
            "inputs": [
                {
                    "internalType": "string[]",
                    "name": "candidateNames",
                    "type": "string[]"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "voter",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "uint256",
                    "name": "candidateId",
                    "type": "uint256"
                }
            ],
            "name": "VoteCast",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "candidates",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "candidateId",
                    "type": "uint256"
                }
            ],
            "name": "getCandidate",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getCandidateCount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "hasVoted",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "candidateId",
                    "type": "uint256"
                }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    // Read contract bytecode
    const contractBytecode = fs.readFileSync(path.join(__dirname, 'contracts/Voting_bytecode.txt'), 'utf8').trim();

    // Get the factory and deploy
    const factory = new ethers.ContractFactory(
        votingABI,
        contractBytecode,
        deployer
    );

    // Deploy with constructor arguments
    const candidates = ["Jane Smith", "John Adams", "Sarah Johnson", "Michael Chen"];
    const contract = await factory.deploy(candidates);

    console.log('Deploying contract...');
    await contract.deployed();

    console.log('Contract deployed to:', contract.address);

    // Save contract address to file
    const contractData = {
        address: contract.address,
        network: {
            name: 'ganache',
            chainId: 1337,
            url: 'http://127.0.0.1:7545'
        },
        deployedAt: new Date().toISOString(),
        candidates
    };

    fs.writeFileSync('contract-address.json', JSON.stringify(contractData, null, 2));
    console.log('Contract address saved to contract-address.json');
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Deployment failed:', error);
        process.exit(1);
    }); 