'use strict';

const { Contract } = require('fabric-contract-api');

class VotingContract extends Contract {
    async initLedger(ctx) {
        console.log('Initialize the voting ledger');
        
        const election = {
            id: 'election2024',
            name: 'Presidential Election 2024',
            candidates: [
                { id: 1, name: 'Jane Smith', party: 'Progressive Party', votes: 0 },
                { id: 2, name: 'John Adams', party: 'Conservative Alliance', votes: 0 },
                { id: 3, name: 'Sarah Johnson', party: 'Citizens United', votes: 0 },
                { id: 4, name: 'Michael Chen', party: 'Reform Movement', votes: 0 },
                { id: 5, name: 'David Rodriguez', party: 'Independent', votes: 0 }
            ],
            totalVotes: 0
        };
        
        await ctx.stub.putState('election2024', Buffer.from(JSON.stringify(election)));
        
        console.log('Election data initialized');
    }
    
    // Register a voter
    async registerVoter(ctx, aadhaarNumber) {
        console.log('Registering voter with Aadhaar:', aadhaarNumber.substring(0, 4) + '****');
        
        // Hash the Aadhaar number for privacy
        const crypto = require('crypto');
        const voterId = crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
        
        // Check if voter already exists
        const voterAsBytes = await ctx.stub.getState(voterId);
        if (voterAsBytes && voterAsBytes.length > 0) {
            console.log('Voter already registered');
            return JSON.stringify({
                success: false,
                message: 'Voter already registered'
            });
        }
        
        // Register the voter
        const voter = {
            id: voterId,
            registered: true,
            hasVoted: false,
            registeredAt: new Date().toISOString()
        };
        
        await ctx.stub.putState(voterId, Buffer.from(JSON.stringify(voter)));
        
        return JSON.stringify({
            success: true,
            message: 'Voter registered successfully',
            voterId: voterId
        });
    }
    
    // Cast a vote
    async castVote(ctx, aadhaarNumber, candidateId) {
        console.log('Casting vote for candidate:', candidateId);
        
        // Hash the Aadhaar number for privacy
        const crypto = require('crypto');
        const voterId = crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
        
        // Check if voter exists
        const voterAsBytes = await ctx.stub.getState(voterId);
        if (!voterAsBytes || voterAsBytes.length === 0) {
            console.log('Voter not registered');
            return JSON.stringify({
                success: false,
                message: 'Voter not registered'
            });
        }
        
        // Check if voter has already voted
        const voter = JSON.parse(voterAsBytes.toString());
        if (voter.hasVoted) {
            console.log('Voter has already cast a vote');
            return JSON.stringify({
                success: false,
                message: 'Voter has already cast a vote'
            });
        }
        
        // Get the election
        const electionAsBytes = await ctx.stub.getState('election2024');
        if (!electionAsBytes || electionAsBytes.length === 0) {
            console.log('Election not found');
            return JSON.stringify({
                success: false,
                message: 'Election not found'
            });
        }
        
        const election = JSON.parse(electionAsBytes.toString());
        
        // Find the candidate
        const candidateIndex = election.candidates.findIndex(c => c.id == candidateId);
        if (candidateIndex === -1) {
            console.log('Candidate not found');
            return JSON.stringify({
                success: false,
                message: 'Candidate not found'
            });
        }
        
        // Increment votes
        election.candidates[candidateIndex].votes += 1;
        election.totalVotes += 1;
        
        // Update the election
        await ctx.stub.putState('election2024', Buffer.from(JSON.stringify(election)));
        
        // Mark voter as having voted
        voter.hasVoted = true;
        voter.votedAt = new Date().toISOString();
        
        // Generate receipt code
        const receiptCode = Math.random().toString(36).substring(2, 12);
        voter.receiptCode = receiptCode;
        voter.candidateId = parseInt(candidateId);
        
        // Update the voter
        await ctx.stub.putState(voterId, Buffer.from(JSON.stringify(voter)));
        
        // Store receipt
        const receipt = {
            voterId: voterId,
            candidateId: parseInt(candidateId),
            timestamp: new Date().toISOString(),
            txId: ctx.stub.getTxID()
        };
        
        await ctx.stub.putState(receiptCode, Buffer.from(JSON.stringify(receipt)));
        
        return JSON.stringify({
            success: true,
            message: 'Vote cast successfully',
            receiptCode: receiptCode,
            txId: receipt.txId
        });
    }
    
    // Get election results
    async getElectionResults(ctx, electionId) {
        console.log('Getting results for election:', electionId);
        
        const electionAsBytes = await ctx.stub.getState(electionId);
        if (!electionAsBytes || electionAsBytes.length === 0) {
            console.log('Election not found');
            return JSON.stringify({
                success: false,
                message: 'Election not found'
            });
        }
        
        const election = JSON.parse(electionAsBytes.toString());
        
        return JSON.stringify({
            success: true,
            election: election
        });
    }
    
    // Verify receipt
    async verifyReceipt(ctx, receiptCode) {
        console.log('Verifying receipt:', receiptCode);
        
        const receiptAsBytes = await ctx.stub.getState(receiptCode);
        if (!receiptAsBytes || receiptAsBytes.length === 0) {
            console.log('Receipt not found');
            return JSON.stringify({
                success: false,
                message: 'Receipt not found'
            });
        }
        
        const receipt = JSON.parse(receiptAsBytes.toString());
        
        return JSON.stringify({
            success: true,
            receipt: receipt
        });
    }
}

module.exports = VotingContract;