import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect back to the page the user tried to visit (or Home)
  const from = location.state?.from?.pathname || '/';

  const isSignup = mode === 'signup';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (isSignup && !name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        await signup(name.trim(), email, password);
        setSuccess('Account created! Logging you in…');
        await login(email, password);
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      // AuthContext now throws Error objects with pre-classified, user-friendly messages.
      // Fall back to a generic message only if something truly unexpected happens.
      const msg = err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError(null);
    setSuccess(null);
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #030712;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
          padding: 1rem;
        }

        /* Ambient gradient blobs */
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          opacity: 0.45;
        }
        .blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #2563eb 0%, transparent 70%);
          top: -200px; left: -150px;
          animation: float1 8s ease-in-out infinite;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
          bottom: -200px; right: -100px;
          animation: float2 10s ease-in-out infinite;
        }
        .blob-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, #0ea5e9 0%, transparent 70%);
          top: 50%; left: 60%;
          animation: float3 12s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(30px, 40px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(-20px, -30px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(15px, -25px); }
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem 2.5rem 2rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.05),
            0 24px 80px rgba(0, 0, 0, 0.6),
            0 0 60px rgba(37, 99, 235, 0.08);
          animation: cardIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)     scale(1);    }
        }

        /* Logo / Brand */
        .brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 2rem;
          text-decoration: none;
        }
        .brand-icon {
          font-size: 1.75rem;
          line-height: 1;
        }
        .brand-text {
          font-size: 1.3rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .brand-text span {
          background: linear-gradient(135deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Tab switcher */
        .tab-row {
          display: flex;
          background: rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 2rem;
          gap: 4px;
        }
        .tab-btn {
          flex: 1;
          padding: 0.55rem 0;
          border: none;
          border-radius: 9px;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #94a3b8;
          background: transparent;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #fff;
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
        }
        .tab-btn:not(.active):hover {
          color: #cbd5e1;
          background: rgba(255,255,255,0.06);
        }

        /* Heading */
        .card-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 0.35rem;
          letter-spacing: -0.4px;
        }
        .card-subtitle {
          font-size: 0.875rem;
          color: #64748b;
          margin-bottom: 1.75rem;
        }

        /* Form */
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .field-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }
        .field-wrap {
          position: relative;
        }
        .field-input {
          width: 100%;
          padding: 0.8rem 1rem;
          padding-right: 2.8rem;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #f1f5f9;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          -webkit-autofill: transparent;
        }
        .field-input::placeholder { color: #475569; }
        .field-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.18);
        }
        .field-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #475569;
          font-size: 1rem;
          line-height: 1;
        }
        .toggle-pw {
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          font-size: 1rem;
          padding: 0;
          transition: color 0.15s;
        }
        .toggle-pw:hover { color: #94a3b8; }

        /* Strength indicator (signup only) */
        .strength-bar {
          display: flex;
          gap: 4px;
          margin-top: 4px;
        }
        .strength-seg {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          background: rgba(255,255,255,0.08);
          transition: background 0.3s;
        }

        /* Alert banners */
        .alert {
          border-radius: 10px;
          padding: 0.65rem 0.9rem;
          font-size: 0.85rem;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          animation: fadeIn 0.2s ease;
        }
        .alert-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        .alert-success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.25);
          color: #86efac;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        /* Submit button */
        .submit-btn {
          width: 100%;
          padding: 0.85rem;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
          color: #fff;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.35);
          margin-top: 0.5rem;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
          box-shadow: 0 10px 28px rgba(37, 99, 235, 0.45);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 1rem 0;
          color: #334155;
          font-size: 0.8rem;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        /* Footer toggle */
        .footer-text {
          text-align: center;
          font-size: 0.875rem;
          color: #475569;
          margin-top: 1.25rem;
        }
        .footer-link {
          background: none;
          border: none;
          cursor: pointer;
          color: #60a5fa;
          font-family: inherit;
          font-size: inherit;
          font-weight: 600;
          padding: 0;
          transition: color 0.15s;
        }
        .footer-link:hover { color: #93c5fd; text-decoration: underline; }

        /* Home link */
        .home-link {
          display: block;
          text-align: center;
          margin-top: 0.75rem;
          font-size: 0.8rem;
          color: #334155;
          text-decoration: none;
          transition: color 0.15s;
        }
        .home-link:hover { color: #60a5fa; }
      `}</style>

      <div className="login-root">
        {/* Ambient blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="login-card">
          {/* Brand */}
          <div className="brand">
            <span className="brand-icon">🎯</span>
            <span className="brand-text">Career<span>Lenses</span></span>
          </div>

          {/* Tab switcher */}
          <div className="tab-row" role="tablist">
            <button
              id="tab-login"
              role="tab"
              aria-selected={!isSignup}
              className={`tab-btn ${!isSignup ? 'active' : ''}`}
              onClick={() => isSignup && toggleMode()}
            >
              Sign In
            </button>
            <button
              id="tab-signup"
              role="tab"
              aria-selected={isSignup}
              className={`tab-btn ${isSignup ? 'active' : ''}`}
              onClick={() => !isSignup && toggleMode()}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <p className="card-title">
            {isSignup ? 'Join CareerLenses' : 'Welcome back'}
          </p>
          <p className="card-subtitle">
            {isSignup
              ? 'Create your free account to get started'
              : 'Sign in to access your resume analysis'}
          </p>

          {/* Alerts */}
          {error   && <div className="alert alert-error"   role="alert">⚠ {error}</div>}
          {success && <div className="alert alert-success" role="status">✓ {success}</div>}

          {/* Form */}
          <form id="auth-form" className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name (signup only) */}
            {isSignup && (
              <div className="field-group">
                <label htmlFor="auth-name" className="field-label">Full Name</label>
                <div className="field-wrap">
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    className="field-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required={isSignup}
                  />
                  <span className="field-icon">👤</span>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="field-group">
              <label htmlFor="auth-email" className="field-label">Email address</label>
              <div className="field-wrap">
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  className="field-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span className="field-icon">✉</span>
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label htmlFor="auth-password" className="field-label">Password</label>
              <div className="field-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  className="field-input"
                  placeholder={isSignup ? 'Min. 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-pw field-icon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {/* Password strength indicator (signup only) */}
              {isSignup && (
                <PasswordStrength password={password} />
              )}
            </div>

            {/* Confirm Password (signup only) */}
            {isSignup && (
              <div className="field-group">
                <label htmlFor="auth-confirm" className="field-label">Confirm Password</label>
                <div className="field-wrap">
                  <input
                    id="auth-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="field-input"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required={isSignup}
                  />
                  <span className="field-icon" style={{
                    color: confirmPassword.length > 0
                      ? confirmPassword === password ? '#34d399' : '#f87171'
                      : '#475569'
                  }}>
                    {confirmPassword.length > 0
                      ? confirmPassword === password ? '✓' : '✗'
                      : '🔒'}
                  </span>
                </div>
              </div>
            )}

            <button
              id="auth-submit-btn"
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner" /> {isSignup ? 'Creating account…' : 'Signing in…'}</>
                : isSignup ? 'Create Account →' : 'Sign In →'
              }
            </button>
          </form>

          <div className="divider">or</div>

          <p className="footer-text">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button
              id="auth-toggle-mode"
              className="footer-link"
              type="button"
              onClick={toggleMode}
            >
              {isSignup ? 'Sign in' : 'Create one for free'}
            </button>
          </p>

          <Link to="/" className="home-link">← Back to CareerLenses</Link>
        </div>
      </div>
    </>
  );
}

/** Visual password strength indicator */
function PasswordStrength({ password }) {
  const getStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0–5
  };

  const strength = getStrength(password);
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const filledColor = password.length > 0 ? colors[Math.min(strength - 1, 4)] : 'rgba(255,255,255,0.08)';

  return (
    <div>
      <div className="strength-bar" aria-label={`Password strength: ${password.length > 0 ? labels[Math.min(strength - 1, 4)] : 'None'}`}>
        {[1, 2, 3, 4, 5].map(n => (
          <div
            key={n}
            className="strength-seg"
            style={{ background: n <= strength && password.length > 0 ? filledColor : undefined }}
          />
        ))}
      </div>
      {password.length > 0 && (
        <p style={{ fontSize: '0.75rem', color: filledColor, marginTop: 4, textAlign: 'right' }}>
          {labels[Math.min(strength - 1, 4)]}
        </p>
      )}
    </div>
  );
}
