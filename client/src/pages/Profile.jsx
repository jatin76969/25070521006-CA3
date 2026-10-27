import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as userApi from '../api/users.js';
import { User, Mail, Phone, Lock, Shield, CheckCircle, Save, Calendar } from 'lucide-react';

export default function Profile() {
  const { user, loading: authLoading, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name cannot be empty.', 'error');
      return;
    }

    setSaving(true);
    try {
      const res = await userApi.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });

      if (res.success && res.user) {
        updateUser(res.user);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return null;
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Member';

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
            Player Profile
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-600)' }}>
            Manage your personal contact details. Email address is permanently bound to your account for booking verification.
          </p>
        </div>

        {/* Card */}
        <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)' }}>
          {/* User Avatar & Role */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingBottom: '1.75rem', borderBottom: '1px solid var(--color-slate-100)', marginBottom: '1.75rem' }}>
            <div style={{ width: 68, height: 68, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-emerald-500), var(--color-navy-900))', color: 'var(--color-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 900 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                  {user.name}
                </h2>
                {user.role === 'admin' ? (
                  <span className="badge badge-admin">Administrator</span>
                ) : (
                  <span className="badge badge-sport">Registered Player</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: '0.2rem' }}>
                <Calendar size={13} />
                <span>Member since {memberSince}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">
                Full Name
              </label>
              <div className="form-input-wrap">
                <User size={18} className="form-input-icon" />
                <input
                  id="profile-name"
                  type="text"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">
                Email Address <span style={{ color: 'var(--color-slate-400)', fontWeight: 400 }}>(Read-Only)</span>
              </label>
              <div className="form-input-wrap">
                <Mail size={18} className="form-input-icon" />
                <input
                  id="profile-email"
                  type="email"
                  className="form-input"
                  value={user.email}
                  disabled
                  readOnly
                  style={{ backgroundColor: 'var(--color-slate-100)', color: 'var(--color-slate-500)', cursor: 'not-allowed' }}
                />
                <Lock size={16} style={{ position: 'absolute', right: '1rem', color: 'var(--color-slate-400)' }} />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '0.35rem' }}>
                Email cannot be modified to protect booking ownership and account security.
              </p>
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">
                Phone Number
              </label>
              <div className="form-input-wrap">
                <Phone size={18} className="form-input-icon" />
                <input
                  id="profile-phone"
                  type="tel"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {/* Submit */}
            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '46px' }}
                disabled={saving}
              >
                <Save size={16} />
                <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
