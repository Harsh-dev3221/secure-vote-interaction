
import Navbar from "@/components/Navbar";
import VotingInterface from "@/components/VotingInterface";
import Footer from "@/components/Footer";

const Vote = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <VotingInterface />
      </div>
      <Footer />
    </div>
  );
};

export default Vote;
