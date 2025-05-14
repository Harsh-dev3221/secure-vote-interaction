async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy the Voting contract with candidate names
    const candidates = ["Jane Smith", "John Adams", "Sarah Johnson", "Michael Chen"];
    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidates);

    await voting.deployed();
    console.log("Voting contract deployed to:", voting.address);

    // Save the contract address and deployment information
    const fs = require('fs');
    const contractData = {
        address: voting.address,
        network: {
            name: "ganache",
            chainId: 1337,
            url: "http://127.0.0.1:7545"
        },
        deployedAt: new Date().toISOString(),
        candidates
    };

    fs.writeFileSync('contract-address.json', JSON.stringify(contractData, null, 2));
    console.log("Contract address saved to contract-address.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 