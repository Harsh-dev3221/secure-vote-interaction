// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    // Structure for a candidate
    struct Candidate {
        string name;
        uint256 voteCount;
    }
    
    // Array to store all candidates
    Candidate[] public candidates;
    
    // Mapping to track if an address has voted
    mapping(address => bool) public hasVoted;
    
    // Event to emit when a vote is cast
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    
    // Constructor to initialize candidates
    constructor(string[] memory candidateNames) {
        for (uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate({
                name: candidateNames[i],
                voteCount: 0
            }));
        }
    }
    
    // Function to cast a vote
    function vote(uint256 candidateId) public {
        require(candidateId < candidates.length, "Invalid candidate ID");
        require(!hasVoted[msg.sender], "You have already voted");
        
        candidates[candidateId].voteCount++;
        hasVoted[msg.sender] = true;
        
        emit VoteCast(msg.sender, candidateId);
    }
    
    // Function to get the total number of candidates
    function getCandidateCount() public view returns (uint256) {
        return candidates.length;
    }
    
    // Function to get candidate details
    function getCandidate(uint256 candidateId) public view returns (string memory name, uint256 voteCount) {
        require(candidateId < candidates.length, "Invalid candidate ID");
        Candidate memory candidate = candidates[candidateId];
        return (candidate.name, candidate.voteCount);
    }
} 