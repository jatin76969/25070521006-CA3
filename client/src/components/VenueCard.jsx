import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

// Fallback high quality SVG placeholder if image fails to load
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80';

export default function VenueCard({ venue }) {
  const [imgSrc, setImgSrc] = useState(
    venue.images && venue.images.length > 0 ? venue.images[0] : FALLBACK_IMAGE
  );

  const handleImageError = () => {
    setImgSrc(FALLBACK_IMAGE);
  };

  return (
    <article className="venue-card">
      {/* Image Wrap */}
      <div className="venue-img-wrap">
        <img
          src={imgSrc}
          alt={venue.name}
          className="venue-img"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="venue-card-badges">
          <span className="badge badge-sport">
            {venue.sport}
          </span>
          {venue.isFictionalDemo && (
            <span className="badge badge-demo">
              Demo Venue
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="venue-body">
        <div className="venue-city-sport">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={13} style={{ color: 'var(--color-emerald-600)' }} />
            {venue.city}
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {venue.surfaceType ? venue.surfaceType.split(' ')[0] + ' Turf' : 'Sports Arena'}
          </span>
        </div>

        <h3 className="venue-name">{venue.name}</h3>

        <p className="venue-address">
          <span>{venue.address}</span>
        </p>

        {/* Amenities preview */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="venue-amenities">
            {venue.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="amenity-pill">
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="amenity-pill" style={{ opacity: 0.7 }}>
                +{venue.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer with Price & CTA */}
        <div className="venue-footer">
          <div className="venue-price-wrap">
            <span className="venue-price-amt">₹{venue.hourlyPrice}</span>
            <span className="venue-price-unit">per 1-hour slot</span>
          </div>

          <Link to={`/venues/${venue._id}`} className="btn btn-primary btn-sm">
            <span>View Slots</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
