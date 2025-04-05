
import { useState } from "react";
import { Check, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  isEthereumProviderAvailable, 
  connectWallet, 
  submitVoteToBlockchain 
} from "@/services/blockchainService";

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
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [confirmationStep, setConfirmationStep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

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

  const handleSubmitVote = async () => {
    if (!selectedCandidate) return;
    
    try {
      setIsSubmitting(true);
      setBlockchainError(null);
      
      // If wallet is not connected, connect it first
      if (!walletConnected && isEthereumProviderAvailable()) {
        await handleConnectWallet();
      }
      
      // Submit vote to blockchain
      const result = await submitVoteToBlockchain(selectedCandidate);
      
      // Store transaction hash for reference
      if (result.transactionHash) {
        setTransactionHash(result.transactionHash);
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast({
        title: "Vote Submitted Successfully",
        description: "Your vote has been recorded on the blockchain.",
      });
      
      // Redirect to results after successful vote
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    } catch (error: any) {
      setIsSubmitting(false);
      setBlockchainError(error.message || "Failed to submit vote to blockchain");
      
      toast({
        title: "Voting Failed",
        description: "There was an error submitting your vote to the blockchain.",
        variant: "destructive",
      });
    }
  };

  // Fallback to simulation if blockchain is not available
  const handleSimulateVote = () => {
    setIsSubmitting(true);
    
    // Simulate blockchain transaction
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      toast({
        title: "Vote Simulated",
        description: "This is a simulation - in production, your vote would be recorded on the blockchain.",
      });
      
      // Redirect to results after successful vote
      setTimeout(() => {
        navigate("/results");
      }, 2000);
    }, 3000);
  };

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);
  const hasEthereumProvider = isEthereumProviderAvailable();

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="h2 mb-2">Presidential Election 2024</h2>
          <p className="text-muted-foreground">
            Select your preferred candidate by tapping on their card
          </p>
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
                  className={`p-4 rounded-xl cursor-pointer transition-all flex items-center hover:bg-secondary ${
                    selectedCandidate === candidate.id
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
            {hasEthereumProvider ? (
              <div className="flex items-center gap-2 justify-center mb-4 text-sm">
                <div className={`w-3 h-3 rounded-full ${walletConnected ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                <span>{walletConnected ? 'Wallet Connected' : 'Wallet Ready'}</span>
              </div>
            ) : (
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
                onClick={hasEthereumProvider ? handleSubmitVote : handleSimulateVote}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all disabled:opacity-70 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {walletConnected ? 'Submitting...' : 'Connecting...'}
                  </>
                ) : (
                  `${hasEthereumProvider ? 'Submit Vote' : 'Simulate Vote'}`
                )}
              </button>
            </div>
          </div>
        )}

        {/* Blockchain explainer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            This voting system is secured by blockchain technology to ensure vote integrity and transparency.
          </p>
        </div>
      </div>
    </section>
  );
};

export default VotingInterface;
