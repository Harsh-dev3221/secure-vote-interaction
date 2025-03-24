
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
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";

const AuthSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Core authentication states
  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"credentials" | "biometric">("credentials");
  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  
  // Input validation states
  const [voterIdError, setVoterIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Additional features
  const [language, setLanguage] = useState<"english" | "spanish" | "french">("english");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [audioAssistance, setAudioAssistance] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);

  // Validate voter ID in real-time
  useEffect(() => {
    if (voterId && voterId.length > 0) {
      if (voterId.length < 6) {
        setVoterIdError("Voter ID must be at least 6 characters");
      } else if (!/^[A-Za-z0-9]+$/.test(voterId)) {
        setVoterIdError("Voter ID must contain only letters and numbers");
      } else {
        setVoterIdError("");
      }
    } else {
      setVoterIdError("");
    }
  }, [voterId]);

  // Validate password in real-time
  useEffect(() => {
    if (password && password.length > 0) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters");
      } else {
        setPasswordError("");
      }
    } else {
      setPasswordError("");
    }
  }, [password]);

  // Auto-format voter ID to uppercase
  const handleVoterIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setVoterId(value);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (voterIdError || (authMethod === "credentials" && passwordError)) {
      toast({
        title: "Validation Error",
        description: "Please check your input and try again",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Authentication Successful",
        description: "Redirecting to voting interface...",
      });
      
      // Simulate session storage
      sessionStorage.setItem("auth_token", "sample_secure_token");
      sessionStorage.setItem("voter_id", voterId);
      
      navigate("/vote");
    }, 1500);
  };

  const simulateBiometricScan = () => {
    if (voterId.length === 0) {
      toast({
        title: "Voter ID Required",
        description: "Please enter your Voter ID first",
        variant: "destructive",
      });
      return;
    }
    
    setBiometricStatus("scanning");
    
    // Simulate scanning process
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setBiometricStatus("success");
        toast({
          title: "Biometric Verification Successful",
          description: "Fingerprint matched",
        });
        
        // Navigate after successful scan
        setTimeout(() => {
          // Simulate session storage
          sessionStorage.setItem("auth_token", "biometric_secure_token");
          sessionStorage.setItem("voter_id", voterId);
          
          navigate("/vote");
        }, 1000);
      } else {
        setBiometricStatus("error");
        toast({
          title: "Biometric Verification Failed",
          description: "Please try again or use credentials",
          variant: "destructive",
        });
      }
    }, 2000);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, this would toggle dark mode
  };

  const toggleAudioAssistance = () => {
    setAudioAssistance(!audioAssistance);
    toast({
      title: audioAssistance ? "Audio Assistance Disabled" : "Audio Assistance Enabled",
      description: audioAssistance ? "Audio guidance is now off" : "Audio guidance is now on",
    });
  };

  const toggleLanguage = () => {
    if (language === "english") setLanguage("spanish");
    else if (language === "spanish") setLanguage("french");
    else setLanguage("english");
    
    toast({
      title: "Language Changed",
      description: `Language set to ${language === "english" ? "Spanish" : language === "spanish" ? "French" : "English"}`,
    });
  };

  const handleRecovery = () => {
    setRecoveryMode(true);
    toast({
      title: "Recovery Mode",
      description: "Please contact an election official for assistance",
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="h2 mb-2">
            {language === "english" ? "Voter Authentication" : 
             language === "spanish" ? "Autenticación de Votante" : 
             "Authentification de l'électeur"}
          </h2>
          <p className="text-muted-foreground">
            {language === "english" ? "Please verify your identity to access the voting system" : 
             language === "spanish" ? "Verifique su identidad para acceder al sistema de votación" : 
             "Veuillez vérifier votre identité pour accéder au système de vote"}
          </p>
        </div>

        {/* Accessibility Controls */}
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleLanguage} 
            title="Change Language"
            className="rounded-full w-8 h-8"
          >
            <Globe className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleAudioAssistance} 
            title={audioAssistance ? "Disable Audio Assistance" : "Enable Audio Assistance"}
            className={`rounded-full w-8 h-8 ${audioAssistance ? "bg-primary text-primary-foreground" : ""}`}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode} 
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="rounded-full w-8 h-8"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 animate-scale-in">
          {/* Auth method selector */}
          <div className="flex justify-center space-x-2 mb-6">
            <Button
              onClick={() => setAuthMethod("credentials")}
              variant={authMethod === "credentials" ? "default" : "outline"}
              className="rounded-full px-4 py-2 text-sm font-medium"
            >
              {language === "english" ? "Credentials" : 
               language === "spanish" ? "Credenciales" : 
               "Identifiants"}
            </Button>
            <Button
              onClick={() => setAuthMethod("biometric")}
              variant={authMethod === "biometric" ? "default" : "outline"}
              className="rounded-full px-4 py-2 text-sm font-medium"
            >
              {language === "english" ? "Biometric" : 
               language === "spanish" ? "Biométrico" : 
               "Biométrique"}
            </Button>
          </div>

          {/* Voter ID input (required for both methods) */}
          <div className="space-y-2 mb-4">
            <Label htmlFor="voterId" className="text-sm font-medium">
              {language === "english" ? "Voter ID" : 
               language === "spanish" ? "ID de Votante" : 
               "ID d'électeur"}
            </Label>
            <Input
              id="voterId"
              type="text"
              value={voterId}
              onChange={handleVoterIdChange}
              className={`w-full bg-background transition-all ${
                voterIdError ? "border-destructive ring-destructive/50" : ""
              }`}
              placeholder={
                language === "english" ? "Enter your voter ID" : 
                language === "spanish" ? "Ingrese su ID de votante" : 
                "Entrez votre ID d'électeur"
              }
              disabled={isLoading || biometricStatus === "scanning" || biometricStatus === "success"}
              aria-invalid={!!voterIdError}
              aria-describedby={voterIdError ? "voterId-error" : undefined}
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
                  {language === "english" ? "Password" : 
                   language === "spanish" ? "Contraseña" : 
                   "Mot de passe"}
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
                    placeholder={
                      language === "english" ? "Enter your password" : 
                      language === "spanish" ? "Ingrese su contraseña" : 
                      "Entrez votre mot de passe"
                    }
                    disabled={isLoading}
                    aria-invalid={!!passwordError}
                    aria-describedby={passwordError ? "password-error" : undefined}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
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
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === "english" ? "Authenticating..." : 
                     language === "spanish" ? "Autenticando..." : 
                     "Authentification..."}
                  </>
                ) : (
                  language === "english" ? "Login" : 
                  language === "spanish" ? "Iniciar sesión" : 
                  "Connexion"
                )}
              </Button>
              
              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={handleRecovery}
                  className="text-sm text-primary hover:underline"
                >
                  {language === "english" ? "Forgot Voter ID?" : 
                   language === "spanish" ? "¿Olvidó su ID de votante?" : 
                   "ID d'électeur oublié?"}
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
                      {language === "english" ? "Place your finger" : 
                       language === "spanish" ? "Coloque su dedo" : 
                       "Placez votre doigt"}
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
                >
                  {language === "english" ? "Scan Fingerprint" : 
                   language === "spanish" ? "Escanear Huella" : 
                   "Scanner l'empreinte"}
                </Button>
              )}
              
              {biometricStatus === "scanning" && (
                <p className="text-center text-primary font-medium animate-pulse">
                  {language === "english" ? "Scanning your fingerprint..." : 
                   language === "spanish" ? "Escaneando su huella digital..." : 
                   "Numérisation de votre empreinte digitale..."}
                </p>
              )}
              
              {biometricStatus === "success" && (
                <p className="text-center text-green-500 font-medium">
                  {language === "english" ? "Authentication successful!" : 
                   language === "spanish" ? "¡Autenticación exitosa!" : 
                   "Authentification réussie!"}
                </p>
              )}
              
              {biometricStatus === "error" && (
                <>
                  <p className="text-center text-red-500 font-medium mb-4">
                    {language === "english" ? "Authentication failed" : 
                     language === "spanish" ? "Autenticación fallida" : 
                     "Échec de l'authentification"}
                  </p>
                  <Button
                    onClick={simulateBiometricScan}
                    className="px-6 py-3 font-medium"
                  >
                    {language === "english" ? "Try Again" : 
                     language === "spanish" ? "Intentar de nuevo" : 
                     "Réessayer"}
                  </Button>
                </>
              )}
            </div>
          )}
          
          {recoveryMode && (
            <Alert className="mt-4 border-yellow-500">
              <AlertDescription className="text-sm">
                {language === "english" ? 
                  "Please contact an election official with your ID for assistance with account recovery." : 
                language === "spanish" ? 
                  "Por favor, contacte a un oficial electoral con su identificación para recibir asistencia con la recuperación de la cuenta." : 
                  "Veuillez contacter un responsable électoral avec votre pièce d'identité pour obtenir de l'aide concernant la récupération de compte."}
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        {/* Help information */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            {language === "english" ? 
              "Need help? Contact the election helpdesk" : 
            language === "spanish" ? 
              "¿Necesita ayuda? Contacte al centro de ayuda electoral" : 
              "Besoin d'aide ? Contactez le service d'assistance électorale"}
          </p>
          <p className="mt-1">
            <a href="tel:+1234567890" className="text-primary hover:underline">
              +1 (234) 567-890
            </a>
          </p>
        </div>
      </div>
      
      {/* Add custom styles for the scan animation */}
      <style jsx>{`
        @keyframes scanLine {
          0% { transform: translateY(-50px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }
      `}</style>
    </section>
  );
};

export default AuthSection;
