import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { assistantService } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

// Fix leaflet default marker icon path issue in Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom Green Plant icon for assistants on map
const assistantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to center leaflet map dynamically when coords change
function ChangeMapCenter({ center }) {
  const map = useMap();
  map.setView(center, 12);
  return null;
}

export default function Explore() {
  // Center defaults to Austin, TX (where seed data is located)
  // Form Inputs (Not automatically triggering search)
  const [latitude, setLatitude] = useState(16.4920);
  const [longitude, setLongitude] = useState(80.4982);
  const [selectedCityName, setSelectedCityName] = useState('Vijayawada / Guntur');
  const [maxDistance, setMaxDistance] = useState(15);
  const [minRating, setMinRating] = useState('');
  const [selectedService, setSelectedService] = useState('');

  // Active Query States (triggers backend search or client filter)
  const [activeLatitude, setActiveLatitude] = useState(16.4920);
  const [activeLongitude, setActiveLongitude] = useState(80.4982);
  const [activeRadius, setActiveRadius] = useState(15);
  const [activeMinRating, setActiveMinRating] = useState('');
  const [activeService, setActiveService] = useState('');

  const [allAssistants, setAllAssistants] = useState([]);
  const [filteredAssistants, setFilteredAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Geolocation detection options
  const [isLocating, setIsLocating] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Fetch from database ONLY when active coordinates or active radius changes
  useEffect(() => {
    fetchAssistants();
  }, [activeLatitude, activeLongitude, activeRadius]);

  // Client-side filtering engine based on active filters
  useEffect(() => {
    let filtered = [...allAssistants];

    // Service Filter
    if (activeService && activeService !== '') {
      filtered = filtered.filter(ast => ast.services.includes(activeService));
    }

    // Minimum Rating Filter
    if (activeMinRating && activeMinRating !== '') {
      const numericRating = parseFloat(activeMinRating);
      filtered = filtered.filter(ast => ast.averageRating >= numericRating);
    }

    setFilteredAssistants(filtered);
  }, [activeService, activeMinRating, allAssistants]);

  const fetchAssistants = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {
        latitude: activeLatitude,
        longitude: activeLongitude,
        maxDistance: activeRadius,
      };
      const response = await assistantService.search(filters);
      if (response.success) {
        setAllAssistants(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to search assistants');
    } finally {
      setLoading(false);
    }
  };

  // Explicit Search trigger button click
  const handleFind = () => {
    setActiveLatitude(latitude);
    setActiveLongitude(longitude);
    setActiveRadius(maxDistance);
    setActiveMinRating(minRating);
    setActiveService(selectedService);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setSelectedCityName('My Location');
        setIsLocating(false);
      },
      (err) => {
        console.error('Error finding location:', err);
        setError('Unable to fetch your location.');
        setIsLocating(false);
      }
    );
  };

  const serviceOptions = ['Plant Watering', 'Mail Retrieval', 'Pet Feeding', 'Pet Care', 'Gardening'];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1400px', margin: '0 auto' }} className="animate-fade-in-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Find Nearby Assistants</h1>
        <p style={{ color: 'var(--text-current-secondary)' }}>
          Enter search parameters to match with verified plant care and home help experts blocks away.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-card" style={{
        padding: '20px',
        marginBottom: '32px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: '2 1 320px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>
            Location: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>📍 {selectedCityName} ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
          </label>
          <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              style={{
                flex: 1,
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                padding: '0 12px',
                border: '2px solid var(--primary)',
                borderColor: isLocating ? 'var(--glass-current-border)' : 'var(--primary)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
              </svg>
              <span>{isLocating ? 'Locating...' : 'Use My Location'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCityModal(true)}
              style={{
                flex: 1,
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                padding: '0 12px',
                background: 'transparent',
                border: '1px solid var(--glass-current-border)'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Select Other City</span>
            </button>
          </div>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <label htmlFor="radius" style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>RADIUS (KM)</label>
          <select 
            id="radius" 
            className="form-control" 
            value={maxDistance} 
            onChange={(e) => setMaxDistance(Number(e.target.value))}
            style={{ height: '45px' }}
          >
            <option value={2}>2 km</option>
            <option value={5}>5 km</option>
            <option value={10}>10 km</option>
            <option value={15}>15 km</option>
            <option value={30}>30 km</option>
            <option value={50}>50 km</option>
          </select>
        </div>

        <div style={{ flex: '1 1 160px' }}>
          <label htmlFor="service" style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>SERVICE NEEDED</label>
          <select 
            id="service" 
            className="form-control" 
            value={selectedService} 
            onChange={(e) => setSelectedService(e.target.value)}
            style={{ height: '45px' }}
          >
            <option value="">All Services</option>
            {serviceOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <label htmlFor="minRating" style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>MIN RATING</label>
          <select 
            id="minRating" 
            className="form-control" 
            value={minRating} 
            onChange={(e) => setMinRating(e.target.value)}
            style={{ height: '45px' }}
          >
            <option value="">Any Rating</option>
            <option value="4.0">4.0+ ★</option>
            <option value="4.5">4.5+ ★</option>
            <option value="4.8">4.8+ ★</option>
          </select>
        </div>

        <div style={{ flex: '1 1 140px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleFind}
            style={{
              height: '45px',
              width: '100%',
              background: '#0F4C3A',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '0.92rem',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(15, 76, 58, 0.2)'
            }}
          >
            🔍 Find Assistants
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Splitscreen Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) 1.2fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Side: List of results */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Results ({filteredAssistants.length})
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2rem' }}>⏳</div>
              <p style={{ color: 'var(--text-current-secondary)' }}>Searching nearby assistants...</p>
            </div>
          ) : filteredAssistants.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Empty Plant Pot */}
                <path d="M40 85 L45 105 A 2 2 0 0 0 47 107 L73 107 A 2 2 0 0 0 75 105 L80 85 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2.5" />
                <rect x="36" y="75" width="48" height="10" rx="2" fill="#E2E8F0" stroke="#475569" strokeWidth="2.5" />
                <ellipse cx="60" cy="80" rx="20" ry="3" fill="#8d745e" />
                
                {/* Magnifying Glass */}
                <circle cx="75" cy="50" r="16" fill="rgba(255,255,255,0.75)" stroke="#2A9D8F" strokeWidth="3" />
                <line x1="86" y1="61" x2="98" y2="73" stroke="#2A9D8F" strokeWidth="3" strokeLinecap="round" />
              </svg>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-current-primary)' }}>
                No Assistants Found in This Location
              </h3>
              
              <p style={{ color: 'var(--text-current-secondary)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto', lineHeight: '1.5' }}>
                We don't have active caretakers within this radius yet. Try expanding your search radius filter or select a different city above.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setMaxDistance(50)}
                style={{ marginTop: '8px', padding: '10px 24px', fontSize: '0.88rem' }}
              >
                Expand Radius to 50km
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredAssistants.map((assistant) => (
                <div key={assistant.userId} className="glass-card" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
                  {assistant.avatar ? (
                    <img 
                      src={assistant.avatar} 
                      alt={assistant.name}
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(15, 76, 58, 0.08)',
                      border: '2px solid var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      👤
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{assistant.name}</h3>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', margin: '4px 0 12px 0', color: 'var(--text-current-secondary)' }}>
                      <span>⭐ {assistant.averageRating > 0 ? `${assistant.averageRating} (${assistant.totalReviews})` : 'New Assistant'}</span>
                      {assistant.distance !== null && <span>📍 {assistant.distance} km away</span>}
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-current-secondary)', margin: '0 0 16px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxVertical: 'vertical', overflow: 'hidden' }}>
                      {assistant.bio || 'Verified FloraAssist member ready to look after your house and plants.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Service Badges */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {assistant.services.slice(0, 2).map((s) => (
                          <span key={s} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-current-border)', padding: '4px 10px', borderRadius: '9999px', color: 'var(--text-current-secondary)' }}>
                            {s}
                          </span>
                        ))}
                        {assistant.services.length > 2 && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                            +{assistant.services.length - 2} more
                          </span>
                        )}
                      </div>

                      <Link to={`/assistant/${assistant.userId}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Map */}
        <div style={{ position: 'sticky', top: '100px', height: '650px', zIndex: 10 }}>
          <MapContainer 
            center={[activeLatitude, activeLongitude]} 
            zoom={12} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Center marker of search */}
            <Marker position={[activeLatitude, activeLongitude]}>
              <Popup>
                <strong>Your Search Location</strong>
              </Popup>
            </Marker>

            {/* Assistant markers */}
            {filteredAssistants.map((ast) => {
              if (ast.location && ast.location.coordinates) {
                const [lng, lat] = ast.location.coordinates;
                return (
                  <Marker key={ast.userId} position={[lat, lng]} icon={assistantIcon}>
                    <Popup>
                      <div style={{ textAlign: 'center', fontFamily: 'var(--font-body)' }}>
                        {ast.avatar ? (
                          <img 
                            src={ast.avatar} 
                            alt={ast.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(15, 76, 58, 0.08)',
                            border: '1px solid var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            margin: '0 auto 8px auto'
                          }}>
                            👤
                          </div>
                        )}
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem' }}>{ast.name}</h4>

                        <div style={{ fontSize: '0.75rem', color: '#8899a6', marginBottom: '8px' }}>
                          ⭐ {ast.averageRating > 0 ? ast.averageRating : 'New'} ({ast.totalReviews})
                        </div>
                        <Link to={`/assistant/${ast.userId}`} style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          View Details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}

            {/* Dynamically center map */}
            <ChangeMapCenter center={[activeLatitude, activeLongitude]} />
          </MapContainer>
        </div>
      </div>

      {/* City Selector Modal */}
      <AnimatePresence>
        {showCityModal && (
          <div style={{ position: 'relative', zIndex: 9999 }}>
            {/* Backdrop Mask */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(11, 15, 21, 0.65)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 10000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
              }}
              onClick={() => setShowCityModal(false)}
            >
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(15, 76, 58, 0.1)',
                  padding: '36px 32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  color: '#1E293B',
                  textAlign: 'center'
                }}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowCityModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    padding: '8px'
                  }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F4C3A', marginBottom: '8px' }}>
                  Select Search City
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '24px' }}>
                  Choose a major metropolitan area to match with local verified caretakers
                </p>

                {/* Grid of Cities */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '16px'
                }}>
                  {[
                    {
                      name: 'Vijayawada',
                      lat: 16.4920,
                      lng: 80.4982,
                      monument: 'Prakasam Barrage',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12h18"></path>
                          <path d="M12 2v20"></path>
                          <path d="M8 12c0-4 4-8 4-8s4 4 4 8"></path>
                          <path d="M8 12c0 4 4 8 4 8s4-4 4-8"></path>
                        </svg>
                      )
                    },
                    {
                      name: 'Hyderabad',
                      lat: 17.3850,
                      lng: 78.4867,
                      monument: 'Charminar',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="4" y="14" width="16" height="6" rx="1"></rect>
                          <path d="M6 14V4h2v10"></path>
                          <path d="M16 14V4h2v10"></path>
                          <path d="M10 14v-4h4v4"></path>
                          <path d="M12 4v4"></path>
                        </svg>
                      )
                    },
                    {
                      name: 'Bangalore',
                      lat: 12.9716,
                      lng: 77.5946,
                      monument: 'Vidhana Soudha',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 20h20"></path>
                          <path d="M6 20v-8h12v8"></path>
                          <path d="M12 12V4"></path>
                          <circle cx="12" cy="4" r="2"></circle>
                          <path d="M9 12V8h6v4"></path>
                        </svg>
                      )
                    },
                    {
                      name: 'Mumbai',
                      lat: 18.9220,
                      lng: 72.8347,
                      monument: 'Gateway of India',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20h16"></path>
                          <path d="M6 20V8h12v12"></path>
                          <path d="M9 8c0-3 6-3 6 0"></path>
                          <path d="M8 20v-8h8v8"></path>
                        </svg>
                      )
                    },
                    {
                      name: 'Delhi',
                      lat: 28.6139,
                      lng: 77.2090,
                      monument: 'India Gate',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 20h16"></path>
                          <path d="M5 20V6h14v14"></path>
                          <path d="M8 6V3h8v3"></path>
                          <path d="M8 20v-10h8v10"></path>
                        </svg>
                      )
                    },
                    {
                      name: 'Chennai',
                      lat: 13.0827,
                      lng: 80.2707,
                      monument: 'Ripon Building',
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 20h18"></path>
                          <rect x="5" y="10" width="14" height="10" rx="1"></rect>
                          <path d="M12 10V4"></path>
                          <rect x="10" y="4" width="4" height="3" rx="1"></rect>
                        </svg>
                      )
                    }
                  ].map((city) => {
                    const isSelected = Math.abs(latitude - city.lat) < 0.001 && Math.abs(longitude - city.lng) < 0.001;
                    return (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => {
                          setLatitude(city.lat);
                          setLongitude(city.lng);
                          setSelectedCityName(city.name);
                          setShowCityModal(false);
                        }}
                        style={{
                          background: isSelected ? 'rgba(15, 76, 58, 0.08)' : '#FFFFFF',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid rgba(0,0,0,0.08)',
                          borderRadius: '12px',
                          padding: '16px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          color: '#1E293B'
                        }}
                      >
                        <div style={{ color: isSelected ? 'var(--primary)' : '#64748b' }}>
                          {city.icon}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{city.name}</span>
                          <span style={{ fontSize: '0.65rem', color: '#8899a6' }}>{city.monument}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
