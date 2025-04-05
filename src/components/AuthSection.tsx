
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Check, 
  Loader2, 
  AlertCircle, 
  Globe,
  Volume2,
  Moon,
  Sun,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { speak, stopSpeaking, isAudioAssistanceAvailable } from "@/utils/audioAssistant";
import AdminLogin from "./AdminLogin";

const AuthSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { login } = useAuth();
  
  // Core authentication states
  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"credentials" | "biometric">("credentials");
  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [authTab, setAuthTab] = useState<"voter" | "admin">("voter");
  
  // Input validation states
  const [voterIdError, setVoterIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Additional features
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioAssistance, setAudioAssistance] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  // Validate voter ID in real-time
  useEffect(() => {
    if (voterId && voterId.length > 0) {
      if (voterId.length < 6) {
        setVoterIdError(language === "english" ? "Voter ID must be at least 6 characters" : "मतदाता आईडी कम से कम 6 अक्षर होनी चाहिए");
      } else if (!/^[A-Za-z0-9]+$/.test(voterId)) {
        setVoterIdError(language === "english" ? "Voter ID must contain only letters and numbers" : "मतदाता आईडी में केवल अक्षर और संख्याएं होनी चाहिए");
      } else {
        setVoterIdError("");
      }
    } else {
      setVoterIdError("");
    }
  }, [voterId, language]);

  // Validate password in real-time
  useEffect(() => {
    if (password && password.length > 0) {
      if (password.length < 8) {
        setPasswordError(language === "english" ? "Password must be at least 8 characters" : "पासवर्ड कम से कम 8 अक्षर होना चाहिए");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [password, language]);

  // Handle audio assistance
  useEffect(() => {
    if (audioAssistance) {
      // Welcome message
      const welcomeText = language === "english"
        ? "Welcome to the Voter Authentication System. Please enter your voter ID and password to login. You can use voice assistance throughout this process."
        : "मतदाता प्रमाणीकरण प्रणाली में आपका स्वागत है। लॉगिन करने के लिए कृपया अपनी मतदाता आईडी और पासवर्ड दर्ज करें। आप इस प्रक्रिया के दौरान आवाज सहायता का उपयोग कर सकते हैं।";
      
      speak(welcomeText, language === "english" ? "en-US" : "hi-IN");
    } else {
      stopSpeaking();
    }
    
    return () => {
      stopSpeaking();
    };
  }, [audioAssistance, language]);
  
  // Audio support for navigation
  const speakElementContent = (text: string) => {
    if (audioAssistance) {
      speak(text, language === "english" ? "en-US" : "hi-IN");
    }
  };

  // Auto-format voter ID to uppercase
  const handleVoterIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setVoterId(value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (voterIdError || (authMethod === "credentials" && passwordError)) {
      const errorMessage = language === "english" 
        ? "Please check your input and try again" 
        : "कृपया अपना इनपुट जांचें और पुनः प्रयास करें";
      
      toast({
        title: language === "english" ? "Validation Error" : "मान्यता त्रुटि",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (audioAssistance) {
        speak(errorMessage, language === "english" ? "en-US" : "hi-IN");
      }
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      
      const successMessage = language === "english" 
        ? "Authentication successful. Redirecting to voting interface." 
        : "प्रमाणीकरण सफल। वोटिंग इंटरफ़ेस पर रीडायरेक्ट कर रहा है।";
      
      toast({
        title: language === "english" ? "Authentication Successful" : "प्रमाणीकरण सफल",
        description: language === "english" ? "Redirecting to voting interface..." : "वोटिंग इंटरफ़ेस पर रीडायरेक्ट कर रहा है...",
      });
      
      if (audioAssistance) {
        speak(successMessage, language === "english" ? "en-US" : "hi-IN", () => {
          // Call the login function from context
          login(voterId);
          navigate("/vote");
        });
      } else {
        // Call the login function from context
        login(voterId);
        navigate("/vote");
      }
      
    }, 1500);
  };

  const simulateBiometricScan = () => {
    if (voterId.length === 0) {
      const errorMessage = language === "english" 
        ? "Please enter your Voter ID first" 
        : "कृपया पहले अपनी मतदाता आईडी दर्ज करें";
      
      toast({
        title: language === "english" ? "Voter ID Required" : "मतदाता आईडी आवश्यक है",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (audioAssistance) {
        speak(errorMessage, language === "english" ? "en-US" : "hi-IN");
      }
      return;
    }
    
    setBiometricStatus("scanning");
    
    if (audioAssistance) {
      speak(
        language === "english" 
          ? "Scanning your fingerprint. Please hold still." 
          : "आपके फिंगरप्रिंट को स्कैन किया जा रहा है। कृपया स्थिर रहें।", 
        language === "english" ? "en-US" : "hi-IN"
      );
    }
    
    // Simulate scanning process
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setBiometricStatus("success");
        
        const successMessage = language === "english" 
          ? "Fingerprint verification successful. You will now be redirected to the voting interface." 
          : "फिंगरप्रिंट सत्यापन सफल। अब आपको वोटिंग इंटरफेस पर रीडायरेक्ट किया जाएगा।";
        
        toast({
          title: language === "english" ? "Biometric Verification Successful" : "बायोमेट्रिक सत्यापन सफल",
          description: language === "english" ? "Fingerprint matched" : "फिंगरप्रिंट मिलान सफल",
        });
        
        if (audioAssistance) {
          speak(successMessage, language === "english" ? "en-US" : "hi-IN", () => {
            // Navigate after successful scan
            login(voterId);
            navigate("/vote");
          });
        } else {
          // Navigate after successful scan
          setTimeout(() => {
            login(voterId);
            navigate("/vote");
          }, 1000);
        }
      } else {
        setBiometricStatus("error");
        
        const errorMessage = language === "english" 
          ? "Biometric verification failed. Please try again or use credentials." 
          : "बायोमेट्रिक सत्यापन विफल। कृपया पुनः प्रयास करें या क्रेडेंशियल्स का उपयोग करें।";
        
        toast({
          title: language === "english" ? "Biometric Verification Failed" : "बायोमेट्रिक सत्यापन विफल",
          description: language === "english" ? "Please try again or use credentials" : "कृपया पुनः प्रयास करें या क्रेडेंशियल्स का उपयोग करें",
          variant: "destructive",
        });
        
        if (audioAssistance) {
          speak(errorMessage, language === "english" ? "en-US" : "hi-IN");
        }
      }
    }, 2000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would toggle dark mode
  };

  const toggleAudioAssistance = () => {
    const newState = !audioAssistance;
    setAudioAssistance(newState);
    
    // If turning on, check if the browser supports it
    if (newState && !isAudioAssistanceAvailable()) {
      toast({
        title: language === "english" ? "Audio Assistance Not Available" : "ऑडियो सहायता उपलब्ध नहीं है",
        description: language === "english" 
          ? "Your browser does not support speech synthesis" 
          : "आपका ब्राउज़र स्पीच सिंथेसिस का समर्थन नहीं करता है",
        variant: "destructive",
      });
      setAudioAssistance(false);
      return;
    }
    
    toast({
      title: newState 
        ? (language === "english" ? "Audio Assistance Enabled" : "ऑडियो सहायता सक्षम") 
        : (language === "english" ? "Audio Assistance Disabled" : "ऑडियो सहायता अक्षम"),
      description: newState 
        ? (language === "english" ? "Audio guidance is now on" : "ऑडियो मार्गदर्शन अब चालू है") 
        : (language === "english" ? "Audio guidance is now off" : "ऑडियो मार्गदर्शन अब बंद है"),
    });
  };

  const toggleLanguage = () => {
    const newLanguage = language === "english" ? "hindi" : "english";
    setLanguage(newLanguage);
    
    // If audio assistance is on, announce the language change
    if (audioAssistance) {
      const message = newLanguage === "english" 
        ? "Language changed to English" 
        : "भाषा हिंदी में बदल दी गई है";
      speak(message, newLanguage === "english" ? "en-US" : "hi-IN");
    }
    
    toast({
      title: language === "english" ? "भाषा बदली गई" : "Language Changed",
      description: language === "english" ? "भाषा हिंदी में सेट की गई" : "Language set to English",
    });
  };

  const handleRecovery = () => {
    setRecoveryMode(true);
    
    const recoveryMessage = language === "english" 
      ? "Please contact an election official for assistance with account recovery." 
      : "खाता पुनर्प्राप्ति के लिए सहायता के लिए कृपया किसी चुनाव अधिकारी से संपर्क करें।";
    
    toast({
      title: language === "english" ? "Recovery Mode" : "रिकवरी मोड",
      description: recoveryMessage,
    });
    
    if (audioAssistance) {
      speak(recoveryMessage, language === "english" ? "en-US" : "hi-IN");
    }
  };

  const getTranslatedText = (eng: string, hindi: string) => {
    return language === "english" ? eng : hindi;
  };
  
  // Speak the label/content when user focuses on an element
  const handleElementFocus = (label: string) => {
    speakElementContent(label);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="h2 mb-2">
            {getTranslatedText("Voter Authentication", "मतदाता प्रमाणीकरण")}
          </h2>
          <p className="text-muted-foreground">
            {getTranslatedText(
              "Please verify your identity to access the voting system", 
              "वोटिंग सिस्टम तक पहुंचने के लिए कृपया अपनी पहचान सत्यापित करें"
            )}
          </p>
        </div>

        {/* Accessibility Controls */}
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleLanguage} 
            title={language === "english" ? "Switch to Hindi" : "अंग्रेजी में स्विच करें"}
            className="rounded-full w-8 h-8"
            onFocus={() => handleElementFocus(language === "english" ? "Language toggle button" : "भाषा टॉगल बटन")}
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleAudioAssistance} 
            title={audioAssistance 
              ? getTranslatedText("Disable Audio Assistance", "ऑडियो सहायता अक्षम करें") 
              : getTranslatedText("Enable Audio Assistance", "ऑडियो सहायता सक्षम करें")
            }
            className={`rounded-full w-8 h-8 ${audioAssistance ? "bg-primary text-primary-foreground" : ""}`}
            onFocus={() => handleElementFocus(language === "english" ? "Audio assistance toggle button" : "ऑडियो सहायता टॉगल बटन")}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode} 
            title={isDarkMode 
              ? getTranslatedText("Switch to Light Mode", "लाइट मोड में स्विच करें") 
              : getTranslatedText("Switch to Dark Mode", "डार्क मोड में स्विच करें")
            }
            className="rounded-full w-8 h-8"
            onFocus={() => handleElementFocus(language === "english" ? "Dark mode toggle button" : "डार्क मोड टॉगल बटन")}
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <Tabs 
          defaultValue="voter" 
          value={authTab} 
          onValueChange={(value) => {
            setAuthTab(value as "voter" | "admin");
            if (audioAssistance) {
              const tabName = value === "voter" 
                ? (language === "english" ? "Voter Login tab" : "मतदाता लॉगिन टैब") 
                : (language === "english" ? "Admin Login tab" : "व्यवस्थापक लॉगिन टैब");
              speak(tabName, language === "english" ? "en-US" : "hi-IN");
            }
          }}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger 
              value="voter"
              onFocus={() => handleElementFocus(getTranslatedText("Voter Login Tab", "मतदाता लॉगिन टैब"))}
            >
              {getTranslatedText("Voter Login", "मतदाता लॉगिन")}
            </TabsTrigger>
            <TabsTrigger 
              value="admin"
              onFocus={() => handleElementFocus(getTranslatedText("Admin Login Tab", "व्यवस्थापक लॉगिन टैब"))}
            >
              {getTranslatedText("Admin Login", "व्यवस्थापक लॉगिन")}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="voter">
            {/* Auth method selector */}
            <div className="flex justify-center space-x-2 mb-6">
              <Button
                onClick={() => {
                  setAuthMethod("credentials");
                  if (audioAssistance) {
                    speak(
                      language === "english" ? "Credentials authentication method selected" : "क्रेडेंशियल प्रमाणीकरण विधि चयनित",
                      language === "english" ? "en-US" : "hi-IN"
                    );
                  }
                }}
                variant={authMethod === "credentials" ? "default" : "outline"}
                className="rounded-full px-4 py-2 text-sm font-medium"
                onFocus={() => handleElementFocus(getTranslatedText("Credentials Authentication Method", "क्रेडेंशियल प्रमाणीकरण विधि"))}
              >
                {getTranslatedText("Credentials", "क्रेडेंशियल्स")}
              </Button>
              <Button
                onClick={() => {
                  setAuthMethod("biometric");
                  if (audioAssistance) {
                    speak(
                      language === "english" ? "Biometric authentication method selected" : "बायोमेट्रिक प्रमाणीकरण विधि चयनित",
                      language === "english" ? "en-US" : "hi-IN"
                    );
                  }
                }}
                variant={authMethod === "biometric" ? "default" : "outline"}
                className="rounded-full px-4 py-2 text-sm font-medium"
                onFocus={() => handleElementFocus(getTranslatedText("Biometric Authentication Method", "बायोमेट्रिक प्रमाणीकरण विधि"))}
              >
                {getTranslatedText("Biometric", "बायोमेट्रिक")}
              </Button>
            </div>

            <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 animate-scale-in">
              {/* Voter ID input (required for both methods) */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="voterId" className="text-sm font-medium">
                  {getTranslatedText("Voter ID", "मतदाता आईडी")}
                </Label>
                <Input
                  id="voterId"
                  type="text"
                  value={voterId}
                  onChange={handleVoterIdChange}
                  className={`w-full bg-background transition-all ${
                    voterIdError ? "border-destructive ring-destructive/50" : ""
                  }`}
                  placeholder={getTranslatedText("Enter your voter ID", "अपनी मतदाता आईडी दर्ज करें")}
                  disabled={isLoading || biometricStatus === "scanning" || biometricStatus === "success"}
                  aria-invalid={!!voterIdError}
                  aria-describedby={voterIdError ? "voterId-error" : undefined}
                  onFocus={() => handleElementFocus(getTranslatedText("Voter ID input field", "मतदाता आईडी इनपुट फ़ील्ड"))}
                  required
                />
                {voterIdError && (
                  <p id="voterId-error" className="text-sm text-destructive">{voterIdError}</p>
                )}
              </div>

              {authMethod === "credentials" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {getTranslatedText("Password", "पासवर्ड")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pr-10 ${
                          passwordError ? "border-destructive ring-destructive/50" : ""
                        }`}
                        placeholder={getTranslatedText("Enter your password", "अपना पासवर्ड दर्ज करें")}
                        disabled={isLoading}
                        aria-invalid={!!passwordError}
                        aria-describedby={passwordError ? "password-error" : undefined}
                        onFocus={() => handleElementFocus(getTranslatedText("Password input field", "पासवर्ड इनपुट फ़ील्ड"))}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowPassword(!showPassword);
                          if (audioAssistance) {
                            speak(
                              showPassword 
                                ? (language === "english" ? "Password hidden" : "पासवर्ड छिपाया गया") 
                                : (language === "english" ? "Password visible" : "पासवर्ड दिखाया गया"),
                              language === "english" ? "en-US" : "hi-IN"
                            );
                          }
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onFocus={() => handleElementFocus(getTranslatedText("Toggle password visibility button", "पासवर्ड दृश्यता टॉगल बटन"))}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {passwordError && (
                      <p id="password-error" className="text-sm text-destructive">{passwordError}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !!voterIdError || !!passwordError}
                    className="w-full py-3 font-medium"
                    onFocus={() => handleElementFocus(getTranslatedText("Login button", "लॉगिन बटन"))}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {getTranslatedText("Authenticating...", "प्रमाणीकरण हो रहा है...")}
                      </>
                    ) : (
                      getTranslatedText("Login", "लॉगिन")
                    )}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      onClick={handleRecovery}
                      className="text-sm text-primary hover:underline"
                      onFocus={() => handleElementFocus(getTranslatedText("Forgot Voter ID link", "मतदाता आईडी भूल गए लिंक"))}
                    >
                      {getTranslatedText("Forgot Voter ID?", "मतदाता आईडी भूल गए?")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center py-6">
                  <div 
                    className={`w-40 h-40 md:w-48 md:h-48 rounded-full border-2 mb-6 flex items-center justify-center transition-all ${
                      biometricStatus === "idle" ? "border-muted-foreground" :
                      biometricStatus === "scanning" ? "border-primary border-4 animate-pulse" :
                      biometricStatus === "success" ? "border-green-500 border-4" :
                      "border-red-500 border-4"
                    }`}
                  >
                    {biometricStatus === "idle" && (
                      <div className="text-center">
                        <Fingerprint className="w-20 h-20 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground mt-2">
                          {getTranslatedText("Place your finger", "अपनी उंगली रखें")}
                        </p>
                      </div>
                    )}
                    {biometricStatus === "scanning" && (
                      <>
                        <Fingerprint className="w-20 h-20 text-primary animate-pulse" />
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" style={{
                          animation: "scanLine 2s ease-in-out infinite",
                        }}></div>
                      </>
                    )}
                    {biometricStatus === "success" && (
                      <Check className="w-20 h-20 text-green-500" />
                    )}
                    {biometricStatus === "error" && (
                      <AlertCircle className="w-20 h-20 text-red-500" />
                    )}
                  </div>

                  {biometricStatus === "idle" && (
                    <Button
                      onClick={simulateBiometricScan}
                      disabled={!voterId || !!voterIdError}
                      className="px-6 py-3 font-medium"
                      onFocus={() => handleElementFocus(getTranslatedText("Scan Fingerprint button", "फिंगरप्रिंट स्कैन करें बटन"))}
                    >
                      {getTranslatedText("Scan Fingerprint", "फिंगरप्रिंट स्कैन करें")}
                    </Button>
                  )}
                  
                  {biometricStatus === "scanning" && (
                    <p className="text-center text-primary font-medium animate-pulse">
                      {getTranslatedText("Scanning your fingerprint...", "आपका फिंगरप्रिंट स्कैन किया जा रहा है...")}
                    </p>
                  )}
                  
                  {biometricStatus === "success" && (
                    <p className="text-center text-green-500 font-medium">
                      {getTranslatedText("Authentication successful!", "प्रमाणीकरण सफल!")}
                    </p>
                  )}
                  
                  {biometricStatus === "error" && (
                    <>
                      <p className="text-center text-red-500 font-medium mb-4">
                        {getTranslatedText("Authentication failed", "प्रमाणीकरण विफल")}
                      </p>
                      <Button
                        onClick={simulateBiometricScan}
                        className="px-6 py-3 font-medium"
                        onFocus={() => handleElementFocus(getTranslatedText("Try Again button", "पुनः प्रयास करें बटन"))}
                      >
                        {getTranslatedText("Try Again", "पुनः प्रयास करें")}
                      </Button>
                    </>
                  )}
                </div>
              )}
              
              {recoveryMode && (
                <Alert className="mt-4 border-yellow-500">
                  <AlertDescription className="text-sm">
                    {getTranslatedText(
                      "Please contact an election official with your ID for assistance with account recovery.",
                      "खाता पुनर्प्राप्ति के लिए सहायता के लिए कृपया अपने आईडी के साथ किसी चुनाव अधिकारी से संपर्क करें।"
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="admin">
            <AdminLogin />
          </TabsContent>
        </Tabs>
        
        {/* Help information */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {getTranslatedText(
              "Need help? Contact the election helpdesk",
              "मदद चाहिए? चुनाव हेल्पडेस्क से संपर्क करें"
            )}
          </p>
          <p className="mt-1">
            <a 
              href="tel:+918888888888" 
              className="text-primary hover:underline"
              onFocus={() => handleElementFocus(getTranslatedText("Helpdesk phone number", "हेल्पडेस्क फोन नंबर"))}
            >
              +91 8888 888 888
            </a>
          </p>
        </div>
      </div>
      
      {/* Add custom styles for the scan animation */}
      <style>
      {`
        @keyframes scanLine {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
      `}
      </style>
    </section>
  );
};

export default AuthSection;
