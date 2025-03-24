
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fingerprint, Eye, EyeOff, Check, Loader2 } from "lucide-react";

const AuthSection = () => {
  const navigate = useNavigate();
  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"credentials" | "biometric">("credentials");
  const [biometricStatus, setBiometricStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      navigate("/vote");
    }, 1500);
  };

  const simulateBiometricScan = () => {
    setBiometricStatus("scanning");
    
    // Simulate scanning process
    setTimeout(() => {
      setBiometricStatus("success");
      
      // Navigate after successful scan
      setTimeout(() => {
        navigate("/vote");
      }, 1000);
    }, 2000);
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8 animate-fade-in">
          <h2 className="h2 mb-2">Voter Authentication</h2>
          <p className="text-muted-foreground">
            Please verify your identity to access the voting system
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 animate-scale-in">
          {/* Auth method selector */}
          <div className="flex justify-center space-x-2 mb-6">
            <button
              onClick={() => setAuthMethod("credentials")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                authMethod === "credentials"
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              Credentials
            </button>
            <button
              onClick={() => setAuthMethod("biometric")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                authMethod === "biometric"
                  ? "bg-primary text-white"
                  : "bg-secondary text-foreground"
              }`}
            >
              Biometric
            </button>
          </div>

          {authMethod === "credentials" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="voterId" className="block text-sm font-medium">
                  Voter ID
                </label>
                <input
                  id="voterId"
                  type="text"
                  value={voterId}
                  onChange={(e) => setVoterId(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Enter your voter ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all disabled:opacity-70 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div 
                className={`w-32 h-32 rounded-full border-2 mb-6 flex items-center justify-center transition-all ${
                  biometricStatus === "idle" ? "border-muted-foreground" :
                  biometricStatus === "scanning" ? "border-primary border-4 animate-pulse" :
                  biometricStatus === "success" ? "border-green-500 border-4" :
                  "border-red-500 border-4"
                }`}
              >
                {biometricStatus === "idle" && (
                  <Fingerprint className="w-16 h-16 text-muted-foreground" />
                )}
                {biometricStatus === "scanning" && (
                  <Fingerprint className="w-16 h-16 text-primary animate-pulse" />
                )}
                {biometricStatus === "success" && (
                  <Check className="w-16 h-16 text-green-500" />
                )}
                {biometricStatus === "error" && (
                  <Fingerprint className="w-16 h-16 text-red-500" />
                )}
              </div>

              {biometricStatus === "idle" && (
                <button
                  onClick={simulateBiometricScan}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all"
                >
                  Scan Fingerprint
                </button>
              )}
              
              {biometricStatus === "scanning" && (
                <p className="text-center text-primary font-medium animate-pulse">
                  Scanning your fingerprint...
                </p>
              )}
              
              {biometricStatus === "success" && (
                <p className="text-center text-green-500 font-medium">
                  Authentication successful!
                </p>
              )}
              
              {biometricStatus === "error" && (
                <>
                  <p className="text-center text-red-500 font-medium mb-4">
                    Authentication failed. Please try again.
                  </p>
                  <button
                    onClick={simulateBiometricScan}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium shadow hover:shadow-md transition-all"
                  >
                    Retry
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
