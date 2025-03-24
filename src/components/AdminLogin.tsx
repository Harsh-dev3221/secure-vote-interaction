
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { adminLogin } = useAuth();
  
  // Admin login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Input validation states
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  // Validate username in real-time
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    setUsernameError("");
    return true;
  };
  
  // Validate password in real-time
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError("Password is required");
      return false;
    }
    setPasswordError("");
    return true;
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const isUsernameValid = validateUsername(username);
    const isPasswordValid = validatePassword(password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    // Simulate authentication delay for UX
    setTimeout(() => {
      const loginSuccess = adminLogin(username, password);
      
      if (loginSuccess) {
        toast({
          title: "Admin Authentication Successful",
          description: "Redirecting to results dashboard...",
        });
        navigate("/results");
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid admin credentials",
          variant: "destructive",
        });
      }
      
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border p-6 sm:p-8 animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">Admin Login</h3>
        <p className="text-muted-foreground text-sm mt-1">Access election results dashboard</p>
      </div>
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Username
          </Label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              validateUsername(e.target.value);
            }}
            className={`w-full ${
              usernameError ? "border-destructive ring-destructive/50" : ""
            }`}
            placeholder="Enter admin username"
            disabled={isLoading}
            aria-invalid={!!usernameError}
            aria-describedby={usernameError ? "username-error" : undefined}
            required
          />
          {usernameError && (
            <p id="username-error" className="text-sm text-destructive">{usernameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <Input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
              }}
              className={`w-full pr-10 ${
                passwordError ? "border-destructive ring-destructive/50" : ""
              }`}
              placeholder="Enter admin password"
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
          disabled={isLoading}
          className="w-full py-3 font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Admin Login
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default AdminLogin;
