const hre = require("hardhat");

async function main() {
    // Candidate names to initialize the contract with
    const candidateNames = ["Candidate 1", "Candidate 2", "Candidate 3"];

    // Deploy the contract
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(candidateNames);

    await voting.deployed();

    console.log("Voting contract deployed to:", voting.address);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    }); 