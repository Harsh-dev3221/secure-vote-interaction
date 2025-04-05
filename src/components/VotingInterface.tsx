import { useState, useEffect } from "react";
import { Check, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  isEthereumProviderAvailable,
  connectWallet,
  submitVoteToBlockchain,
  getActiveBlockchain,
  setActiveBlockchain,
  getPendingVotes
} from "@/services/blockchainService";
import {
  isFabricAvailable,
  castVote as castFabricVote,
  useBlockchainStatus
} from "@/services/fabricBlockchainService";
import apiDebug from "@/utils/apiDebug";

// Mock candidates data
const candidates = [
  {
    id: 1,
    name: "Jane Smith",
    party: "Progressive Party",
    avatar: "https://i.pravatar.cc/150?img=1",
  },
  {
    id: 2,
    name: "John Adams",
    party: "Conservative Alliance",
    avatar: "https://i.pravatar.cc/150?img=2",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    party: "Citizens United",
    avatar: "https://i.pravatar.cc/150?img=3",
  },
  {
    id: 4,
    name: "Michael Chen",
    party: "Reform Movement",
    avatar: "https://i.pravatar.cc/150?img=4",
  },
  {
    id: 5,
    name: "David Rodriguez",
    party: "Independent",
    avatar: "https://i.pravatar.cc/150?img=5",
  },
];

