const { ethers } = require("hardhat");

// Contract interaction functions
const contractFunctions = {
    // Initialize with contract address
    init: async function (contractAddress) {
        const Voting = await ethers.getContractFactory("Voting");
        this.contract = await Voting.attach(contractAddress);
        return this.contract;
    },

    // Cast a vote for a candidate
    castVote: async function (candidateId, voterAddress) {
        try {
            // Get the signer for the voter's address
            const signer = await ethers.getSigner(voterAddress);
            const votingWithSigner = this.contract.connect(signer);

            // Cast the vote
            const tx = await votingWithSigner.vote(candidateId);
            await tx.wait();

            return {
                success: true,
                transactionHash: tx.hash
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Get all candidates and their vote counts
    getCandidates: async function () {
        try {
            const candidateCount = await this.contract.getCandidateCount();
            const candidates = [];

            for (let i = 0; i < candidateCount; i++) {
                const candidate = await this.contract.getCandidate(i);
                candidates.push({
                    id: i,
                    name: candidate.name,
                    voteCount: candidate.voteCount.toString()
                });
            }

            return {
                success: true,
                candidates
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    },

    // Check if an address has already voted
    hasVoted: async function (voterAddress) {
        try {
            const voted = await this.contract.hasVoted(voterAddress);
            return {
                success: true,
                hasVoted: voted
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
};

module.exports = contractFunctions; 