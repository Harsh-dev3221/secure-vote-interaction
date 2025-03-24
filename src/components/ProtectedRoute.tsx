
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  element: React.ReactNode;
  requiresAdmin?: boolean;
};

const ProtectedRoute = ({ element, requiresAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{element}</>;
};

export default ProtectedRoute;
