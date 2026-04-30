import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

/**
 * PrivateRoute — wraps protected pages.
 * If the user has no valid JWT, redirects to /login and
 * preserves the original destination so we can redirect back after login.
 */
export default function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
