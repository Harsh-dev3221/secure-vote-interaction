const hre = require("hardhat");

async function main() {
    // Candidate names to initialize the contract with
    const candidateNames = ["Candidate 1", "Candidate 2", "Candidate 3"];

    // Deploy the contract
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidateNames);

    // Wait for the deployment transaction to be mined
    await voting.waitForDeployment();

    console.log("Voting contract deployed to:", await voting.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 