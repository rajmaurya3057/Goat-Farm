import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';
import { ROUTES } from '../utils/constants';

export default function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage label="Loading..." />;
  }

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
