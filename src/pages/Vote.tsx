import Navbar from "@/components/Navbar";
import VotingInterface from "@/components/VotingInterface";
import BlockchainVoting from "@/components/BlockchainVoting";
import Footer from "@/components/Footer";
import { AlertCircle, Coins } from "lucide-react";
import {
  isEthereumProviderAvailable,
  getActiveBlockchain,
  getPendingVotes
} from "@/services/blockchainService";
import { useEffect, useState } from "react";

const Vote = () => {
  const hasEthereumProvider = isEthereumProviderAvailable();
  const [activeBlockchain, setActiveBlockchain] = useState(getActiveBlockchain());
  const [pendingVotes, setPendingVotes] = useState(0);
  const [useBlockchainVoting, setUseBlockchainVoting] = useState(true); // Toggle between voting interfaces

  useEffect(() => {
    // Check for pending votes
    const votes = getPendingVotes();
    setPendingVotes(votes.length);

    // Set up interval to refresh pending votes count
    const interval = setInterval(() => {
      const votes = getPendingVotes();
      setPendingVotes(votes.length);
      setActiveBlockchain(getActiveBlockchain());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border-b px-4 py-2">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm">
              Mode: <span className="font-medium">{
                activeBlockchain === "ethereum" ? "Ethereum" :
                  activeBlockchain === "polygon" ? "Polygon (Low Fees)" :
                    "Hybrid (No Fees)"
              }</span>
            </span>
          </div>

          {/* Toggle between voting interfaces */}
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <button
              onClick={() => setUseBlockchainVoting(!useBlockchainVoting)}
              className="text-sm bg-primary text-white px-3 py-1 rounded-md"
            >
              Switch to {useBlockchainVoting ? "Regular" : "Blockchain"} Voting
            </button>
          </div>

          {!hasEthereumProvider && (
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-amber-800">
                MetaMask not detected - hybrid mode recommended
              </span>
            </div>
          )}

          {pendingVotes > 0 && (
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <div className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full">
                {pendingVotes} pending vote{pendingVotes !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow">
        {useBlockchainVoting ? <BlockchainVoting /> : <VotingInterface />}
      </div>
      <Footer />
    </div>
  );
};

export default Vote;
