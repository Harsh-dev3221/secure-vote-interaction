'use strict';

const { Contract } = require('fabric-contract-api');

class VotingContract extends Contract {

    // Initialize the ledger with election details
    async initElection(ctx, electionId, name, startTime, endTime) {
        const election = {
            id: electionId,
            name: name,
            startTime: parseInt(startTime),
            endTime: parseInt(endTime),
            candidates: [],
            active: true,
            type: 'election'
        };

        // Store election in state database
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));
        return JSON.stringify(election);
    }

    // Add candidates to an election
    async addCandidate(ctx, electionId, candidateId, name, party) {
        // Get the election
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }

        const election = JSON.parse(electionAsBytes.toString());

        // Create candidate object
        const candidate = {
            id: candidateId,
            name: name,
            party: party,
            voteCount: 0,
            type: 'candidate'
        };

        // Add to candidates list
        election.candidates.push(candidateId);

        // Update election
        await ctx.stub.putState(electionId, Buffer.from(JSON.stringify(election)));

        // Store candidate separately
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));

        return JSON.stringify(candidate);
    }

    // Register an eligible voter
    async registerVoter(ctx, voterId, electionId) {
        // Check if voter already exists
        const voterAsBytes = await ctx.stub.getState(voterId);
        if (voterAsBytes && voterAsBytes.length > 0) {
            throw new Error(`Voter ${voterId} already registered`);
        }

        // Create voter record
        const voter = {
            id: voterId,
            electionId: electionId,
            hasVoted: false,
            receiptCode: '',
            type: 'voter'
        };

        await ctx.stub.putState(voterId, Buffer.from(JSON.stringify(voter)));
        return JSON.stringify(voter);
    }

    // Cast a vote
    async castVote(ctx, voterId, candidateId, electionId) {
        // Get the voter
        const voterAsBytes = await ctx.stub.getState(voterId);
        if (!voterAsBytes || voterAsBytes.length === 0) {
            throw new Error(`Voter ${voterId} is not registered`);
        }

        // Parse voter data
        const voter = JSON.parse(voterAsBytes.toString());

        // Check if already voted
        if (voter.hasVoted) {
            throw new Error(`Voter ${voterId} has already cast a vote`);
        }

        // Get the election
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }

        const election = JSON.parse(electionAsBytes.toString());

        // Check if election is active
        if (!election.active) {
            throw new Error(`Election ${electionId} is not active`);
        }

        // Check if candidate exists
        const candidateAsBytes = await ctx.stub.getState(candidateId);
        if (!candidateAsBytes || candidateAsBytes.length === 0) {
            throw new Error(`Candidate ${candidateId} does not exist`);
        }

        const candidate = JSON.parse(candidateAsBytes.toString());

        // Update candidate vote count
        candidate.voteCount += 1;
        await ctx.stub.putState(candidateId, Buffer.from(JSON.stringify(candidate)));

        // Generate receipt code
        const receiptCode = Math.random().toString(36).substring(2, 15);

        // Mark voter as having voted
        voter.hasVoted = true;
        voter.receiptCode = receiptCode;
        await ctx.stub.putState(voterId, Buffer.from(JSON.stringify(voter)));

        // Return receipt
        return JSON.stringify({
            receiptCode: receiptCode,
            timestamp: ctx.stub.getTxTimestamp()
        });
    }

    // Get election results (admin only)
    async tallyVotes(ctx, electionId) {
        // Get the election
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }

        const election = JSON.parse(electionAsBytes.toString());

        // Retrieve all candidates and their votes
        const results = [];
        for (const candidateId of election.candidates) {
            const candidateAsBytes = await ctx.stub.getState(candidateId);
            if (candidateAsBytes && candidateAsBytes.length > 0) {
                const candidate = JSON.parse(candidateAsBytes.toString());
                results.push({
                    candidateId: candidate.id,
                    name: candidate.name,
                    party: candidate.party,
                    voteCount: candidate.voteCount
                });
            }
        }

        return JSON.stringify(results);
    }

    // Query election details
    async queryElection(ctx, electionId) {
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            throw new Error(`Election ${electionId} does not exist`);
        }
        return electionAsBytes.toString();
    }
}

module.exports = VotingContract; 