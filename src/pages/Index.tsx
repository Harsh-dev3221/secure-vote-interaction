import { Shield, BarChart, Users, Lock, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LandingSection from "@/components/LandingSection";
import FeatureCard from "@/components/FeatureCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
const Index = () => {
  const navigate = useNavigate();
  const {
    t
  } = useLanguage();
  const features = [{
    icon: Shield,
    title: t("Secure by Design", "डिज़ाइन द्वारा सुरक्षित"),
    description: t("End-to-end encryption and blockchain technology ensure your vote remains secure and tamper-proof.", "एंड-टू-एंड एन्क्रिप्शन और ब्लॉकचेन तकनीक यह सुनिश्चित करती है कि आपका वोट सुरक्षित और छेड़छाड़-प्रूफ रहे।")
  }, {
    icon: BarChart,
    title: t("Transparent Results", "पारदर्शी परिणाम"),
    description: t("Real-time vote counting with verifiable records that maintain electoral process integrity.", "सत्यापन योग्य रिकॉर्ड के साथ रीयल-टाइम वोट काउंटिंग जो चुनाव प्रक्रिया की अखंडता बनाए रखता है।")
  }, {
    icon: Users,
    title: t("Accessible to All", "सभी के लिए सुलभ"),
    description: t("Designed with accessibility in mind, ensuring all citizens can participate in the democratic process.", "एक्सेसिबिलिटी को ध्यान में रखते हुए डिज़ाइन किया गया है, यह सुनिश्चित करता है कि सभी नागरिक लोकतांत्रिक प्रक्रिया में भाग ले सकें।")
  }, {
    icon: Lock,
    title: t("Guaranteed Privacy", "गारंटीकृत गोपनीयता"),
    description: t("Your vote is anonymous, with cryptographic protocols preserving verification while protecting your identity.", "आपका वोट गुमनाम है, क्रिप्टोग्राफिक प्रोटोकॉल आपकी पहचान की रक्षा करते हुए सत्यापन को बनाए रखते हैं।")
  }];
  return <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <LandingSection />
      
      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="h2 mb-4">{t("Key Features", "प्रमुख विशेषताएँ")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Our blockchain-based voting system combines cutting-edge security with intuitive design to create a seamless voting experience.", "हमारी ब्लॉकचेन-आधारित मतदान प्रणाली अत्याधुनिक सुरक्षा को सहज डिज़ाइन के साथ जोड़ती है ताकि एक निर्बाध मतदान अनुभव बनाया जा सके।")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => <div key={index} className="animate-slide-in-bottom" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
              </div>)}
          </div>
        </div>
      </section>
      
      {/* How it Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="h2 mb-4">{t("How it Works", "यह कैसे काम करता है")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Secure, transparent, and accessible electronic voting powered by blockchain technology.", "ब्लॉकचेन प्रौद्योगिकी द्वारा संचालित सुरक्षित, पारदर्शी और सुलभ इलेक्ट्रॉनिक वोटिंग।")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("Authentication", "प्रमाणीकरण")}</h3>
              <p className="text-muted-foreground">
                {t("Verify your identity through secure multi-factor authentication methods including biometrics.", "बायोमेट्रिक्स सहित सुरक्षित मल्टी-फैक्टर प्रमाणीकरण विधियों के माध्यम से अपनी पहचान सत्यापित करें।")}
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{
            animationDelay: "0.1s"
          }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("Cast Your Vote", "अपना वोट डालें")}</h3>
              <p className="text-muted-foreground">
                {t("Select your candidate through our intuitive and accessible interface designed for all users.", "सभी उपयोगकर्ताओं के लिए डिज़ाइन किए गए हमारे सहज और सुलभ इंटरफेस के माध्यम से अपने उम्मीदवार को चुनें।")}
              </p>
            </div>
            
            <div className="text-center p-6 animate-scale-in" style={{
            animationDelay: "0.2s"
          }}>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("Verify and Track", "सत्यापित करें और ट्रैक करें")}</h3>
              <p className="text-muted-foreground">
                {t("Receive confirmation of your vote and track election results in real-time with complete transparency.", "अपने वोट की पुष्टि प्राप्त करें और पूरी पारदर्शिता के साथ वास्तविक समय में चुनाव परिणामों को ट्रैक करें।")}
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Tutorial Videos Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="h2 mb-4">{t("Tutorial Videos", "ट्यूटोरियल वीडियो")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("Learn how to use our secure blockchain voting system with these helpful tutorials.", "इन सहायक ट्यूटोरियल के साथ हमारी सुरक्षित ब्लॉकचेन वोटिंग प्रणाली का उपयोग करना सीखें।")}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tutorial Video 1 */}
            <div className="rounded-xl overflow-hidden border border-border flex flex-col animate-fade-in">
              <div className="aspect-video">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="How to Register and Vote" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
              <div className="p-4 bg-secondary flex items-start">
                <PlayCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-1">{t("How to Register and Vote", "पंजीकरण और मतदान कैसे करें")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("A step-by-step guide to register as a voter and cast your vote securely.", "एक मतदाता के रूप में पंजीकरण करने और सुरक्षित रूप से अपना वोट डालने के लिए चरण-दर-चरण मार्गदर्शिका।")}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Tutorial Video 2 */}
            <div className="rounded-xl overflow-hidden border border-border flex flex-col animate-fade-in" style={{
            animationDelay: "0.1s"
          }}>
              <div className="aspect-video">
                <iframe className="w-full h-full" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Understanding Blockchain Security" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
              <div className="p-4 bg-secondary flex items-start">
                <PlayCircle className="w-6 h-6 text-primary mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-lg mb-1">{t("Understanding Blockchain Security", "ब्लॉकचेन सुरक्षा को समझना")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Learn how blockchain technology ensures the security and integrity of your vote.", "जानें कि ब्लॉकचेन तकनीक आपके वोट की सुरक्षा और अखंडता कैसे सुनिश्चित करती है।")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="max-w-screen-xl mx-auto text-center animate-fade-in">
          <h2 className="h2 mb-4">
            {t("Ready to experience the future of voting?", "वोटिंग के भविष्य का अनुभव करने के लिए तैयार हैं?")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            {t("Join us in revolutionizing the democratic process with secure, transparent, and accessible voting technology.", "सुरक्षित, पारदर्शी और सुलभ मतदान प्रौद्योगिकी के साथ लोकतांत्रिक प्रक्रिया को क्रांतिकारी बनाने में हमारे साथ जुड़ें।")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button onClick={() => navigate("/auth")} className="px-6 py-3 bg-primary text-white rounded-full font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5">
              {t("Vote Now", "अभी वोट करें")}
            </Button>
            <Button onClick={() => window.open("https://www.youtube.com/embed/dQw4w9WgXcQ", "_blank")} className="px-6 py-3 border border-border rounded-full font-medium transition-colors bg-zinc-950 hover:bg-zinc-800">
              {t("Watch Tutorial", "ट्यूटोरियल देखें")}
            </Button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Index;