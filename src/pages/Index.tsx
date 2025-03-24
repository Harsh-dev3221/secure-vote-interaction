
import { Shield, BarChart, Users, Lock } from "lucide-react";
import LandingSection from "@/components/LandingSection";
import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure by Design",
      description: "End-to-end encryption and blockchain technology ensure your vote remains secure and tamper-proof."
    },
    {
      icon: BarChart,
      title: "Transparent Results",
      description: "Real-time vote counting with verifiable records that maintain the integrity of the election process."
    },
    {
      icon: Users,
      title: "Accessible for Everyone",
      description: "Designed with accessibility in mind, ensuring all citizens can participate in the democratic process."
    },
    {
      icon: Lock,
      title: "Privacy Guaranteed",
      description: "Your vote is anonymous, with cryptographic protocols protecting your identity while maintaining verifiability."
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <LandingSection />
      
      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="h2 mb-4">Key Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our blockchain-based voting system combines cutting-edge security with intuitive design to create a seamless voting experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="animate-slide-in-bottom" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <FeatureCard
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="h2 mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Secure, transparent, and accessible electronic voting powered by blockchain technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Authenticate</h3>
              <p className="text-muted-foreground">
                Verify your identity through secure multi-factor authentication methods, including biometrics.
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cast Your Vote</h3>
              <p className="text-muted-foreground">
                Choose your candidate through our intuitive and accessible interface designed for all users.
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify & Track</h3>
              <p className="text-muted-foreground">
                Receive confirmation of your vote and track election results in real-time with full transparency.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-screen-xl mx-auto text-center animate-fade-in">
          <h2 className="h2 mb-4">Ready to Experience the Future of Voting?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join us in revolutionizing the democratic process with secure, transparent, and accessible voting technology.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              Learn More
            </button>
            <button className="px-6 py-3 bg-white border border-border rounded-full font-medium hover:bg-secondary transition-colors">
              Request a Demo
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
