import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Heart, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="nav-brand" style={{ marginBottom: '1rem' }}>
              <div className="nav-logo-icon">
                <Trophy size={18} />
              </div>
              <span>7 <span style={{ color: 'var(--color-lime-400)' }}>Sports</span></span>
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Your premier sports turf and court booking platform. Find pristine grounds, reserve real-time slots, and elevate your game across Nagpur, Pune, and Mumbai.
            </p>
            <div style={{ display: 'inline-block', backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', border: '1px solid rgba(255,255,255,0.1)' }}>
              College Engineering Project Demo
            </div>
          </div>

          {/* Sports Categories */}
          <div>
            <h4 className="footer-col-title">Sports Grounds</h4>
            <ul className="footer-links">
              <li><Link to="/explore?sport=cricket">Box Cricket Arenas</Link></li>
              <li><Link to="/explore?sport=football">Football Turfs</Link></li>
              <li><Link to="/explore?sport=badminton">Badminton Wooden Courts</Link></li>
              <li><Link to="/explore?sport=basketball">Basketball Acrylic Courts</Link></li>
            </ul>
          </div>

          {/* Supported Cities */}
          <div>
            <h4 className="footer-col-title">Available Cities</h4>
            <ul className="footer-links">
              <li><Link to="/explore?city=Nagpur"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Nagpur, MH</Link></li>
              <li><Link to="/explore?city=Pune"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Pune, MH</Link></li>
              <li><Link to="/explore?city=Mumbai"><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />Mumbai, MH</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/explore">Explore All Venues</Link></li>
              <li><Link to="/login">Player Login</Link></li>
              <li><Link to="/signup">Create Free Account</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} 7 Sports — Sports Turf & Court Booking System. Built for academic viva presentation.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Pay-at-venue guarantee <span style={{ color: 'var(--color-lime-400)' }}>•</span> Asia/Kolkata IST
          </p>
        </div>
      </div>
    </footer>
  );
}
