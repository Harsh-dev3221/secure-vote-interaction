
import Navbar from "@/components/Navbar";
import Dashboard from "@/components/Dashboard";
import Footer from "@/components/Footer";

const Results = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Dashboard />
      </div>
      <Footer />
    </div>
  );
};

export default Results;
