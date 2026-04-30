import { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Decode a JWT payload without verifying the signature.
 * The signature is verified server-side on every protected request.
 */
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Returns true when the token's `exp` claim is still in the future. */
function isTokenValid(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}

/**
 * Classify axios errors into user-friendly messages.
 * Returns a string that is safe to show directly in the UI.
 */
function classifyError(err) {
  // Network / connection issues (server not reachable, CORS preflight failed)
  if (!err.response) {
    if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
      return 'Cannot reach the server. Make sure the backend is running on port 8000.';
    }
    if (err.message?.includes('CORS')) {
      return 'CORS error: the server rejected the request from this origin.';
    }
    return `Network error: ${err.message || 'Unknown connection problem.'}`;
  }

  const status = err.response.status;
  const detail = err.response.data?.detail;

  // Backend returned a structured FastAPI error
  if (detail) {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      // Pydantic validation errors come as an array
      return detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
    }
    return JSON.stringify(detail);
  }

  // HTTP status fallbacks
  switch (status) {
    case 400: return 'Bad request. Please check the form fields and try again.';
    case 401: return 'Incorrect email or password.';
    case 403: return 'Access denied. You do not have permission.';
    case 404: return 'User not found.';
    case 409: return 'An account with this email already exists.';
    case 422: return 'Validation error: please check all fields are filled correctly.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 500: return 'Internal server error. Please try again later.';
    case 503: return 'Server is temporarily unavailable. Please try again soon.';
    default:  return `Server returned error ${status}. Please try again.`;
  }
}

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem('cl_token');
    return stored && isTokenValid(stored) ? stored : null;
  });

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('cl_token');
    if (stored && isTokenValid(stored)) {
      const payload = decodeJWT(stored);
      return payload ? { email: payload.sub, loggedIn: true } : null;
    }
    return null;
  });

  // ─── Axios request interceptor ───────────────────────────────────────────────
  // Automatically attaches Authorization header to every outgoing request.
  useEffect(() => {
    const interceptorId = axios.interceptors.request.use((config) => {
      const t = localStorage.getItem('cl_token');
      if (t) {
        config.headers.Authorization = `Bearer ${t}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptorId);
  }, []);

  // ─── Token → localStorage + user state sync ──────────────────────────────────
  useEffect(() => {
    if (token) {
      localStorage.setItem('cl_token', token);
      const payload = decodeJWT(token);
      setUser(payload ? { email: payload.sub, loggedIn: true } : null);
    } else {
      localStorage.removeItem('cl_token');
      setUser(null);
    }
  }, [token]);

  // ─── Auth actions ─────────────────────────────────────────────────────────────

  /**
   * Login with email + password.
   * Backend expects OAuth2 form-encoded body (username=email, password=password).
   */
  const login = useCallback(async (email, password) => {
    try {
      // OAuth2PasswordRequestForm expects application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${BASE_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, user: userData } = response.data;
      setToken(access_token);

      // Store full user profile returned by the server
      if (userData) {
        setUser({ ...userData, loggedIn: true });
      }

      return response.data;
    } catch (err) {
      throw new Error(classifyError(err));
    }
  }, []);

  /**
   * Register a new user and automatically log them in.
   * Returns the login response data so callers can use the token.
   */
  const signup = useCallback(async (name, email, password) => {
    try {
      await axios.post(`${BASE_URL}/auth/register`, { name, email, password });
    } catch (err) {
      throw new Error(classifyError(err));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
