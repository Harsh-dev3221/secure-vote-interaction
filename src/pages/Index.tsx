
import { Shield, BarChart, Users, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingSection from "@/components/LandingSection";
import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Shield,
      title: "डिज़ाइन द्वारा सुरक्षित",
      description: "एंड-टू-एंड एन्क्रिप्शन और ब्लॉकचेन तकनीक यह सुनिश्चित करती है कि आपका वोट सुरक्षित और छेड़छाड़-प्रूफ रहे।"
    },
    {
      icon: BarChart,
      title: "पारदर्शी परिणाम",
      description: "सत्यापन योग्य रिकॉर्ड के साथ रीयल-टाइम वोट काउंटिंग जो चुनाव प्रक्रिया की अखंडता बनाए रखता है।"
    },
    {
      icon: Users,
      title: "सभी के लिए सुलभ",
      description: "एक्सेसिबिलिटी को ध्यान में रखते हुए डिज़ाइन किया गया है, यह सुनिश्चित करता है कि सभी नागरिक लोकतांत्रिक प्रक्रिया में भाग ले सकें।"
    },
    {
      icon: Lock,
      title: "गारंटीकृत गोपनीयता",
      description: "आपका वोट गुमनाम है, क्रिप्टोग्राफिक प्रोटोकॉल आपकी पहचान की रक्षा करते हुए सत्यापन को बनाए रखते हैं।"
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
            <h2 className="h2 mb-4">प्रमुख विशेषताएँ</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              हमारी ब्लॉकचेन-आधारित मतदान प्रणाली अत्याधुनिक सुरक्षा को सहज डिज़ाइन के साथ जोड़ती है ताकि एक निर्बाध मतदान अनुभव बनाया जा सके।
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
            <h2 className="h2 mb-4">यह कैसे काम करता है</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              ब्लॉकचेन प्रौद्योगिकी द्वारा संचालित सुरक्षित, पारदर्शी और सुलभ इलेक्ट्रॉनिक वोटिंग।
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">प्रमाणीकरण</h3>
              <p className="text-muted-foreground">
                बायोमेट्रिक्स सहित सुरक्षित मल्टी-फैक्टर प्रमाणीकरण विधियों के माध्यम से अपनी पहचान सत्यापित करें।
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">अपना वोट डालें</h3>
              <p className="text-muted-foreground">
                सभी उपयोगकर्ताओं के लिए डिज़ाइन किए गए हमारे सहज और सुलभ इंटरफेस के माध्यम से अपने उम्मीदवार को चुनें।
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">सत्यापित करें और ट्रैक करें</h3>
              <p className="text-muted-foreground">
                अपने वोट की पुष्टि प्राप्त करें और पूरी पारदर्शिता के साथ वास्तविक समय में चुनाव परिणामों को ट्रैक करें।
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-screen-xl mx-auto text-center animate-fade-in">
          <h2 className="h2 mb-4">वोटिंग के भविष्य का अनुभव करने के लिए तैयार हैं?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            सुरक्षित, पारदर्शी और सुलभ मतदान प्रौद्योगिकी के साथ लोकतांत्रिक प्रक्रिया को क्रांतिकारी बनाने में हमारे साथ जुड़ें।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate("/auth")}
              className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              अभी वोट करें (Vote Now)
            </Button>
            <Button 
              onClick={() => window.open("https://www.youtube.com/embed/dQw4w9WgXcQ", "_blank")}
              className="px-6 py-3 bg-white border border-border rounded-full font-medium hover:bg-secondary transition-colors"
            >
              ट्यूटोरियल देखें (Watch Tutorial)
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
