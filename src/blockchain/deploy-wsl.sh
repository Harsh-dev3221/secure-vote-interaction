#!/bin/bash

# This script will deploy the chaincode in WSL environment
# It assumes Hyperledger Fabric test-network is already set up

echo "==== Starting chaincode deployment ===="

# 1. Set environment variables
export FABRIC_SAMPLES_DIR="/home/vote/hyperledger/fabric/fabric-samples"
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051
export PATH=${FABRIC_SAMPLES_DIR}/bin:$PATH
export FABRIC_CFG_PATH=${FABRIC_SAMPLES_DIR}/config

# 2. Check if the test network is running
if ! docker ps | grep -q "peer0.org1.example.com"; then
    echo "Error: Hyperledger Fabric network does not appear to be running."
    echo "Please start the test network first with:"
    echo "cd $FABRIC_SAMPLES_DIR/test-network && ./network.sh up createChannel -ca"
    exit 1
fi

echo "Hyperledger Fabric network is running."
echo "Checking for existing chaincode..."

# Check if chaincode is already installed
EXISTING_CC=$(peer lifecycle chaincode queryinstalled 2>&1 | grep -o "voting_1\.0:[a-zA-Z0-9]*" || true)

if [ -n "$EXISTING_CC" ]; then
    echo "Chaincode is already installed with ID: $EXISTING_CC"
    echo "Skipping installation and directly verifying chaincode..."
    
    # Extract the package ID
    PACKAGE_ID=$(echo $EXISTING_CC | awk -F: '{print $2}')
    
    # Verify that chaincode is committed
    COMMITTED=$(peer lifecycle chaincode querycommitted -C mychannel --name voting 2>&1 || true)
    
    if [[ $COMMITTED == *"Version: 1.0"* ]]; then
        echo "Chaincode is already committed to the channel."
        echo "==== Chaincode deployment verification completed ===="
        exit 0
    else
        echo "Chaincode is installed but not committed. Continuing with approval and commit..."
    fi
else
    echo "No existing chaincode found. Proceeding with installation..."

    # 3. Create a temporary directory for the chaincode
    TEMP_CC_DIR=$(mktemp -d)
    echo "Created temporary directory for chaincode: $TEMP_CC_DIR"

    # 4. Create go.mod file
    cat > $TEMP_CC_DIR/go.mod << EOL
module voting

go 1.18

require (
	github.com/hyperledger/fabric-chaincode-go v0.0.0-20210718160520-38d29fabecb9
	github.com/hyperledger/fabric-contract-api-go v1.1.1
)
EOL

    # 5. Create chaincode file
    cat > $TEMP_CC_DIR/voting.go << EOL
package main

