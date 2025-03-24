
import Navbar from "@/components/Navbar";
import AuthSection from "@/components/AuthSection";
import Footer from "@/components/Footer";

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <AuthSection />
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
