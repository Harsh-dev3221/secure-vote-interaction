
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  const handleLanguageToggle = () => {
    toggleLanguage();
    toast({
      title: language === "english" ? "भाषा बदली गई" : "Language Changed",
      description: language === "english" ? "भाषा हिंदी में सेट की गई" : "Language set to English",
    });
  };

  // Dynamic nav links based on authentication state
  const getNavLinks = () => {
    const links = [
      { name: t("Home", "होम"), path: "/" },
    ];
    
    if (!isAuthenticated) {
      links.push({ name: t("Authentication", "प्रमाणीकरण"), path: "/auth" });
    } else {
      links.push({ name: t("Vote", "वोट"), path: "/vote" });
      
      // Only show Results link for admin users
      if (isAdmin) {
        links.push({ name: t("Results", "परिणाम"), path: "/results" });
      }
    }
    
    return links;
  };

  const navLinks = getNavLinks();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-primary font-semibold text-xl"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-full text-white font-bold text-lg shadow-lg shadow-primary/20">
                SSVB
              </span>
              <span className="hidden sm:block">{t("Secure Smart Voting", "सुरक्षित स्मार्ट वोटिंग")}</span>
            </Link>
          </div>

          {/* Language toggle + desktop menu */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Language toggle */}
            <div className="flex items-center gap-2 mr-2 border border-border/60 px-2 py-1 rounded-full">
              <span className={`text-xs ${language === "english" ? "font-bold text-primary" : "text-muted-foreground"}`}>
                EN
              </span>
              <Switch 
                checked={language === "hindi"} 
                onCheckedChange={handleLanguageToggle}
                aria-label="Toggle language"
              />
              <span className={`text-xs ${language === "hindi" ? "font-bold text-primary" : "text-muted-foreground"}`}>
                हिं
              </span>
            </div>

            {/* Regular navigation links */}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary font-semibold"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.name === t("Results", "परिणाम") && isAdmin ? (
                  <div className="flex items-center">
                    <Shield className="w-3 h-3 mr-1" />
                    {link.name}
                  </div>
                ) : (
                  link.name
                )}
              </Link>
            ))}
            
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {t("Logout", "लॉगआउट")}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile language toggle */}
            <div className="flex items-center gap-1 border border-border/60 px-1.5 py-0.5 rounded-full mr-2">
              <span className={`text-xs ${language === "english" ? "font-bold text-primary" : "text-muted-foreground"}`}>
                EN
              </span>
              <Switch 
                className="scale-75" 
                checked={language === "hindi"} 
                onCheckedChange={handleLanguageToggle}
                aria-label="Toggle language"
              />
              <span className={`text-xs ${language === "hindi" ? "font-bold text-primary" : "text-muted-foreground"}`}>
                हिं
              </span>
            </div>

            <button
              onClick={toggleMobileMenu}
              type="button"
              className="text-foreground/80 hover:text-primary transition-colors"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen
            ? "max-h-64 opacity-100"
            : "max-h-0 opacity-0 pointer-events-none"
        } overflow-hidden bg-white/90 backdrop-blur-md shadow-sm`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={closeMobileMenu}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                isActive(link.path)
                  ? "text-primary font-semibold"
                  : "text-foreground/80 hover:text-primary"
              }`}
            >
              {link.name === t("Results", "परिणाम") && isAdmin ? (
                <div className="flex items-center">
                  <Shield className="w-4 h-4 mr-1" />
                  {link.name}
                </div>
              ) : (
                link.name
              )}
            </Link>
          ))}
          
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {t("Logout", "लॉगआउट")}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
