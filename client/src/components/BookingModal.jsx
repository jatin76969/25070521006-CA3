import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import * as bookingApi from '../api/bookings.js';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Printer,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';

export default function BookingModal({
  isOpen,
  onClose,
  venue,
  selectedDate,
  selectedSlot,
  onBookingSuccess,
}) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!user) {
      addToast('Please sign in to complete your booking.', 'info');
      navigate('/login', { state: { returnUrl: `/venues/${venue._id}` } });
      return;
    }

    if (!selectedSlot || !selectedDate) {
      setErrorMsg('Please select a date and an available time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await bookingApi.createBooking({
        venueId: venue._id,
        bookingDate: selectedDate,
        startHour: selectedSlot.startHour,
      });

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        addToast('Booking confirmed successfully!', 'success');
        if (onBookingSuccess) {
          onBookingSuccess(res.booking);
        }
      }
    } catch (err) {
      const msg = err.message || 'Failed to complete booking. Please try again.';
      setErrorMsg(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="booking-modal-title">
      <div className="modal-card">
        <button
          className="modal-close-btn no-print"
          onClick={onClose}
          aria-label="Close dialog"
        >
          &times;
        </button>

        {!confirmedBooking ? (
          /* Step 1: Review & Confirm */
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-sport" style={{ marginBottom: '0.5rem' }}>
                {venue.sport}
              </span>
              <h2 id="booking-modal-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                Review Your Booking
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-500)' }}>
                Please review slot details before finalizing your reservation.
              </p>
            </div>

            {errorMsg && (
              <div className="form-alert form-alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Venue & Slot Details Box */}
            <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>
                {venue.name}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--color-slate-700)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} style={{ color: 'var(--color-emerald-600)' }} />
                  <span><strong>Date:</strong> {selectedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={15} style={{ color: 'var(--color-emerald-600)' }} />
                  <span><strong>Time Slot:</strong> {selectedSlot.timeSlot} (1 Hour)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ color: 'var(--color-emerald-600)', marginTop: 2, flexShrink: 0 }} />
                  <span>{venue.address}, {venue.city}</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div className="price-row">
                <span style={{ color: 'var(--color-slate-600)' }}>1-Hour Court / Turf Slot</span>
                <span>₹{venue.hourlyPrice}</span>
              </div>
              <div className="price-row">
                <span style={{ color: 'var(--color-slate-600)' }}>Online Platform Fee</span>
                <span style={{ color: 'var(--color-emerald-600)', fontWeight: 600 }}>₹0 (Free)</span>
              </div>
              <div className="price-row total">
                <span>Total Amount Payable</span>
                <span style={{ color: 'var(--color-emerald-700)' }}>₹{venue.hourlyPrice}</span>
              </div>
            </div>

            {/* Pay at Venue Notice */}
            <div className="venue-pay-note">
              <strong>College Project Demo Notice:</strong> No online payment or card is collected on this platform. Payment of <strong>₹{venue.hourlyPrice}</strong> will be collected in cash or UPI directly at the venue counter prior to match start.
            </div>

            {/* User Check */}
            {!user ? (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-danger-600)', marginBottom: '0.75rem' }}>
                  You must be logged in to confirm this booking.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => navigate('/login', { state: { returnUrl: `/venues/${venue._id}` } })}
                >
                  Sign In to Continue
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={onClose}
                  style={{ flex: 1 }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleConfirm}
                  style={{ flex: 2 }}
                  disabled={submitting}
                >
                  {submitting ? 'Confirming Slot...' : 'Confirm Reservation'}
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Step 2: Confirmed Receipt View */
          <div className="printable-receipt">
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: 'var(--color-emerald-100)', color: 'var(--color-emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <CheckCircle size={32} />
              </div>
              <span className="badge badge-confirmed" style={{ marginBottom: '0.5rem' }}>
                Booking Confirmed
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
                You're Ready to Play!
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)' }}>
                Your ground is reserved. Present this reference code upon arrival.
              </p>
            </div>

            {/* Reference Box */}
            <div style={{ backgroundColor: 'var(--color-navy-950)', color: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-slate-400)' }}>
                Booking Reference ID
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '0.05em', color: 'var(--color-lime-400)', marginTop: '0.25rem' }}>
                {confirmedBooking.bookingReference}
              </div>
            </div>

            {/* Receipt Details */}
            <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Venue:</span>
                <span style={{ fontWeight: 600 }}>{venue.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Sport:</span>
                <span style={{ textTransform: 'capitalize' }}>{venue.sport}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Date:</span>
                <span style={{ fontWeight: 600 }}>{confirmedBooking.bookingDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Slot Time:</span>
                <span style={{ fontWeight: 600 }}>{confirmedBooking.timeSlot}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-slate-200)', paddingTop: '0.5rem' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Payment Method:</span>
                <span style={{ fontWeight: 700, color: 'var(--color-emerald-700)' }}>Pay at Venue (₹{confirmedBooking.price})</span>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="no-print" style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handlePrint}
                style={{ flex: 1 }}
              >
                <Printer size={16} />
                <span>Print</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  navigate('/my-bookings');
                }}
                style={{ flex: 2 }}
              >
                View My Bookings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
