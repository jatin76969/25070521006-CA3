import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import {
  Trophy,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  CalendarCheck,
  Compass,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Signed out successfully.', 'info');
      navigate('/');
    } catch (err) {
      addToast('Logout error.', 'error');
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={closeMobile}>
          <div className="nav-logo-icon">
            <Trophy size={18} />
          </div>
          <span>7 <span style={{ color: 'var(--color-lime-400)' }}>Sports</span></span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/explore" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                Explore Venues
              </NavLink>
            </li>
            {user && (
              <li>
                <NavLink to="/my-bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  My Bookings
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li>
                <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={14} style={{ color: 'var(--color-lime-400)' }} />
                    Admin
                  </span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Desktop Auth Actions */}
        <div className="nav-auth-actions">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/profile" className="nav-user-badge" title="View Profile">
                <User size={15} style={{ color: 'var(--color-emerald-400)' }} />
                <span>{user.name.split(' ')[0]}</span>
                {isAdmin && <span className="badge badge-admin">Admin</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline-white btn-sm"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Link to="/login" className="btn btn-outline-white btn-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/" onClick={closeMobile} className="nav-link">
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/explore" onClick={closeMobile} className="nav-link">
              Explore Venues
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/my-bookings" onClick={closeMobile} className="nav-link">
                My Bookings
              </NavLink>
            </li>
          )}
          {isAdmin && (
            <li>
              <NavLink to="/admin" onClick={closeMobile} className="nav-link">
                Admin Dashboard
              </NavLink>
            </li>
          )}
          {user ? (
            <>
              <li>
                <NavLink to="/profile" onClick={closeMobile} className="nav-link">
                  Profile ({user.name})
                </NavLink>
              </li>
              <li>
                <button
                  onClick={() => {
                    closeMobile();
                    handleLogout();
                  }}
                  className="btn btn-danger btn-sm"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={closeMobile} className="btn btn-outline-white btn-sm" style={{ flex: 1 }}>
                Sign In
              </Link>
              <Link to="/signup" onClick={closeMobile} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                Sign Up
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
