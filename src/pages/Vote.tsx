import Navbar from "@/components/Navbar";
import VotingInterface from "@/components/VotingInterface";
import BlockchainVoting from "@/components/BlockchainVoting";
import HardhatVoting from "@/components/HardhatVoting";
import Footer from "@/components/Footer";
import { AlertCircle, Coins } from "lucide-react";
import {
  isEthereumProviderAvailable,
  getActiveBlockchain,
  getPendingVotes
} from "@/services/blockchainService";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Vote = () => {
  const hasEthereumProvider = isEthereumProviderAvailable();
  const [activeBlockchain, setActiveBlockchain] = useState(getActiveBlockchain());
  const [pendingVotes, setPendingVotes] = useState(0);
  const [activeTab, setActiveTab] = useState("hardhat"); // Default to Hardhat

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
        <div className="container mx-auto py-8">
          <Tabs defaultValue="hardhat" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="hardhat">Hardhat/Ganache</TabsTrigger>
                <TabsTrigger value="aadhar">Aadhar-Based</TabsTrigger>
                <TabsTrigger value="metamask">MetaMask</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="hardhat">
              <HardhatVoting />
            </TabsContent>

            <TabsContent value="aadhar">
              <BlockchainVoting />
            </TabsContent>

            <TabsContent value="metamask">
              <VotingInterface />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Vote;
