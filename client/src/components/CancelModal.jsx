import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function CancelModal({ isOpen, onClose, onConfirm, booking }) {
  const [reason, setReason] = useState('Change of schedule');
  const [cancelling, setCancelling] = useState(false);

  if (!isOpen || !booking) return null;

  const handleConfirm = async () => {
    setCancelling(true);
    try {
      await onConfirm(booking._id, reason);
    } finally {
      setCancelling(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
      <div className="modal-card">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
          &times;
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'var(--color-danger-50)', color: 'var(--color-danger-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <AlertCircle size={28} />
          </div>
          <h3 id="cancel-title" style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-900)' }}>
            Cancel Booking Reservation?
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', marginTop: '0.5rem' }}>
            Are you sure you want to cancel your slot at <strong>{booking.venueSnapshot?.name || 'this venue'}</strong> on <strong>{booking.bookingDate}</strong> at <strong>{booking.timeSlot}</strong>?
          </p>
        </div>

        <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-200)', marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '0.4rem' }}>
            Reason for cancellation (optional):
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-300)', backgroundColor: 'var(--color-white)' }}
          >
            <option value="Change of schedule">Change of schedule</option>
            <option value="Unfavorable weather">Unfavorable weather</option>
            <option value="Team members unavailable">Team members unavailable</option>
            <option value="Booked wrong date/time by mistake">Booked wrong date/time by mistake</option>
            <option value="Other reason">Other reason</option>
          </select>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', marginTop: '0.5rem' }}>
            Note: Once cancelled, the slot will be immediately released and made available for other players to reserve.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            style={{ flex: 1 }}
            disabled={cancelling}
          >
            Keep Booking
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={handleConfirm}
            style={{ flex: 1 }}
            disabled={cancelling}
          >
            {cancelling ? 'Releasing Slot...' : 'Yes, Cancel Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