import (
	"encoding/json"
	"fmt"
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing voting
type SmartContract struct {
	contractapi.Contract
}

// Voter represents a voter in the system
type Voter struct {
	VoterID  string \`json:"voterID"\`
	Name     string \`json:"name"\`
	Email    string \`json:"email"\`
	HasVoted bool   \`json:"hasVoted"\`
}

// Election represents the state of an election
type Election struct {
	ElectionID string         \`json:"electionID"\`
	Title      string         \`json:"title"\`
	Candidates []string       \`json:"candidates"\`
	Votes      map[string]int \`json:"votes"\`
}

// VoteReceipt is a record of a user's vote
type VoteReceipt struct {
	VoterID    string \`json:"voterID"\`
	ElectionID string \`json:"electionID"\`
	CandidateID string \`json:"candidateID"\`
	Timestamp  string \`json:"timestamp"\`
	Hash       string \`json:"hash"\`
}

// InitLedger adds a base set of data to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	log.Println("InitLedger")
	
	// Initialize with a sample election
	election := Election{
		ElectionID: "election1",
		Title:      "Presidential Election 2023",
		Candidates: []string{"Candidate A", "Candidate B", "Candidate C"},
		Votes:      make(map[string]int),
	}
	
	electionJSON, err := json.Marshal(election)
	if err != nil {
		return err
	}
	
	err = ctx.GetStub().PutState("election1", electionJSON)
	if err != nil {
		return fmt.Errorf("failed to put election to world state: %v", err)
	}
	
	return nil
}

// RegisterVoter adds a new voter to the world state
func (s *SmartContract) RegisterVoter(ctx contractapi.TransactionContextInterface, voterID string, name string, email string) error {
	voter := Voter{
		VoterID:  voterID,
		Name:     name,
		Email:    email,
		HasVoted: false,
	}
	
	voterJSON, err := json.Marshal(voter)
	if err != nil {
		return err
	}
	
	return ctx.GetStub().PutState(voterID, voterJSON)
}

// GetVoter returns the voter stored in the world state with given id
func (s *SmartContract) GetVoter(ctx contractapi.TransactionContextInterface, voterID string) (*Voter, error) {
	voterJSON, err := ctx.GetStub().GetState(voterID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if voterJSON == nil {
		return nil, fmt.Errorf("the voter %s does not exist", voterID)
	}
	
	var voter Voter
	err = json.Unmarshal(voterJSON, &voter)
	if err != nil {
		return nil, err
	}
	
	return &voter, nil
}

// CastVote records a vote for a candidate in an election
func (s *SmartContract) CastVote(ctx contractapi.TransactionContextInterface, voterID string, electionID string, candidateID string, timestamp string, hash string) error {
	// Get the voter
	voterJSON, err := ctx.GetStub().GetState(voterID)
	if err != nil {
		return fmt.Errorf("failed to read voter from world state: %v", err)
	}
	if voterJSON == nil {
		return fmt.Errorf("the voter %s does not exist", voterID)
	}
	
	var voter Voter
	err = json.Unmarshal(voterJSON, &voter)
	if err != nil {
		return err
	}
	
	// Check if voter has already voted
	if voter.HasVoted {
		return fmt.Errorf("voter %s has already cast a vote", voterID)
	}
	
	// Get the election
	electionJSON, err := ctx.GetStub().GetState(electionID)
	if err != nil {
		return fmt.Errorf("failed to read election from world state: %v", err)
	}
	if electionJSON == nil {
		return fmt.Errorf("the election %s does not exist", electionID)
	}
	
	var election Election
	err = json.Unmarshal(electionJSON, &election)
	if err != nil {
		return err
	}
	
	// Check if candidate exists
	candidateExists := false
	for _, c := range election.Candidates {
		if c == candidateID {
			candidateExists = true
			break
		}
	}
	if !candidateExists {
		return fmt.Errorf("candidate %s does not exist in election %s", candidateID, electionID)
	}
	
	// Record the vote
	election.Votes[candidateID]++
	electionJSON, err = json.Marshal(election)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(electionID, electionJSON)
	if err != nil {
		return fmt.Errorf("failed to update election: %v", err)
	}
	
	// Mark voter as having voted
	voter.HasVoted = true
	voterJSON, err = json.Marshal(voter)
	if err != nil {
		return err
	}
	err = ctx.GetStub().PutState(voterID, voterJSON)
	if err != nil {
		return fmt.Errorf("failed to update voter: %v", err)
	}
	
	// Create and store vote receipt
	receipt := VoteReceipt{
		VoterID:    voterID,
		ElectionID: electionID,
		CandidateID: candidateID,
		Timestamp:  timestamp,
		Hash:       hash,
	}
	receiptJSON, err := json.Marshal(receipt)
	if err != nil {
		return err
	}
	receiptKey := fmt.Sprintf("receipt_%s_%s", voterID, electionID)
	return ctx.GetStub().PutState(receiptKey, receiptJSON)
}

// GetElectionResults returns the current state of votes in an election
func (s *SmartContract) GetElectionResults(ctx contractapi.TransactionContextInterface, electionID string) (*Election, error) {
	electionJSON, err := ctx.GetStub().GetState(electionID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if electionJSON == nil {
		return nil, fmt.Errorf("the election %s does not exist", electionID)
	}
	
	var election Election
	err = json.Unmarshal(electionJSON, &election)
	if err != nil {
		return nil, err
	}
	
	return &election, nil
}

// VerifyVoteReceipt verifies a voter's vote receipt
func (s *SmartContract) VerifyVoteReceipt(ctx contractapi.TransactionContextInterface, voterID string, electionID string, hash string) (bool, error) {
	receiptKey := fmt.Sprintf("receipt_%s_%s", voterID, electionID)
	receiptJSON, err := ctx.GetStub().GetState(receiptKey)
	if err != nil {
		return false, fmt.Errorf("failed to read receipt: %v", err)
	}
	if receiptJSON == nil {
		return false, fmt.Errorf("no receipt found for voter %s in election %s", voterID, electionID)
	}
	
	var receipt VoteReceipt
	err = json.Unmarshal(receiptJSON, &receipt)
	if err != nil {
		return false, err
	}
	
	return receipt.Hash == hash, nil
}

func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		log.Panicf("Error creating voting chaincode: %v", err)
	}
	
	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting voting chaincode: %v", err)
	}
}
EOL

    # 6. Deploy chaincode
    echo "Deploying voting chaincode..."
    cd $FABRIC_SAMPLES_DIR/test-network

    # 6.1 Package the chaincode
    echo "Packaging chaincode..."
    peer lifecycle chaincode package voting.tar.gz --path $TEMP_CC_DIR --lang golang --label voting_1.0

    # 6.2 Install the chaincode
    echo "Installing chaincode on peer0.org1..."
    peer lifecycle chaincode install voting.tar.gz || {
        echo "Error installing chaincode. This might be due to a previous installation."
        echo "Continuing with existing chaincode if possible..."
    }

    # 6.3 Get the package ID
    PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep voting_1.0 | awk '{print $3}' | sed 's/,$//')
    if [ -z "$PACKAGE_ID" ]; then
        echo "Error: Failed to get package ID for installed chaincode"
        exit 1
    fi
    echo "Chaincode package ID: $PACKAGE_ID"
fi

# 6.4 Approve the chaincode
echo "Approving chaincode definition for org1..."
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name voting --version 1.0 --package-id $PACKAGE_ID --sequence 1 --tls --cafile ${FABRIC_SAMPLES_DIR}/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem || true

# 6.5 Check commit readiness
echo "Checking commit readiness..."
peer lifecycle chaincode checkcommitreadiness --channelID mychannel --name voting --version 1.0 --sequence 1 --tls --cafile ${FABRIC_SAMPLES_DIR}/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --output json

# 6.6 Commit the chaincode
echo "Committing chaincode definition to the channel..."
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --channelID mychannel --name voting --version 1.0 --sequence 1 --tls --cafile ${FABRIC_SAMPLES_DIR}/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem --peerAddresses localhost:7051 --tlsRootCertFiles ${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt || true

# 6.7 Initialize the ledger
echo "Initializing the ledger..."
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile ${FABRIC_SAMPLES_DIR}/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem -C mychannel -n voting --peerAddresses localhost:7051 --tlsRootCertFiles ${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt -c '{"function":"InitLedger","Args":[]}' || {
    echo "Failed to initialize ledger. This is normal if the chaincode has already been initialized."
    echo "Trying to query the ledger to verify it's working..."
    peer chaincode query -C mychannel -n voting -c '{"function":"GetElectionResults","Args":["election1"]}' || {
        echo "Warning: Unable to query the chaincode. There might be an issue with the deployment."
    }
}

# 7. Clean up
if [ -n "$TEMP_CC_DIR" ] && [ -d "$TEMP_CC_DIR" ]; then
    echo "Cleaning up temporary directory..."
    rm -rf $TEMP_CC_DIR
fi

echo "==== Chaincode deployment completed ====" 