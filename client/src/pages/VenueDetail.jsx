import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as venueApi from '../api/venues.js';
import { useSocket } from '../context/SocketContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import BookingModal from '../components/BookingModal.jsx';
import {
  MapPin,
  Clock,
  Trophy,
  CheckCircle,
  Calendar,
  Lock,
  ChevronLeft,
  Share2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Wifi,
} from 'lucide-react';

const FALLBACK_MAIN = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80';

export default function VenueDetail() {
  const { id } = useParams();
  const { socket, isConnected } = useSocket();
  const { addToast } = useToast();

  const [venue, setVenue] = useState(null);
  const [loadingVenue, setLoadingVenue] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Slot availability state
  const [rollingDays, setRollingDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Booking Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load venue details
  useEffect(() => {
    async function loadVenue() {
      setLoadingVenue(true);
      try {
        const data = await venueApi.getVenueById(id);
        if (data.success && data.venue) {
          setVenue(data.venue);
        }
      } catch (err) {
        addToast(err.message || 'Error loading venue.', 'error');
      } finally {
        setLoadingVenue(false);
      }
    }
    loadVenue();
  }, [id, addToast]);

  // Load slot availability for currently selected date
  const loadAvailability = useCallback(async (dateToFetch) => {
    if (!id) return;
    setLoadingSlots(true);
    try {
      const data = await venueApi.getVenueAvailability(id, dateToFetch);
      if (data.success) {
        setRollingDays(data.rollingDays || []);
        setSelectedDate(data.date);
        setSlots(data.slots || []);
        // Reset selected slot if it is no longer available
        setSelectedSlot((prev) => {
          if (!prev) return null;
          const found = data.slots.find((s) => s.timeSlot === prev.timeSlot);
          return found && found.isAvailable ? found : null;
        });
      }
    } catch (err) {
      addToast(err.message || 'Error loading availability.', 'error');
    } finally {
      setLoadingSlots(false);
    }
  }, [id, addToast]);

  // Initial slot load
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  // Real-time Socket.IO slot status updates & auto-reconnect refresh
  useEffect(() => {
    if (!socket) return;

    // 1. Listen for real-time slot update events
    const handleSlotUpdate = (data) => {
      // Check if event belongs to this venue and the currently selected date
      if (data.venueId === id && data.bookingDate === selectedDate) {
        console.log('[Socket] Real-time slot status update received:', data);

        setSlots((prevSlots) =>
          prevSlots.map((s) => {
            if (s.timeSlot === data.timeSlot) {
              const isNowBooked = data.status === 'BOOKED';
              return {
                ...s,
                isBooked: isNowBooked,
                isAvailable: !isNowBooked && !s.isPast,
              };
            }
            return s;
          })
        );

        // If the user currently had this slot selected and it was just booked by someone else
        setSelectedSlot((curr) => {
          if (curr && curr.timeSlot === data.timeSlot && data.status === 'BOOKED') {
            addToast(`Notice: The slot "${data.timeSlot}" was just reserved by another player!`, 'info');
            return null;
          }
          return curr;
        });
      }
    };

    socket.on('slot_status_changed', handleSlotUpdate);

    // 2. Re-fetch availability on reconnection
    socket.on('connect', () => {
      console.log('[Socket] Reconnected, re-fetching latest slot availability...');
      loadAvailability(selectedDate);
    });

    return () => {
      socket.off('slot_status_changed', handleSlotUpdate);
    };
  }, [socket, id, selectedDate, loadAvailability, addToast]);

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    loadAvailability(dateStr);
  };

  const handleSlotSelect = (slot) => {
    if (!slot.isAvailable) return;
    setSelectedSlot(slot);
  };

  const handleBookingComplete = (confirmedBooking) => {
    // Refresh availability
    loadAvailability(selectedDate);
  };

  if (loadingVenue) {
    return <LoadingSpinner text="Loading venue details & live slots..." size="large" />;
  }

  if (!venue) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Venue Not Found</h2>
        <p style={{ color: 'var(--color-slate-500)', margin: '1rem 0' }}>The requested sports ground could not be located.</p>
        <Link to="/explore" className="btn btn-primary">Back to Explore Venues</Link>
      </div>
    );
  }

  const galleryImages = venue.images && venue.images.length > 0 ? venue.images : [FALLBACK_MAIN];
  const activeImage = galleryImages[activeImageIndex] || galleryImages[0];

  return (
    <div className="venue-details-page">
      <div className="container">
        {/* Breadcrumb & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <Link to="/explore" className="btn btn-outline btn-sm">
            <ChevronLeft size={16} />
            <span>Back to All Venues</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isConnected ? 'var(--color-emerald-500)' : 'var(--color-slate-400)' }} />
            <span style={{ color: isConnected ? 'var(--color-emerald-700)' : 'var(--color-slate-500)', fontWeight: 500 }}>
              {isConnected ? 'Real-Time Sync Active' : 'Connecting Sync...'}
            </span>
          </div>
        </div>

        {/* Main Grid: Details & Slot Selector */}
        <div className="venue-details-grid">
          {/* Left Column: Gallery & Venue Information */}
          <div>
            {/* Gallery Main */}
            <div className="gallery-main">
              <img
                src={activeImage}
                alt={venue.name}
                onError={(e) => { e.target.src = FALLBACK_MAIN; }}
              />
            </div>

            {/* Thumbnail Carousel */}
            {galleryImages.length > 1 && (
              <div className="gallery-thumbs">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`gallery-thumb ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} onError={(e) => { e.target.src = FALLBACK_MAIN; }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Metadata */}
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <span className="badge badge-sport">{venue.sport}</span>
                <span className="badge badge-city">{venue.city}</span>
                {venue.isFictionalDemo && <span className="badge badge-demo">Fictional Demo Venue</span>}
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-navy-900)', lineHeight: '1.2' }}>
                {venue.name}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-slate-600)', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                <MapPin size={16} style={{ color: 'var(--color-emerald-600)', flexShrink: 0 }} />
                <span>{venue.address}, {venue.city}</span>
              </div>
            </div>

            {/* Surface Type & Hours Box */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', margin: '1.5rem 0' }}>
              <div style={{ backgroundColor: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>
                  Surface Type
                </span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  {venue.surfaceType || 'Certified Synthetic Turf'}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--color-white)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>
                  Operating Hours
                </span>
                <div style={{ fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
                  {String(venue.openingHour || 6).padStart(2, '0')}:00 — {String(venue.closingHour || 23).padStart(2, '0')}:00 (IST)
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="venue-meta-block">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.75rem' }}>
                About This Sports Ground
              </h3>
              <p style={{ fontSize: '0.98rem', color: 'var(--color-slate-700)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {venue.description}
              </p>

              {/* Amenities */}
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy-900)', marginTop: '1.75rem', marginBottom: '0.75rem' }}>
                Included Amenities & Facilities
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
                {venue.amenities && venue.amenities.map((amenity, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--color-slate-700)' }}>
                    <CheckCircle size={15} style={{ color: 'var(--color-emerald-600)', flexShrink: 0 }} />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: 14-Day Date Picker & Live Slot Selector */}
          <div>
            <div className="booking-summary-card">
              <div className="booking-summary-header">
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase' }}>
                  Reserve Turf Slot
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--color-emerald-700)' }}>
                    ₹{venue.hourlyPrice}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--color-slate-500)' }}>
                    / 1-hour session
                  </span>
                </div>
              </div>

              {/* 14-Day Date Scroll Picker */}
              <div className="date-picker-wrap">
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
                  1. Select Date (Rolling 14-Day Window)
                </label>
                <div className="date-picker-scroll">
                  {rollingDays.map((d) => (
                    <button
                      key={d.date}
                      type="button"
                      className={`date-tab ${d.date === selectedDate ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(d.date)}
                    >
                      <div className="date-tab-day">
                        {d.isToday ? 'Today' : d.dayName}
                      </div>
                      <div className="date-tab-num">{d.dayOfMonth}</div>
                      <div className="date-tab-month">{d.monthName}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hourly Slots Grid */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    2. Select 1-Hour Time Slot
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    Asia/Kolkata (IST)
                  </span>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', marginBottom: '0.85rem', color: 'var(--color-slate-600)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-emerald-100)', border: '1px solid var(--color-emerald-500)' }} />
                    Available
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-emerald-600)' }} />
                    Selected
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: 'var(--color-slate-200)' }} />
                    Booked / Past
                  </span>
                </div>

                {loadingSlots ? (
                  <LoadingSpinner text="Checking slot availability in MongoDB..." size="small" />
                ) : (
                  <div className="slots-grid">
                    {slots.map((slot) => {
                      const isSelected = selectedSlot?.timeSlot === slot.timeSlot;

                      let btnClass = 'slot-btn';
                      if (isSelected) btnClass += ' selected';
                      else if (slot.isBooked) btnClass += ' booked';
                      else if (slot.isPast) btnClass += ' past';

                      return (
                        <button
                          key={slot.timeSlot}
                          type="button"
                          className={btnClass}
                          disabled={!slot.isAvailable}
                          onClick={() => handleSlotSelect(slot)}
                          title={
                            slot.isBooked
                              ? 'Slot already booked'
                              : slot.isPast
                              ? 'Slot has already passed'
                              : 'Click to select this slot'
                          }
                        >
                          <span>{slot.timeSlot}</span>
                          <span className="slot-status-lbl">
                            {isSelected
                              ? '✓ Selected'
                              : slot.isBooked
                              ? 'Booked'
                              : slot.isPast
                              ? 'Past'
                              : 'Available'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              {selectedSlot ? (
                <div style={{ backgroundColor: 'var(--color-emerald-50)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-emerald-200)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-emerald-800)', marginBottom: '0.25rem' }}>
                    Selected: {selectedDate}
                  </div>
                  <div style={{ color: 'var(--color-emerald-700)' }}>
                    Slot: <strong>{selectedSlot.timeSlot}</strong> (1 Hour) • Rate: ₹{venue.hourlyPrice}
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'var(--color-slate-50)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-slate-300)', marginBottom: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
                  Click an available green slot above to proceed
                </div>
              )}

              {/* Pay at Venue Notice */}
              <div className="venue-pay-note">
                <strong>Pay at venue:</strong> Zero online payment required. Pay ₹{venue.hourlyPrice} cash or UPI directly when your team arrives.
              </div>

              {/* CTA Action */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%', height: '48px', fontSize: '1rem' }}
                disabled={!selectedSlot}
                onClick={() => setIsModalOpen(true)}
              >
                <span>Proceed to Book Slot</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Review & Confirmation Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venue={venue}
        selectedDate={selectedDate}
        selectedSlot={selectedSlot}
        onBookingSuccess={handleBookingComplete}
      />
    </div>
  );
}
