import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Mail, Lock, Eye, EyeOff, Trophy, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const returnUrl = location.state?.returnUrl || '/explore';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login({ email: email.trim(), password });
      if (data.success) {
        addToast(`Welcome back, ${data.user.name}!`, 'success');
        navigate(returnUrl, { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual Side */}
      <div className="auth-visual-side">
        <img
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
          alt="Sports Turf Arena"
          className="auth-visual-bg"
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', color: 'var(--color-lime-400)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
            <Trophy size={14} />
            <span>7 Sports Community</span>
          </div>
          <blockquote className="auth-quote">
            “The difference between the impossible and the possible lies in determination.”
          </blockquote>
          <p className="auth-quote-author">Tommy Lasorda</p>
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-form-card">
          <div className="auth-header">
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '1.5rem' }}>
              <div className="nav-logo-icon" style={{ width: 28, height: 28, fontSize: '0.9rem' }}>
                <Trophy size={14} />
              </div>
              <span>7 <span style={{ color: 'var(--color-emerald-600)' }}>Sports</span></span>
            </Link>

            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to manage your turf bookings and reserve open slots.
            </p>
          </div>

          {errorMsg && (
            <div className="form-alert form-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="form-input-wrap">
                <Mail size={18} className="form-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="form-input-wrap">
                <Lock size={18} className="form-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="form-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '46px', marginTop: '0.75rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
            Don't have an account yet?{' '}
            <Link to="/signup" style={{ color: 'var(--color-emerald-600)', fontWeight: 700 }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
