
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const LandingSection = () => {
  const navigate = useNavigate();
  
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden pt-16">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>
      </div>

      <div className="max-w-screen-xl mx-auto flex flex-col items-center text-center animate-fade-in">
        <div className="inline-block mb-4 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium">
          सुरक्षित और स्मार्ट ब्लॉकचेन वोटिंग (Secure & Smart Voting on Blockchain)
        </div>
        
        <h1 className="h1 mb-6 text-balance max-w-4xl">
          एक <span className="text-primary">सुरक्षित</span>, <span className="text-primary">पारदर्शी</span> और <span className="text-primary">सुलभ</span> मतदान प्रणाली
        </h1>
        
        <p className="p-large text-muted-foreground mb-8 max-w-2xl">
          अत्याधुनिक ब्लॉकचेन तकनीक के साथ लोकतंत्र को बदलते हुए, जो सभी नागरिकों के लिए सुरक्षित, पारदर्शी और सत्यापन योग्य चुनाव सुनिश्चित करता है।
        </p>
        
        {/* Tutorial Video Section */}
        <div className="mb-8 w-full max-w-2xl">
          <div className="aspect-video rounded-xl overflow-hidden border border-border">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Tutorial Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            देखें कि हमारा प्लेटफॉर्म कैसे काम करता है (Watch how our platform works)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            अभी वोट करें (Vote Now)
          </Button>
          <Button 
            onClick={() => scrollToFeatures()}
            className="px-6 py-3 bg-white border border-border rounded-full font-medium hover:bg-secondary transition-colors"
          >
            अधिक जानें (Learn More)
          </Button>
        </div>
        
        <button 
          onClick={scrollToFeatures}
          className="absolute bottom-8 flex items-center justify-center animate-bounce"
          aria-label="Scroll to features"
        >
          <ArrowDown className="w-6 h-6 text-primary" />
        </button>
      </div>
    </section>
  );
};

export default LandingSection;
