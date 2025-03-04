import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useProtectedRoute = (requiredRoles?: string[]) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (requiredRoles && user && !requiredRoles.includes(user.role)) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [isAuthenticated, user, requiredRoles, navigate]);

  return { isAuthenticated, user };
};