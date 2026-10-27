import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as venueApi from '../api/venues.js';
import VenueCard from '../components/VenueCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Trophy,
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Flame,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchCity, setSearchCity] = useState('');
  const [searchSport, setSearchSport] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await venueApi.getVenues();
        if (data.success && data.venues) {
          // Feature top 6 venues
          setFeaturedVenues(data.venues.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured venues:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity && searchCity !== 'all') params.append('city', searchCity);
    if (searchSport && searchSport !== 'all') params.append('sport', searchSport);
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    navigate(`/explore?${params.toString()}`);
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <div className="hero-tag">
              <Flame size={15} />
              <span>Real-Time Turf & Court Availability</span>
            </div>

            <h1 className="hero-title">
              Your Game. <br />
              <span className="hero-title-highlight">Your Ground.</span> <br />
              Your Time.
            </h1>

            <p className="hero-desc">
              Book box cricket arenas, FIFA-grade football turfs, wooden badminton courts, and acrylic basketball courts across Nagpur, Pune, and Mumbai with zero double-booking hassle.
            </p>

            <div className="hero-actions">
              <Link to="/explore" className="btn btn-primary btn-lg">
                <span>Explore Venues</span>
                <ArrowRight size={18} />
              </Link>
              <a href="#how-it-works" className="btn btn-outline-white btn-lg">
                How It Works
              </a>
            </div>

            <div className="hero-metrics">
              <div>
                <div className="hero-metric-val">100%</div>
                <div className="hero-metric-lbl">Live Slot Sync</div>
              </div>
              <div>
                <div className="hero-metric-val">₹0</div>
                <div className="hero-metric-lbl">Advance Online Fee</div>
              </div>
              <div>
                <div className="hero-metric-val">14-Day</div>
                <div className="hero-metric-lbl">Rolling Window</div>
              </div>
            </div>
          </div>

          <div className="hero-image-wrap">
            <img
              src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
              alt="Sports Turf Arena"
              className="hero-main-img"
            />
            <div className="hero-float-card">
              <div className="hero-float-icon">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-white)' }}>
                  Pay at Venue
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-400)' }}>
                  Instant spot booking confirmation
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Search & Filter Bar */}
      <div className="container">
        <div className="search-bar-wrap">
          <form className="search-bar-form" onSubmit={handleSearchSubmit}>
            <div className="search-field">
              <label htmlFor="search-input">Venue or Keyword</label>
              <div className="search-input-wrap">
                <Search size={18} style={{ color: 'var(--color-slate-400)' }} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="e.g. Orange City, Deccan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="search-field">
              <label htmlFor="city-select">City</label>
              <div className="search-input-wrap">
                <MapPin size={18} style={{ color: 'var(--color-slate-400)' }} />
                <select
                  id="city-select"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                >
                  <option value="">All Cities</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>
            </div>

            <div className="search-field">
              <label htmlFor="sport-select">Sport</label>
              <div className="search-input-wrap">
                <Trophy size={18} style={{ color: 'var(--color-slate-400)' }} />
                <select
                  id="sport-select"
                  value={searchSport}
                  onChange={(e) => setSearchSport(e.target.value)}
                >
                  <option value="">All Sports</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="badminton">Badminton</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: '48px', alignSelf: 'flex-end' }}>
              <Search size={18} />
              <span>Search Grounds</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Sport Categories */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Choose Your Passion</span>
            <h2 className="section-title">Popular Sports Categories</h2>
            <p className="section-subtitle">
              From box cricket tournaments to fast-paced badminton doubles, find certified surfaces tailored for every match.
            </p>
          </div>

          <div className="categories-grid">
            <Link to="/explore?sport=cricket" className="category-card">
              <div className="category-icon-box">
                <Trophy size={28} />
              </div>
              <h3 className="category-title">Box Cricket</h3>
              <p className="category-meta">AstroTurf & rebound nets</p>
            </Link>

            <Link to="/explore?sport=football" className="category-card">
              <div className="category-icon-box">
                <Activity size={28} />
              </div>
              <h3 className="category-title">Football</h3>
              <p className="category-meta">5v5 & 7v7 rubber-infill turf</p>
            </Link>

            <Link to="/explore?sport=badminton" className="category-card">
              <div className="category-icon-box">
                <ShieldCheck size={28} />
              </div>
              <h3 className="category-title">Badminton</h3>
              <p className="category-meta">Teak wood & vinyl mats</p>
            </Link>

            <Link to="/explore?sport=basketball" className="category-card">
              <div className="category-icon-box">
                <Flame size={28} />
              </div>
              <h3 className="category-title">Basketball</h3>
              <p className="category-meta">FIBA acrylic courts</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Venues Section */}
      <section style={{ padding: '3rem 0 5rem', backgroundColor: 'var(--color-slate-100)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Top Rated Grounds</span>
            <h2 className="section-title">Featured Sports Arenas</h2>
            <p className="section-subtitle">
              Pristine facilities loaded live from our MongoDB database with hourly rates and instant slot confirmation.
            </p>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading top venues from database..." />
          ) : featuredVenues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--color-slate-500)', marginBottom: '1rem' }}>No venues found in database.</p>
              <Link to="/explore" className="btn btn-primary btn-sm">Refresh Explore Page</Link>
            </div>
          ) : (
            <div className="venues-grid">
              {featuredVenues.map((venue) => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link to="/explore" className="btn btn-secondary btn-lg">
              <span>View All Venues Across Cities</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Seamless Booking</span>
            <h2 className="section-title">How 7 Sports Works</h2>
            <p className="section-subtitle">
              Three simple steps to secure your sports ground without endless phone calls.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon-wrap">
                <MapPin size={28} />
              </div>
              <h3 className="step-title">Select Venue & Sport</h3>
              <p className="step-desc">
                Browse certified box cricket nets, football turfs, badminton, and basketball courts across Nagpur, Pune, and Mumbai.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon-wrap">
                <Calendar size={28} />
              </div>
              <h3 className="step-title">Choose 1-Hour Slot</h3>
              <p className="step-desc">
                Pick any available date across a rolling 14-day window. Live database locks prevent conflicting double-bookings.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon-wrap">
                <CheckCircle2 size={28} />
              </div>
              <h3 className="step-title">Pay at Venue & Play</h3>
              <p className="step-desc">
                Receive an instant booking reference code. Pay cash or UPI directly at the venue counter when your team arrives.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-title">Ready for Your Next Match?</h2>
            <p className="cta-desc">
              Join local players and sports squads. Check real-time slot availability, reserve in seconds, and dominate the game.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/explore" className="btn btn-primary btn-lg">
                Book a Slot Now
              </Link>
              <Link to="/signup" className="btn btn-outline-white btn-lg">
                Create Player Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
