
import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const LandingSection = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
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
          {t("Secure & Smart Voting on Blockchain", "सुरक्षित और स्मार्ट ब्लॉकचेन वोटिंग")}
        </div>
        
        <h1 className="h1 mb-6 text-balance max-w-4xl">
          {t(
            "A ", 
            "एक "
          )}
          <span className="text-primary">
            {t("secure", "सुरक्षित")}
          </span>, 
          <span className="text-primary">
            {" "}{t("transparent", "पारदर्शी")}{" "}
          </span> 
          {t("and", "और")} 
          <span className="text-primary">
            {" "}{t("accessible", "सुलभ")}{" "}
          </span> 
          {t("voting system", "मतदान प्रणाली")}
        </h1>
        
        <p className="p-large text-muted-foreground mb-8 max-w-2xl">
          {t(
            "Transforming democracy with cutting-edge blockchain technology, ensuring secure, transparent, and verifiable elections for all citizens.",
            "अत्याधुनिक ब्लॉकचेन तकनीक के साथ लोकतंत्र को बदलते हुए, जो सभी नागरिकों के लिए सुरक्षित, पारदर्शी और सत्यापन योग्य चुनाव सुनिश्चित करता है।"
          )}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            onClick={() => navigate("/auth")}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
          >
            {t("Vote Now", "अभी वोट करें")}
          </Button>
          <Button 
            onClick={() => scrollToFeatures()}
            className="px-6 py-3 bg-white border border-border rounded-full font-medium hover:bg-secondary transition-colors"
          >
            {t("Learn More", "अधिक जानें")}
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
