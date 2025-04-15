import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Vote from "./pages/Vote";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";
import { useAuth } from "./contexts/AuthContext";
import { useEffect } from 'react';
import { BlockchainService } from './services/blockchain/blockchain';
import { VoteList } from './components/VoteList';
import { CreateVote } from './components/CreateVote';
import BlockchainVoting from "./components/BlockchainVoting";

const queryClient = new QueryClient();

// Navigation guard component to hide Results for non-admin users
const NavigationGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  // We're passing the entire app through this component
  // so we can access the auth context for the routes
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/vote"
        element={<ProtectedRoute element={<Vote />} />}
      />
      <Route
        path="/results"
        element={<ProtectedRoute element={<Results />} requiresAdmin={true} />}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        const blockchainService = BlockchainService.getInstance();
        await blockchainService.initialize();
      } catch (error) {
        console.error('Failed to initialize blockchain:', error);
      }
    };

    initializeBlockchain();

    return () => {
      BlockchainService.getInstance().disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
              <NavigationGuard>
                <AppRoutes />
              </NavigationGuard>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
