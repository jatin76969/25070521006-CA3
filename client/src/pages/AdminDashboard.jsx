import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as userApi from '../api/users.js';
import * as venueApi from '../api/venues.js';
import * as bookingApi from '../api/bookings.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Shield,
  Users,
  Trophy,
  CalendarCheck,
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Lock,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Active admin tab: 'venues' or 'bookings'
  const [activeTab, setActiveTab] = useState('venues');

  // Stats state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Venues state
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Venue Edit/Create Modal state
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: '',
    sport: 'cricket',
    city: 'Nagpur',
    address: '',
    hourlyPrice: 1000,
    openingHour: 6,
    closingHour: 23,
    surfaceType: 'Synthetic Turf',
    amenities: 'Floodlights, Changing Rooms, Drinking Water, Parking',
    images: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
    description: '',
    isActive: true,
  });

  // Verify Admin Access
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login', { state: { returnUrl: '/admin' } });
      } else if (!isAdmin) {
        navigate('/');
        addToast('Access denied: Administrator privileges required.', 'error');
      }
    }
  }, [user, isAdmin, authLoading, navigate, addToast]);

  // Load Admin Stats
  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await userApi.getAdminStats();
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      addToast(err.message || 'Error loading platform stats.', 'error');
    } finally {
      setLoadingStats(false);
    }
  }, [addToast]);

  // Load All Venues (including inactive ones)
  const loadVenues = useCallback(async () => {
    setLoadingVenues(true);
    try {
      const res = await venueApi.getVenues({ includeInactive: true });
      if (res.success) {
        setVenues(res.venues || []);
      }
    } catch (err) {
      addToast(err.message || 'Error loading venues.', 'error');
    } finally {
      setLoadingVenues(false);
    }
  }, [addToast]);

  // Load All Bookings
  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;

      const res = await bookingApi.getAllBookings(params);
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      addToast(err.message || 'Error loading bookings.', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, [filterDate, filterStatus, addToast]);

  useEffect(() => {
    if (isAdmin) {
      loadStats();
      loadVenues();
      loadBookings();
    }
  }, [isAdmin, loadStats, loadVenues, loadBookings]);

  // Open Venue Modal (Add or Edit)
  const handleOpenVenueModal = (venueToEdit = null) => {
    if (venueToEdit) {
      setEditingVenue(venueToEdit);
      setVenueForm({
        name: venueToEdit.name,
        sport: venueToEdit.sport,
        city: venueToEdit.city,
        address: venueToEdit.address,
        hourlyPrice: venueToEdit.hourlyPrice,
        openingHour: venueToEdit.openingHour ?? 6,
        closingHour: venueToEdit.closingHour ?? 23,
        surfaceType: venueToEdit.surfaceType || 'Synthetic Turf',
        amenities: Array.isArray(venueToEdit.amenities) ? venueToEdit.amenities.join(', ') : '',
        images: Array.isArray(venueToEdit.images) ? venueToEdit.images.join(', ') : '',
        description: venueToEdit.description,
        isActive: venueToEdit.isActive !== false,
      });
    } else {
      setEditingVenue(null);
      setVenueForm({
        name: '',
        sport: 'cricket',
        city: 'Nagpur',
        address: '',
        hourlyPrice: 1000,
        openingHour: 6,
        closingHour: 23,
        surfaceType: 'Synthetic AstroTurf',
        amenities: 'Floodlights, Changing Rooms, Drinking Water, Parking',
        images: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
        description: 'Pristine, competition-standard sports arena.',
        isActive: true,
      });
    }
    setVenueModalOpen(true);
  };

  // Submit Venue Modal (Create or Update)
  const handleVenueFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...venueForm,
      hourlyPrice: Number(venueForm.hourlyPrice),
      openingHour: Number(venueForm.openingHour),
      closingHour: Number(venueForm.closingHour),
      amenities: venueForm.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: venueForm.images.split(',').map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (editingVenue) {
        const res = await venueApi.updateVenue(editingVenue._id, payload);
        if (res.success) {
          addToast('Venue updated successfully!', 'success');
        }
      } else {
        const res = await venueApi.createVenue(payload);
        if (res.success) {
          addToast('New venue created successfully!', 'success');
        }
      }
      setVenueModalOpen(false);
      loadVenues();
      loadStats();
    } catch (err) {
      addToast(err.message || 'Failed to save venue.', 'error');
    }
  };

  // Safe Deactivate or Delete Venue
  const handleDeleteVenue = async (venue) => {
    const confirmMsg = `Are you sure you want to deactivate or delete "${venue.name}"? If it has booking history, it will be safely deactivated to preserve user records.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await venueApi.deleteVenue(venue._id);
      if (res.success) {
        addToast(res.message, 'success');
        loadVenues();
        loadStats();
      }
    } catch (err) {
      addToast(err.message || 'Failed to process venue deletion.', 'error');
    }
  };

  if (authLoading || !isAdmin) {
    return <LoadingSpinner text="Authenticating administrator access..." size="large" />;
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-admin">
                <Shield size={12} />
                Administrator Portal
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
                • Master Control Panel
              </span>
            </div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
              Admin Management Console
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-slate-600)' }}>
              Monitor system stats, create and maintain sports venues, and audit user bookings.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleOpenVenueModal()}
          >
            <Plus size={16} />
            <span>Add New Venue</span>
          </button>
        </div>

        {/* 1. Statistics Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          {/* Total Users */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                Total Users
              </span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
              {stats?.totalUsers ?? '—'}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Registered platform accounts</span>
          </div>

          {/* Total Venues */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                Total Venues
              </span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-emerald-50)', color: 'var(--color-emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
              {stats?.totalVenues ?? '—'}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
              {stats?.activeVenues ?? 0} actively accepting slots
            </span>
          </div>

          {/* Total Bookings */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                Total Bookings
              </span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
              {stats?.totalBookings ?? '—'}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
              {stats?.confirmedBookings ?? 0} confirmed, {stats?.cancelledBookings ?? 0} cancelled
            </span>
          </div>

          {/* Revenue */}
          <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                Revenue Generated
              </span>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-emerald-50)', color: 'var(--color-emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-emerald-700)' }}>
              ₹{stats?.totalRevenue ?? 0}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>Collected at venue counter</span>
          </div>
        </div>

        {/* 2. Management Tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            className={`btn ${activeTab === 'venues' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('venues')}
          >
            <Trophy size={16} />
            <span>Venues Management ({venues.length})</span>
          </button>

          <button
            type="button"
            className={`btn ${activeTab === 'bookings' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('bookings')}
          >
            <CalendarCheck size={16} />
            <span>Platform Bookings Audit ({bookings.length})</span>
          </button>
        </div>

        {/* TAB 1: VENUES MANAGEMENT */}
        {activeTab === 'venues' && (
          <div>
            {loadingVenues ? (
              <LoadingSpinner text="Loading venues list..." />
            ) : (
              <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.92rem' }}>
                  <thead style={{ backgroundColor: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-slate-200)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Venue</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>City & Sport</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Rate / Hour</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Hours</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Status</th>
                      <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-slate-600)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((v) => (
                      <tr key={v._id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-navy-900)' }}>{v.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v.address}
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          <span className="badge badge-city" style={{ marginRight: '0.4rem' }}>{v.city}</span>
                          <span className="badge badge-sport">{v.sport}</span>
                        </td>
                        <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-emerald-700)' }}>
                          ₹{v.hourlyPrice}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', color: 'var(--color-slate-600)' }}>
                          {v.openingHour}:00 - {v.closingHour}:00
                        </td>
                        <td style={{ padding: '1rem 1.25rem' }}>
                          {v.isActive ? (
                            <span className="badge badge-confirmed">Active</span>
                          ) : (
                            <span className="badge badge-cancelled">Inactive</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <Link to={`/venues/${v._id}`} className="btn btn-outline btn-sm" title="Preview Public Page">
                              <Eye size={14} />
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => handleOpenVenueModal(v)}
                              title="Edit Venue Details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-danger-outline btn-sm"
                              onClick={() => handleDeleteVenue(v)}
                              title="Deactivate or Delete Venue"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLATFORM BOOKINGS AUDIT */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter Bar */}
            <div style={{ backgroundColor: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-500)', marginBottom: '0.25rem' }}>
                  Filter by Date (YYYY-MM-DD)
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  style={{ padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-300)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-slate-500)', marginBottom: '0.25rem' }}>
                  Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-300)' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => {
                  setFilterDate('');
                  setFilterStatus('all');
                }}
                style={{ alignSelf: 'flex-end', height: '38px' }}
              >
                Clear Filters
              </button>
            </div>

            {loadingBookings ? (
              <LoadingSpinner text="Querying bookings database..." />
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ color: 'var(--color-slate-500)' }}>No bookings found matching selected filters.</p>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead style={{ backgroundColor: 'var(--color-slate-50)', borderBottom: '1px solid var(--color-slate-200)' }}>
                    <tr>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Reference</th>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Player</th>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Venue</th>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Date & Slot</th>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Amount</th>
                      <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-slate-600)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                        <td style={{ padding: '1rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                          {b.bookingReference}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{b.user?.name || 'Player'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>{b.user?.email}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600 }}>{b.venueSnapshot?.name || b.venue?.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>{b.venueSnapshot?.city}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div>{b.bookingDate}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--color-emerald-700)', fontWeight: 600 }}>{b.timeSlot}</div>
                        </td>
                        <td style={{ padding: '1rem', fontWeight: 700 }}>
                          ₹{b.price}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {b.status === 'CONFIRMED' ? (
                            <span className="badge badge-confirmed">Confirmed</span>
                          ) : (
                            <span className="badge badge-cancelled">Cancelled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Venue Edit/Create Modal */}
      {venueModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card" style={{ maxWidth: '640px' }}>
            <button className="modal-close-btn" onClick={() => setVenueModalOpen(false)}>
              &times;
            </button>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-navy-900)', marginBottom: '1.25rem' }}>
              {editingVenue ? 'Edit Venue Details' : 'Add New Sports Venue'}
            </h2>

            <form onSubmit={handleVenueFormSubmit}>
              <div className="form-group">
                <label className="form-label">Venue Name *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.name}
                  onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Sport Category *</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={venueForm.sport}
                    onChange={(e) => setVenueForm({ ...venueForm, sport: e.target.value })}
                  >
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="badminton">Badminton</option>
                    <option value="basketball">Basketball</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={venueForm.city}
                    onChange={(e) => setVenueForm({ ...venueForm, city: e.target.value })}
                  >
                    <option value="Nagpur">Nagpur</option>
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.address}
                  onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hourly Price (₹) *</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={venueForm.hourlyPrice}
                    onChange={(e) => setVenueForm({ ...venueForm, hourlyPrice: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Open Hour (0-23)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={venueForm.openingHour}
                    onChange={(e) => setVenueForm({ ...venueForm, openingHour: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Close Hour (1-24)</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    className="form-input"
                    style={{ paddingLeft: '1rem' }}
                    value={venueForm.closingHour}
                    onChange={(e) => setVenueForm({ ...venueForm, closingHour: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Surface Type</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.surfaceType}
                  onChange={(e) => setVenueForm({ ...venueForm, surfaceType: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.amenities}
                  onChange={(e) => setVenueForm({ ...venueForm, amenities: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URLs (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.images}
                  onChange={(e) => setVenueForm({ ...venueForm, images: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  rows="3"
                  className="form-input"
                  style={{ paddingLeft: '1rem' }}
                  value={venueForm.description}
                  onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={venueForm.isActive}
                  onChange={(e) => setVenueForm({ ...venueForm, isActive: e.target.checked })}
                  style={{ width: 18, height: 18 }}
                />
                <label htmlFor="isActiveCheck" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy-900)' }}>
                  Active (Accepting live player reservations)
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setVenueModalOpen(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {editingVenue ? 'Save Venue Changes' : 'Create Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
