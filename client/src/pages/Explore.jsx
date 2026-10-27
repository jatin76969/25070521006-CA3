import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as venueApi from '../api/venues.js';
import VenueCard from '../components/VenueCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import {
  Search,
  Filter,
  MapPin,
  Trophy,
  SlidersHorizontal,
  RefreshCw,
  Info,
} from 'lucide-react';

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter values
  const [city, setCity] = useState(searchParams.get('city') || 'all');
  const [sport, setSport] = useState(searchParams.get('sport') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Fetch venues from backend API
  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {};
      if (city && city !== 'all') params.city = city;
      if (sport && sport !== 'all') params.sport = sport;
      if (search && search.trim()) params.search = search.trim();
      if (sort && sort !== 'newest') params.sort = sort;
      if (maxPrice) params.maxPrice = maxPrice;

      const data = await venueApi.getVenues(params);
      if (data.success) {
        setVenues(data.venues || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch venues from database.');
    } finally {
      setLoading(false);
    }
  }, [city, sport, search, sort, maxPrice]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // Sync URL query params
  const handleFilterChange = (newCity, newSport, newSort, newMaxPrice) => {
    const params = new URLSearchParams();
    if (newCity && newCity !== 'all') params.set('city', newCity);
    if (newSport && newSport !== 'all') params.set('sport', newSport);
    if (search.trim()) params.set('search', search.trim());
    if (newSort && newSort !== 'newest') params.set('sort', newSort);
    if (newMaxPrice) params.set('maxPrice', newMaxPrice);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setCity('all');
    setSport('all');
    setSearch('');
    setSort('newest');
    setMaxPrice('');
    setSearchParams(new URLSearchParams());
  };

  return (
    <div style={{ padding: '3rem 0 5rem' }}>
      <div className="container">
        {/* Page Title & Breadcrumb */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-demo">Academic Project Data</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
              • All venues are fictional demonstration facilities across Maharashtra
            </span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--color-navy-900)' }}>
            Explore Sports Venues
          </h1>
          <p style={{ fontSize: '1.05rem', color: 'var(--color-slate-600)', maxWidth: '680px' }}>
            Filter by city, sport category, and pricing. Click on any venue to view high-resolution photos and book available 1-hour slots.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div style={{ backgroundColor: 'var(--color-white)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)', boxShadow: 'var(--shadow-sm)', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Search Keyword
              </label>
              <div className="search-input-wrap">
                <Search size={16} style={{ color: 'var(--color-slate-400)' }} />
                <input
                  type="text"
                  placeholder="Venue name, address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                City
              </label>
              <div className="search-input-wrap">
                <MapPin size={16} style={{ color: 'var(--color-slate-400)' }} />
                <select
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    handleFilterChange(e.target.value, sport, sort, maxPrice);
                  }}
                >
                  <option value="all">All Cities</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                </select>
              </div>
            </div>

            {/* Sport Filter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Sport
              </label>
              <div className="search-input-wrap">
                <Trophy size={16} style={{ color: 'var(--color-slate-400)' }} />
                <select
                  value={sport}
                  onChange={(e) => {
                    setSport(e.target.value);
                    handleFilterChange(city, e.target.value, sort, maxPrice);
                  }}
                >
                  <option value="all">All Sports</option>
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="badminton">Badminton</option>
                  <option value="basketball">Basketball</option>
                </select>
              </div>
            </div>

            {/* Price Sorting */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-slate-500)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Sort by Price
              </label>
              <div className="search-input-wrap">
                <SlidersHorizontal size={16} style={{ color: 'var(--color-slate-400)' }} />
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    handleFilterChange(city, sport, e.target.value, maxPrice);
                  }}
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High (₹)</option>
                  <option value="price_desc">Price: High to Low (₹)</option>
                </select>
              </div>
            </div>

            {/* Reset Button */}
            <div>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetFilters}
                style={{ width: '100%', height: '44px' }}
              >
                <RefreshCw size={15} />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Venues Results Section */}
        {loading ? (
          <LoadingSpinner text="Searching available sports grounds..." />
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-slate-200)' }}>
            <p style={{ color: 'var(--color-danger-600)', marginBottom: '1rem' }}>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={fetchVenues}>
              Retry Connection
            </button>
          </div>
        ) : venues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--color-white)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-slate-200)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--color-slate-100)', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Filter size={28} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-navy-900)', marginBottom: '0.5rem' }}>
              No Venues Found Matching Your Criteria
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--color-slate-500)', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Try adjusting your city or sport filters, or clear search queries to see all available turf grounds.
            </p>
            <button className="btn btn-primary" onClick={handleResetFilters}>
              Clear All Filters
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                Showing <strong>{venues.length}</strong> available sports grounds
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)' }}>
                Prices in INR (₹) per 1-hour slot
              </span>
            </div>

            <div className="venues-grid">
              {venues.map((venue) => (
                <VenueCard key={venue._id} venue={venue} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
