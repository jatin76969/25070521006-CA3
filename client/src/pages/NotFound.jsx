import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{ padding: '6rem 1.5rem', textAlign: 'center', minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '520px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 900, color: 'var(--color-emerald-600)', lineHeight: 1, marginBottom: '1rem', letterSpacing: '-0.05em' }}>
          404
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '1rem' }}>
          Out of Bounds!
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-slate-600)', marginBottom: '2rem' }}>
          The page or sports turf you're looking for was moved, renamed, or doesn't exist on 7 Sports.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={16} />
            <span>Return to Home</span>
          </Link>
          <Link to="/explore" className="btn btn-outline">
            <span>Explore All Venues</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
