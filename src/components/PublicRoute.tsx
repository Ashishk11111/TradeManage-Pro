import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

/**
 * PublicRoute is used for pages like /login or /register.
 * If user is already logged in, it redirects them to dashboard (/dashboard).
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session?.user);
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <p className="text-center mt-10">Checking authentication...</p>;
  }

  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;
