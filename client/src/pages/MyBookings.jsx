import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as bookingApi from '../api/bookings.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import CancelModal from '../components/CancelModal.jsx';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Printer,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
} from 'lucide-react';

export default function MyBookings() {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'upcoming', 'past', 'cancelled'

  // Cancellation modal
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Active printable receipt modal
  const [printBooking, setPrintBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getMyBookings();
      if (data.success) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      addToast(err.message || 'Error loading bookings.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { returnUrl: '/my-bookings' } });
      return;
    }
    if (user) {
      fetchBookings();
    }
  }, [user, authLoading, navigate, fetchBookings]);

  // Determine booking time status
  const isBookingPast = (b) => {
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const currentHour = parseInt(
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }).format(new Date()),
      10
    );

    if (b.bookingDate < today) return true;
    if (b.bookingDate === today && b.startHour <= currentHour) return true;
    return false;
  };

  const handleCancelClick = (booking) => {
    setBookingToCancel(booking);
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async (bookingId, reason) => {
    try {
      const res = await bookingApi.cancelBooking(bookingId, reason);
      if (res.success) {
        addToast('Booking cancelled. Slot has been released.', 'success');
        fetchBookings();
      }
    } catch (err) {
      addToast(err.message || 'Failed to cancel booking.', 'error');
    }
  };

  // Filter bookings by tab
  const filteredBookings = bookings.filter((b) => {
    const past = isBookingPast(b);
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED' && !past;
    if (activeTab === 'past') return b.status === 'CONFIRMED' && past;
    return true; // 'all'
  });

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading your sports bookings..." size="large" />;
  }

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
              My Bookings
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--color-slate-600)' }}>
              Manage your upcoming matches, view past reservations, and download confirmation receipts.
            </p>
          </div>

          <Link to="/explore" className="btn btn-primary">
            <span>Book New Turf Slot</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-slate-200)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'all' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('all')}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'upcoming' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('upcoming')}
          >
            Upcoming ({bookings.filter((b) => b.status === 'CONFIRMED' && !isBookingPast(b)).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'past' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('past')}
          >
            Past Matches ({bookings.filter((b) => b.status === 'CONFIRMED' && isBookingPast(b)).length})
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'cancelled' ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setActiveTab('cancelled')}
          >
            Cancelled ({bookings.filter((b) => b.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-slate-100)', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Calendar size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
              No Bookings Found in This View
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-500)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Ready for action? Find top turf grounds and courts across Nagpur, Pune, and Mumbai.
            </p>
            <Link to="/explore" className="btn btn-primary">
              Explore Grounds Now
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredBookings.map((b) => {
              const isPast = isBookingPast(b);
              const isCancelled = b.status === 'CANCELLED';
              const canCancel = !isCancelled && !isPast;

              return (
                <div
                  key={b._id}
                  style={{
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    border: '1px solid var(--color-slate-200)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr auto',
                    gap: '1.5rem',
                    alignItems: 'center',
                  }}
                >
                  {/* Left: Venue & Slot Info */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-sport">
                        {b.venueSnapshot?.sport || b.venue?.sport || 'sports'}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                        Ref: {b.bookingReference}
                      </span>
                      {isCancelled ? (
                        <span className="badge badge-cancelled">Cancelled</span>
                      ) : isPast ? (
                        <span className="badge badge-past">Past Match</span>
                      ) : (
                        <span className="badge badge-confirmed">Confirmed Active</span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
                      {b.venueSnapshot?.name || b.venue?.name || 'Sports Venue'}
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.88rem', color: 'var(--color-slate-600)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} style={{ color: 'var(--color-emerald-600)' }} />
                        <span>{b.bookingDate}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Clock size={14} style={{ color: 'var(--color-emerald-600)' }} />
                        <span>{b.timeSlot} (1 Hour)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} style={{ color: 'var(--color-emerald-600)' }} />
                        <span>{b.venueSnapshot?.city || b.venue?.city || 'City'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Pricing & Payment Info */}
                  <div style={{ borderLeft: '1px solid var(--color-slate-100)', paddingLeft: '1.5rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                      Payment Due at Venue
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                      ₹{b.price}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '0.2rem' }}>
                      {isCancelled ? 'No payment required (Slot released)' : 'Pay cash / UPI on arrival'}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setPrintBooking(b)}
                    >
                      <Printer size={14} />
                      <span>Print Receipt</span>
                    </button>

                    {canCancel && (
                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => handleCancelClick(b)}
                      >
                        <XCircle size={14} />
                        <span>Cancel Booking</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancellation Confirmation Modal */}
      <CancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
        booking={bookingToCancel}
      />

      {/* Printable Receipt Modal */}
      {printBooking && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card printable-receipt" style={{ maxWidth: '480px' }}>
            <button className="modal-close-btn no-print" onClick={() => setPrintBooking(null)}>
              &times;
            </button>

            <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-slate-200)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
                7 Sports Booking Receipt
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
                Official Reservation Slip (Pay at Venue)
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-slate-500)' }}>
                Reference Code
              </span>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-emerald-700)' }}>
                {printBooking.bookingReference}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Player Name:</span>
                <span style={{ fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Venue:</span>
                <span style={{ fontWeight: 600 }}>{printBooking.venueSnapshot?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{printBooking.bookingDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Time Slot:</span>
                <span style={{ fontWeight: 600 }}>{printBooking.timeSlot}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Status:</span>
                <span style={{ fontWeight: 700, color: printBooking.status === 'CONFIRMED' ? 'var(--color-emerald-700)' : 'var(--color-danger-600)' }}>
                  {printBooking.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-slate-200)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Amount Payable:</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>₹{printBooking.price}</span>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
                style={{ flex: 1 }}
              >
                <Printer size={15} />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPrintBooking(null)}
                style={{ flex: 1 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
