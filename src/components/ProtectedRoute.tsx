
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ProtectedRouteProps = {
  element: React.ReactNode;
  requiresAdmin?: boolean;
};

const ProtectedRoute = ({ element, requiresAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const { toast } = useToast();
  const [secondsLeft, setSecondsLeft] = useState(150); // 2.5 minutes in seconds
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Reset timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now());
    setSecondsLeft(150); // Reset to 2.5 minutes
  };

  // Set up event listeners for user activity
  useEffect(() => {
    if (isAuthenticated) {
      // Track user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      
      const handleUserActivity = () => {
        resetTimer();
      };
      
      // Add event listeners
      events.forEach(event => {
        document.addEventListener(event, handleUserActivity);
      });
      
      // Timer countdown
      const interval = setInterval(() => {
        const secondsIdle = Math.floor((Date.now() - lastActivity) / 1000);
        const timeLeft = 150 - secondsIdle;
        
        setSecondsLeft(Math.max(0, timeLeft));
        
        // Show warning when 30 seconds left
        if (timeLeft === 30) {
          toast({
            title: "Session Expiring Soon",
            description: "Your session will expire in 30 seconds due to inactivity.",
            variant: "destructive",
          });
        }
        
        // Logout when timer reaches 0
        if (timeLeft <= 0) {
          logout();
          toast({
            title: "Session Expired",
            description: "Your session has expired due to inactivity. Please login again.",
            variant: "destructive",
          });
          clearInterval(interval);
        }
      }, 1000);
      
      // Clean up
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserActivity);
        });
        clearInterval(interval);
      };
    }
  }, [isAuthenticated, lastActivity, logout, toast]);
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <>
      {isAuthenticated && (
        <div className="fixed top-2 right-2 z-50 bg-primary/10 text-xs text-primary font-medium px-2 py-1 rounded-full">
          Session: {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
        </div>
      )}
      {element}
    </>
  );
};

export default ProtectedRoute;
