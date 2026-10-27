import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { User, Mail, Lock, Phone, Eye, EyeOff, Trophy, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      if (data.success) {
        addToast(`Account created! Welcome, ${data.user.name}.`, 'success');
        navigate('/explore', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Visual Side */}
      <div className="auth-visual-side">
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80"
          alt="Football Arena"
          className="auth-visual-bg"
        />
        <div className="auth-visual-overlay" />
        <div className="auth-visual-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', color: 'var(--color-lime-400)', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1.5rem', border: '1px solid rgba(132, 204, 22, 0.3)' }}>
            <Trophy size={14} />
            <span>Instant Spot Reservation</span>
          </div>
          <blockquote className="auth-quote">
            “Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing.”
          </blockquote>
          <p className="auth-quote-author">Pelé</p>
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

            <h1 className="auth-title">Create Player Account</h1>
            <p className="auth-subtitle">
              Join 7 Sports to reserve turf slots across Nagpur, Pune, and Mumbai.
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
              <label className="form-label" htmlFor="reg-name">
                Full Name *
              </label>
              <div className="form-input-wrap">
                <User size={18} className="form-input-icon" />
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rohan Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address *
              </label>
              <div className="form-input-wrap">
                <Mail size={18} className="form-input-icon" />
                <input
                  id="reg-email"
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
              <label className="form-label" htmlFor="reg-phone">
                Phone Number (Optional)
              </label>
              <div className="form-input-wrap">
                <Phone size={18} className="form-input-icon" />
                <input
                  id="reg-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password * (min. 6 characters)
              </label>
              <div className="form-input-wrap">
                <Lock size={18} className="form-input-icon" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password *
              </label>
              <div className="form-input-wrap">
                <Lock size={18} className="form-input-icon" />
                <input
                  id="reg-confirm"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', height: '46px', marginTop: '0.75rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Creating Account...' : 'Sign Up as Player'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-emerald-600)', fontWeight: 700 }}>
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
