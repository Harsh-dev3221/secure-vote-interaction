'use strict';

const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

class VotingContract extends Contract {
    async initLedger(ctx) {
        console.log('Initialize the election ledger');

        const elections = {
            election2024: {
                candidates: [
                    { id: 1, name: 'Jane Smith', party: 'Progressive Party', votes: 0 },
                    { id: 2, name: 'John Adams', party: 'Conservative Alliance', votes: 0 },
                    { id: 3, name: 'Sarah Johnson', party: 'Citizens United', votes: 0 },
                    { id: 4, name: 'Michael Chen', party: 'Reform Movement', votes: 0 },
                    { id: 5, name: 'David Rodriguez', party: 'Independent', votes: 0 }
                ],
                totalVotes: 0
            }
        };

        await ctx.stub.putState('ELECTIONS', Buffer.from(JSON.stringify(elections)));
        console.log('Election ledger initialized');

        const registeredVoters = {};
        await ctx.stub.putState('VOTERS', Buffer.from(JSON.stringify(registeredVoters)));
        console.log('Voters registry initialized');

        const receipts = {};
        await ctx.stub.putState('RECEIPTS', Buffer.from(JSON.stringify(receipts)));
        console.log('Receipts ledger initialized');

        return JSON.stringify(elections);
    }

    async registerVoter(ctx, aadhaarNumber) {
        // Hash the Aadhaar number for privacy
        const voterId = this._hashVoterId(aadhaarNumber);

        // Get current voters
        const votersJSON = await ctx.stub.getState('VOTERS');
        const voters = JSON.parse(votersJSON.toString());

        // Check if voter is already registered
        if (voters[voterId]) {
            return JSON.stringify({
                success: false,
                message: 'Voter already registered'
            });
        }

        // Register the voter
        voters[voterId] = {
            registered: true,
            hasVoted: false,
            registeredAt: new Date().toISOString()
        };

        await ctx.stub.putState('VOTERS', Buffer.from(JSON.stringify(voters)));

        return JSON.stringify({
            success: true,
            message: 'Voter registered successfully',
            voterId: voterId
        });
    }

    async castVote(ctx, aadhaarNumber, candidateId) {
        // Hash the Aadhaar number
        const voterId = this._hashVoterId(aadhaarNumber);

        // Get current voters
        const votersJSON = await ctx.stub.getState('VOTERS');
        const voters = JSON.parse(votersJSON.toString());

        // Check if voter exists
        if (!voters[voterId]) {
            return JSON.stringify({
                success: false,
                message: 'Voter not registered'
            });
        }

        // Check if voter has already voted
        if (voters[voterId].hasVoted) {
            return JSON.stringify({
                success: false,
                message: 'Voter has already cast a vote'
            });
        }

        // Get elections
        const electionsJSON = await ctx.stub.getState('ELECTIONS');
        const elections = JSON.parse(electionsJSON.toString());

        // Update candidate votes
        const election = elections.election2024;
        const candidateIndex = election.candidates.findIndex(c => c.id == candidateId);

        if (candidateIndex === -1) {
            return JSON.stringify({
                success: false,
                message: 'Candidate not found'
            });
        }

        // Increment votes
        election.candidates[candidateIndex].votes += 1;
        election.totalVotes += 1;

        // Mark voter as having voted
        voters[voterId].hasVoted = true;
        voters[voterId].votedAt = new Date().toISOString();

        // Generate receipt code
        const receiptCode = this._generateReceiptCode();

        // Store receipt
        const receiptsJSON = await ctx.stub.getState('RECEIPTS');
        const receipts = JSON.parse(receiptsJSON.toString());

        receipts[receiptCode] = {
            voterId: voterId,
            candidateId: candidateId,
            timestamp: new Date().toISOString(),
            txId: ctx.stub.getTxID()
        };

        // Update all states
        await ctx.stub.putState('ELECTIONS', Buffer.from(JSON.stringify(elections)));
        await ctx.stub.putState('VOTERS', Buffer.from(JSON.stringify(voters)));
        await ctx.stub.putState('RECEIPTS', Buffer.from(JSON.stringify(receipts)));

        return JSON.stringify({
            success: true,
            message: 'Vote cast successfully',
            receiptCode: receiptCode,
            txId: ctx.stub.getTxID()
        });
    }

    async getElectionResults(ctx, electionId) {
        const electionsJSON = await ctx.stub.getState('ELECTIONS');
        const elections = JSON.parse(electionsJSON.toString());

        if (!elections[electionId]) {
            return JSON.stringify({
                success: false,
                message: 'Election not found'
            });
        }

        return JSON.stringify({
            success: true,
            election: elections[electionId]
        });
    }

    async verifyReceipt(ctx, receiptCode) {
        const receiptsJSON = await ctx.stub.getState('RECEIPTS');
        const receipts = JSON.parse(receiptsJSON.toString());

        if (!receipts[receiptCode]) {
            return JSON.stringify({
                success: false,
                message: 'Receipt not found'
            });
        }

        return JSON.stringify({
            success: true,
            receipt: receipts[receiptCode]
        });
    }

    // Helper methods
    _hashVoterId(aadhaarNumber) {
        return crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
    }

    _generateReceiptCode() {
        return Math.random().toString(36).substring(2, 12);
    }
}

module.exports = VotingContract; 