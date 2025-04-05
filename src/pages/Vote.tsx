
import Navbar from "@/components/Navbar";
import VotingInterface from "@/components/VotingInterface";
import Footer from "@/components/Footer";
import { AlertCircle } from "lucide-react";
import { isEthereumProviderAvailable } from "@/services/blockchainService";

const Vote = () => {
  const hasEthereumProvider = isEthereumProviderAvailable();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {!hasEthereumProvider && (
        <div className="bg-amber-50 border-b border-amber-200 p-2 flex justify-center items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-800">
            MetaMask not detected - running in simulation mode
          </span>
        </div>
      )}
      <div className="flex-grow">
        <VotingInterface />
      </div>
      <Footer />
    </div>
  );
};

export default Vote;
