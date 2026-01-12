
import { Navigate } from 'react-router-dom';
import { authService } from '../sevices/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Check if user is admin - only admins can access this admin panel
  if (!authService.isAdmin()) {
    console.warn('[ProtectedRoute] ⚠️ Non-admin user attempted to access protected route');
    // Clear any stored tokens/data
    authService.logout();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