const VotingInterface = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showBlockchainError, showBlockchainSuccess } = useBlockchainStatus();
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [receiptCode, setReceiptCode] = useState<string | null>(null);
  const [activeBlockchain, setActiveBlockchainState] = useState<"ethereum" | "polygon" | "fabric" | "hybrid_local">(getActiveBlockchain());
  const [voteId, setVoteId] = useState<string | null>(null);
  const [pendingVotesCount, setPendingVotesCount] = useState(0);
  const [aadhaarNumber, setAadhaarNumber] = useState<string>("");
  const [aadhaarValid, setAadhaarValid] = useState<boolean>(false);

  // Check for pending votes
  useEffect(() => {
    const pendingVotes = getPendingVotes();
    setPendingVotesCount(pendingVotes.length);
  }, []);

  // Validate Aadhaar number (simple 12-digit check for demo)
  useEffect(() => {
    // In a real implementation, you would have more robust validation
    setAadhaarValid(aadhaarNumber.length === 12 && /^\d+$/.test(aadhaarNumber));
  }, [aadhaarNumber]);

  // Inside the component, add this useEffect for testing connection
  useEffect(() => {
    // Test the API connection when the component mounts
    if (activeBlockchain === "fabric") {
      console.log("Testing Fabric API connection...");
      apiDebug.testConnection()
        .then(connected => {
          if (connected) {
            showBlockchainSuccess("Connected to Hyperledger Fabric server");
          } else {
            showBlockchainError("Could not connect to Hyperledger Fabric server");
          }
        });
    }
  }, [activeBlockchain]);

  const handleCandidateSelect = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  const handleContinue = () => {
    setConfirmationStep(true);
  };

  const handleBack = () => {
    setConfirmationStep(false);
    setBlockchainError(null);
  };

  const handleConnectWallet = async () => {
    if (!isEthereumProviderAvailable()) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const account = await connectWallet();
      setWalletConnected(true);
      toast({
        title: "Wallet Connected",
        description: `Connected with account ${account.substring(0, 6)}...${account.substring(38)}`,
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to your Ethereum wallet.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBlockchainChange = (blockchain: "ethereum" | "polygon" | "fabric" | "hybrid_local") => {
    if (blockchain === "hybrid_local") {
      setActiveBlockchainState("hybrid_local");
    } else {
      setActiveBlockchain(blockchain);
      setActiveBlockchainState(blockchain);
    }

    toast({
      title: `${blockchain.charAt(0).toUpperCase() + blockchain.slice(1)} Selected`,
      description: blockchain === "hybrid_local"
        ? "Votes will be stored locally first and can be submitted to blockchain later."
        : blockchain === "fabric"
          ? "Votes will be submitted to Hyperledger Fabric (no gas fees)."
          : `Votes will be submitted to ${blockchain} blockchain.`
    });
  };

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return;

    try {
      setIsSubmitting(true);
      setBlockchainError(null);

      // If using Fabric, we need Aadhaar
      if (activeBlockchain === "fabric") {
        if (!aadhaarValid) {
          setBlockchainError("Please enter a valid 12-digit Aadhaar number");
          setIsSubmitting(false);
          return;
        }

        // Submit to Fabric blockchain
        const result = await castFabricVote(aadhaarNumber, selectedCandidate);

        if (result.success) {
          setReceiptCode(result.receiptCode || null);
          setTransactionHash(result.transactionId || null);
          setIsSuccess(true);
          showBlockchainSuccess("Your vote has been recorded on Hyperledger Fabric.");
        } else {
          throw new Error(result.error || "Failed to submit vote to Fabric");
        }
      } else {
        // If wallet is not connected and we're not in hybrid mode, connect it first
        if (!walletConnected && isEthereumProviderAvailable() && activeBlockchain !== "hybrid_local") {
          await handleConnectWallet();
        }

        // Submit vote using the current blockchain method
        const result = await submitVoteToBlockchain(selectedCandidate);

        // Store transaction info
        if (result.transactionHash) {
          setTransactionHash(result.transactionHash);
        }

        if (result.voteId) {
          setVoteId(result.voteId);
        }

        setIsSuccess(true);

        toast({
          title: "Vote Submitted Successfully",
          description: result.transactionHash
            ? "Your vote has been recorded on the blockchain."
            : "Your vote has been recorded locally and will be submitted to the blockchain later.",
        });
      }

      // Redirect to results after successful vote
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    } catch (error: any) {
      setBlockchainError(error.message || "Failed to submit vote to blockchain");
      showBlockchainError(error.message || "Failed to submit vote");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fallback to simulation if blockchain is not available
  const handleSimulateVote = () => {
    handleBlockchainChange("hybrid_local");
    handleSubmitVote();
  };

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);
  const hasEthereumProvider = isEthereumProviderAvailable();
  const hasFabricProvider = isFabricAvailable();

  // Determine the appropriate blockchain icon/indicator
  const getBlockchainIcon = () => {
    switch (activeBlockchain) {
      case "ethereum":
        return "ETH";
      case "polygon":
        return "MATIC";
      case "fabric":
        return "HLF";
      case "hybrid_local":
        return "LOCAL";
      default:
        return "";
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="h2 mb-2">Presidential Election 2024</h2>
          <p className="text-muted-foreground">
            Select your preferred candidate by tapping on their card
          </p>

          {/* Blockchain selector */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => handleBlockchainChange("ethereum")}
              className={`text-xs px-3 py-1 rounded-full ${activeBlockchain === "ethereum"
                ? "bg-blue-500 text-white"
                : "bg-secondary text-foreground"}`}
            >
              Ethereum
            </button>
            <button
              onClick={() => handleBlockchainChange("polygon")}
              className={`text-xs px-3 py-1 rounded-full ${activeBlockchain === "polygon"
                ? "bg-purple-500 text-white"
                : "bg-secondary text-foreground"}`}
            >
              Polygon
            </button>
            <button
              onClick={() => handleBlockchainChange("fabric")}
              className={`text-xs px-3 py-1 rounded-full ${activeBlockchain === "fabric"
                ? "bg-green-500 text-white"
                : "bg-secondary text-foreground"}`}
            >
              Hyperledger (No Gas)
            </button>
          </div>
        </div>

        {isSuccess ? (
          <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Vote Submitted Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              Your vote has been securely recorded on the blockchain.
            </p>
            {transactionHash && (
              <div className="mb-6 p-3 bg-secondary/50 rounded-lg overflow-hidden text-sm">
                <p className="font-medium mb-1">Transaction Hash:</p>
                <p className="font-mono break-all">{transactionHash}</p>
              </div>
            )}
            {receiptCode && (
              <div className="mb-6 p-3 bg-secondary/50 rounded-lg overflow-hidden text-sm">
                <p className="font-medium mb-1">Receipt Code:</p>
                <p className="font-mono break-all">{receiptCode}</p>
              </div>
            )}
            <button
              onClick={() => navigate("/results")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all"
            >
              View Results
            </button>
          </div>
        ) : !confirmationStep ? (
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center hover:bg-secondary ${selectedCandidate === candidate.id
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-background border border-border"
                    }`}
                  onClick={() => handleCandidateSelect(candidate.id)}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    {selectedCandidate === candidate.id && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-grow">
                    <h4 className="font-medium">{candidate.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {candidate.party}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleContinue}
                disabled={selectedCandidate === null}
                className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Continue
                <ChevronRight className="ml-1 w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-scale-in">
            <h3 className="text-xl font-semibold mb-6 text-center">Confirm Your Vote</h3>

            {selectedCandidateData && (
              <div className="flex flex-col items-center justify-center mb-8">
                <img
                  src={selectedCandidateData.avatar}
                  alt={selectedCandidateData.name}
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
                <h4 className="text-lg font-medium">{selectedCandidateData.name}</h4>
                <p className="text-muted-foreground">{selectedCandidateData.party}</p>
              </div>
            )}

            {/* Blockchain status */}
            <div className="flex items-center gap-2 justify-center mb-4 text-sm">
              <div className={`w-3 h-3 rounded-full ${activeBlockchain === "ethereum" ? 'bg-blue-500' :
                activeBlockchain === "polygon" ? 'bg-purple-500' :
                  activeBlockchain === "fabric" ? 'bg-green-500' :
                    'bg-amber-500'
                }`}></div>
              <span>{getBlockchainIcon()} Blockchain {
                activeBlockchain === "hybrid_local" ? "(Simulation)" : ""
              }</span>
            </div>

            {/* Aadhaar input for Fabric */}
            {activeBlockchain === "fabric" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Aadhaar Number</label>
                <input
                  type="text"
                  value={aadhaarNumber}
                  onChange={(e) => setAadhaarNumber(e.target.value)}
                  placeholder="Enter 12-digit Aadhaar number"
                  className={`w-full p-3 border rounded-lg ${aadhaarNumber && !aadhaarValid ? 'border-red-500' : 'border-border'
                    }`}
                  maxLength={12}
                />
                {aadhaarNumber && !aadhaarValid && (
                  <p className="mt-1 text-sm text-red-500">Please enter a valid 12-digit Aadhaar number</p>
                )}
              </div>
            )}

            {/* Ethereum wallet status */}
            {(activeBlockchain === "ethereum" || activeBlockchain === "polygon") && hasEthereumProvider && (
              <div className="flex items-center gap-2 justify-center mb-4 text-sm">
                <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span>{walletConnected ? 'Wallet Connected' : 'Wallet Ready'}</span>
              </div>
            )}

            {/* Ethereum wallet not available */}
            {(activeBlockchain === "ethereum" || activeBlockchain === "polygon") && !hasEthereumProvider && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No Ethereum wallet detected</p>
                  <p className="text-xs text-amber-700">
                    MetaMask not found. Your vote will be simulated.
                  </p>
                </div>
              </div>
            )}

            {blockchainError && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 mb-4">
                <p className="text-sm font-medium text-destructive">Error: {blockchainError}</p>
              </div>
            )}

            <div className="bg-secondary rounded-lg p-4 mb-6">
              <p className="text-sm text-center text-muted-foreground">
                By submitting your vote, you confirm that this is your final choice.
                Once submitted, your vote cannot be changed.
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={activeBlockchain === "fabric"
                  ? handleSubmitVote
                  : hasEthereumProvider
                    ? handleSubmitVote
                    : handleSimulateVote}
                disabled={isSubmitting || (activeBlockchain === "fabric" && !aadhaarValid)}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {activeBlockchain === "fabric" ? 'Submitting...' :
                      walletConnected ? 'Submitting...' : 'Connecting...'}
                  </>
                ) : (
                  `${activeBlockchain === "hybrid_local"
                    ? 'Simulate Vote'
                    : 'Submit Vote'}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Blockchain explainer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {activeBlockchain === "fabric"
              ? "This voting system is secured by Hyperledger Fabric blockchain without gas fees."
              : "This voting system is secured by blockchain technology to ensure vote integrity and transparency."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default VotingInterface;
