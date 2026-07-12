import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { user } = useAuth();
  
  // State for active service and conditional dropdowns
  const [activeService, setActiveService] = useState('Plant Watering');
  const [plantsCount, setPlantsCount] = useState('1-5 plants');
  const [petType, setPetType] = useState('Dogs');
  const [frequency, setFrequency] = useState('One-time visit');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div style={{ padding: '0 0 80px 0', minHeight: '100vh', color: 'var(--text-current-primary)' }} className="animate-fade-in-up">
      {/* Hero Section Container (Transparent layout overlaying global garden background) */}
      <header style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '100px 40px 40px 40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        alignItems: 'flex-start',
        position: 'relative'
      }}>
        
        {/* Typographic Hero Presentation */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          maxWidth: '680px',
          width: '100%'
        }} className="animate-fade-in-up">
          
          {/* Main Headline */}
          <h1 style={{
            fontSize: '3.6rem',
            fontFamily: 'var(--font-body)',
            fontWeight: '800',
            lineHeight: '1.2',
            color: 'var(--text-current-primary)',
            margin: 0
          }}>
            While You Explore the World, <br />
            <span style={{
              color: '#4E9F3D',
              backgroundImage: 'linear-gradient(to right, #4E9F3D, #34d399)',
              WebkitBackgroundClip: 'text',
              textShadow: '0 2px 8px rgba(78, 159, 61, 0.2)'
            }}>
              Your Nest Stays Alive.
            </span>
          </h1>

          {/* Sub-headline */}
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-current-secondary)',
            fontWeight: '500',
            lineHeight: '1.6',
            margin: '8px 0 16px 0'
          }}>
            Connect with geolocation-verified caretakers providing high-fidelity care 
            for your <span style={{ color: '#4E9F3D', fontWeight: '700' }}>plants</span>, <span style={{ color: '#4E9F3D', fontWeight: '700' }}>pets</span>, and <span style={{ color: '#4E9F3D', fontWeight: '700' }}>home</span>.
          </p>

          {/* Integrated CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            <Link to="/explore" className="btn btn-primary" style={{
              background: '#E25C3D',
              boxShadow: '0 4px 14px rgba(226, 92, 61, 0.4)',
              padding: '14px 32px',
              fontSize: '1.05rem',
              borderRadius: '8px',
              fontWeight: 'bold',
              color: '#ffffff'
            }}>
              Request Trusted Caretakers
            </Link>

            {user && user.role === 'client' && (
              <Link to="/bookings" className="btn btn-secondary" style={{
                padding: '14px 32px',
                fontSize: '1.05rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                color: 'var(--text-current-primary)',
                border: '1px solid var(--glass-current-border)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}>
                My Bookings
              </Link>
            )}

            {user && user.role === 'assistant' && (
              <Link to="/assistant-dashboard" className="btn btn-secondary" style={{
                padding: '14px 32px',
                fontSize: '1.05rem',
                borderRadius: '8px',
                fontWeight: 'bold',
                color: 'var(--text-current-primary)',
                border: '1px solid var(--glass-current-border)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)'
              }}>
                Assistant Dashboard
              </Link>
            )}
          </div>
        </div>

      </header>

      {/* Full-Width Highlights Section (Contrast Block) */}
      <section style={{
        width: '100%',
        background: '#0B192C', // Deep Slate-Navy contrast block
        padding: '80px 0',
        marginTop: '60px',
        boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            fontFamily: 'var(--font-display)',
            fontWeight: '800',
            color: '#FFFFFF',
            marginBottom: '48px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            Why Homeowners Choose CareNest
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              {
                id: 1,
                color: '#E76F51', // Coral Red
                title: 'GEOSPATIAL MATCHING',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E76F51" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                ),
                bullets: [
                  <>Real-time proximity engine processing</>,
                  <>Sort options by proximity, rate, and reviews</>,
                  <>Find assistants living blocks away from you</>
                ]
              },
              {
                id: 2,
                color: '#F4A261', // Amber Gold
                title: 'PHOTO VISIT PROOFS',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F4A261" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                ),
                bullets: [
                  <>100% tamper-proof EXIF metadata validation</>,
                  <>Live timestamped photos uploaded instantly</>,
                  <>Granular completion checklists during visits</>
                ]
              },
              {
                id: 3,
                color: '#2A9D8F', // Emerald Green
                title: 'VERIFIED CARETAKERS',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A9D8F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <polyline points="17 11 19 13 23 9"></polyline>
                  </svg>
                ),
                bullets: [
                  <>Safety first manual credential auditing</>,
                  <>Administrators thoroughly review profiles</>,
                  <>Strict onboarding verification before joining</>
                ]
              },
              {
                id: 4,
                color: '#4EA8DE', // Royal Blue
                title: 'INSTANT NOTIFICATIONS',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4EA8DE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22 6 12 13 2 6"></polyline>
                  </svg>
                ),
                bullets: [
                  <>Asynchronous email alerts via background queue</>,
                  <>Real-time booking confirmations & alerts</>,
                  <>Instant complete visit status updates</>
                ]
              }
            ].map((card) => {
              return (
                <div
                  key={card.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    boxShadow: '0 12px 24px -10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '12px',
                    background: `${card.color}0a`
                  }}>
                    {card.icon}
                  </div>
                  
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: '#1E293B',
                    letterSpacing: '0.03em',
                    margin: 0
                  }}>
                    {card.title}
                  </h3>

                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {card.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                        fontSize: '0.88rem',
                        lineHeight: '1.4',
                        color: '#475569'
                      }}>
                        <span style={{ color: card.color, fontSize: '1.1rem', lineHeight: '1' }}>•</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '80px auto 0 auto',
        padding: '0 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '16px', color: '#0F4C3A' }}>How CareNest Works</h2>
        <p style={{ color: '#475569', maxWidth: '600px', margin: '0 auto 48px auto', fontSize: '1.05rem', lineHeight: '1.6' }}>
          Keep your home occupied, your mail retrieved, and your plants healthy with three simple steps.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{
              background: '#0F4C3A',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>1</div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#0F4C3A' }}>Search & Filter</h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Enter your location, set your price preference, and filter assistants by needed services (plant watering, pet feeding, mail pick up).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{
              background: '#0F4C3A',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>2</div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#0F4C3A' }}>Book & Schedule</h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Select dates, select custom checklist items, and submit a booking request. Funds and dates are locked securely.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{
              background: '#0F4C3A',
              color: '#ffffff',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>3</div>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#0F4C3A' }}>Track & Review</h3>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Track visits through live checklist updates and uploaded photos. Provide a rating and review after completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic deeply interactive modals */}
      <AnimatePresence>
        {activeModal !== null && (
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
              onClick={() => setActiveModal(null)}
            >
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '640px',
                  background: 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(15, 76, 58, 0.1)',
                  padding: '40px 32px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  color: '#1E293B'
                }}
              >
                {/* Close X Button */}
                <button
                  onClick={() => setActiveModal(null)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    border: 'none',
                    background: 'none',
                    fontSize: '1.25rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    transition: 'color 0.2s',
                    padding: '8px',
                    zIndex: 5
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = '#64748b'}
                >
                  ✕
                </button>

                {activeModal === 0 && <RadarSimulator />}
                {activeModal === 1 && <ProofSimulator />}
                {activeModal === 2 && <SecuritySimulator />}
                {activeModal === 3 && <EventLoopSimulator />}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes radar-pulse {
          0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2.4); opacity: 0; }
        }
        .radar-ripple {
          animation: radar-pulse 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        @keyframes cursor-blink {
          50% { opacity: 0; }
        }
        .cursor-blink {
          animation: cursor-blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
}

// 1. Radar Simulator Component
function RadarSimulator() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setDots(prev => [...prev, { name: 'Aarav Sharma', dist: '1.2 km', rate: '$15/hr', x: 70, y: 35, avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' }]);
    }, 600);
    const t2 = setTimeout(() => {
      setDots(prev => [...prev, { name: 'Ananya Rao', dist: '1.8 km', rate: '$18/hr', x: 25, y: 60, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' }]);
    }, 1300);
    const t3 = setTimeout(() => {
      setDots(prev => [...prev, { name: 'Arjun Verma', dist: '2.3 km', rate: '$16/hr', x: 60, y: 75, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }]);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
      <h3 style={{ color: '#0F4C3A', margin: 0, fontSize: '1.25rem' }}>MongoDB Proximity Search Simulator</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: 0, lineHeight: '1.4' }}>
        Visualizing <code>$geoNear</code> aggregation pipeline scanning from search coordinates: <br />
        <span style={{ color: '#E25C3D', fontWeight: 'bold' }}>Vijayawada, India [16.4920° N, 80.4982° E]</span>
      </p>

      {/* Radar Map Frame */}
      <div style={{
        position: 'relative',
        width: '260px',
        height: '260px',
        borderRadius: '50%',
        background: '#0b1622',
        border: '3px solid #0F4C3A',
        boxShadow: '0 0 20px rgba(15, 76, 58, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Radar concentric circles */}
        <div style={{ position: 'absolute', top: '25%', left: '25%', width: '50%', height: '50%', border: '1px dashed rgba(78, 159, 61, 0.2)', borderRadius: '50%' }}></div>
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', border: '1px dashed rgba(78, 159, 61, 0.2)', borderRadius: '50%' }}></div>
        
        {/* Radar crosshairs */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'rgba(78, 159, 61, 0.15)' }}></div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: '1px', background: 'rgba(78, 159, 61, 0.15)' }}></div>

        {/* Scanning sweep line */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '50%',
          height: '2px',
          background: 'linear-gradient(90deg, #4E9F3D, transparent)',
          transformOrigin: 'left center',
          animation: 'radar-sweep 4s linear infinite',
          zIndex: 1
        }}></div>

        {/* Pulsing Dots */}
        {dots.map((dot, idx) => (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              transform: 'translate(-50%, -50%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Pulsing expand circle */}
            <div className="radar-ripple" style={{ position: 'absolute', width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(42, 157, 143, 0.4)' }}></div>
            
            {/* Avatar thumbnail */}
            <img 
              src={dot.avatar} 
              alt={dot.name} 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #2A9D8F', position: 'relative', zIndex: 4 }}
            />
            {/* Detail tag */}
            <div style={{
              background: '#FFFFFF',
              color: '#1E293B',
              fontSize: '0.62rem',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              marginTop: '4px',
              position: 'relative',
              zIndex: 5
            }}>
              {dot.name} ({dot.dist})
            </div>
          </div>
        ))}
        
        {/* Center search marker */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: '#E76F51',
          boxShadow: '0 0 10px #E76F51',
          zIndex: 5
        }}></div>
      </div>
    </div>
  );
}

// 2. Photo Visit Proofs Component
function ProofSimulator() {
  const jsonObject = {
    status: "VERIFIED",
    timestamp: "2026-07-09T15:23:00Z",
    gps_match: true,
    storage_node: "Cloudinary_Secure_Bucket"
  };

  const jsonString = JSON.stringify(jsonObject, null, 2);
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(prev => prev + jsonString[index]);
      index++;
      if (index >= jsonString.length - 1) {
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <h3 style={{ color: '#0F4C3A', textAlign: 'center', marginBottom: '16px', fontSize: '1.25rem' }}>Photo Verification Log Console</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '20px', alignItems: 'center' }}>
        
        {/* Left Side: Proof image */}
        <div style={{
          height: '220px',
          borderRadius: '12px',
          backgroundImage: "url('https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          border: '1px solid rgba(0,0,0,0.05)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(78, 159, 61, 0.95)',
            color: '#FFFFFF',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            ✓ GEO-MATCHED PROOF IMAGE
          </div>
        </div>

        {/* Right Side: Typewriter JSON */}
        <div style={{
          background: '#0d1520',
          borderRadius: '12px',
          padding: '16px',
          height: '220px',
          boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <pre style={{
            margin: 0,
            fontSize: '0.8rem',
            color: '#34d399',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            lineHeight: '1.4'
          }}>
            {typedText}
            <span className="cursor-blink">|</span>
          </pre>
        </div>
      </div>
    </div>
  );
}

// 3. Verified Caretakers Background Check Monitor
function SecuritySimulator() {
  const [p1, setP1] = useState(0);
  const [p2, setP2] = useState(0);
  const [p3, setP3] = useState(0);

  useEffect(() => {
    const timer1 = setInterval(() => {
      setP1(prev => {
        if (prev >= 100) {
          clearInterval(timer1);
          return 100;
        }
        return prev + 4;
      });
    }, 15);
    return () => clearInterval(timer1);
  }, []);

  useEffect(() => {
    if (p1 < 100) return;
    const timer2 = setInterval(() => {
      setP2(prev => {
        if (prev >= 100) {
          clearInterval(timer2);
          return 100;
        }
        return prev + 4;
      });
    }, 15);
    return () => clearInterval(timer2);
  }, [p1]);

  useEffect(() => {
    if (p2 < 100) return;
    const timer3 = setInterval(() => {
      setP3(prev => {
        if (prev >= 100) {
          clearInterval(timer3);
          return 100;
        }
        return prev + 4;
      });
    }, 15);
    return () => clearInterval(timer3);
  }, [p2]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      <h3 style={{ color: '#0F4C3A', textAlign: 'center', margin: 0, fontSize: '1.25rem' }}>Caretaker Trust Verification Pipeline</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', margin: 0 }}>
        Simulating credential background reviews in the CareNest administration module:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
        {/* Progress Item 1 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            <span>Identity/ID Verification Complete</span>
            <span style={{ color: '#2A9D8F' }}>{p1}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${p1}%`, height: '100%', background: '#2A9D8F', borderRadius: '4px' }}></div>
          </div>
        </div>

        {/* Progress Item 2 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            <span>Background/Criminal Database Scan Clear</span>
            <span style={{ color: '#2A9D8F' }}>{p2}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${p2}%`, height: '100%', background: '#2A9D8F', borderRadius: '4px' }}></div>
          </div>
        </div>

        {/* Progress Item 3 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 'bold', color: '#475569', marginBottom: '6px' }}>
            <span>Practical Home Care Training Certified</span>
            <span style={{ color: '#2A9D8F' }}>{p3}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${p3}%`, height: '100%', background: '#2A9D8F', borderRadius: '4px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. Real-Time Event Loop & Notification Simulator
function EventLoopSimulator() {
  const [simStep, setSimStep] = useState('idle'); // idle, queue, processing, completed
  const [showAlert, setShowAlert] = useState(false);

  const startSimulation = () => {
    setSimStep('queue');
    setShowAlert(false);
    
    setTimeout(() => {
      setSimStep('processing');
    }, 1000);

    setTimeout(() => {
      setSimStep('completed');
      setShowAlert(true);
    }, 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', position: 'relative' }}>
      <h3 style={{ color: '#0F4C3A', margin: 0, fontSize: '1.25rem' }}>BullMQ Queue Event Loop Simulator</h3>
      
      {/* Event Stream Canvas */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        background: '#0d1520',
        padding: '28px 20px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative',
        minHeight: '120px'
      }}>
        {/* Node 1: Client App */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{ background: '#E25C3D', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.2rem' }}>👤</div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'bold' }}>Client App</span>
        </div>

        {/* Vector Line */}
        <div style={{ position: 'absolute', left: '40px', right: '40px', height: '2px', borderTop: '2px dashed rgba(255,255,255,0.1)', top: '48px', zIndex: 1 }}></div>

        {/* Animated Job card in motion */}
        {simStep === 'queue' && (
          <motion.div
            initial={{ left: '45px' }}
            animate={{ left: '260px' }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              background: '#E76F51',
              color: '#fff',
              fontSize: '0.68rem',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              top: '32px',
              zIndex: 3
            }}
          >
            📦 Job #2851
          </motion.div>
        )}

        {/* Node 2: BullMQ Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{
            background: simStep === 'processing' ? '#4EA8DE' : '#141c24',
            border: '2px solid #4EA8DE',
            width: '45px',
            height: '45px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.2rem',
            transition: 'background 0.3s'
          }}>
            ⚙️
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'bold' }}>BullMQ Queue</span>
        </div>

        {/* Vector Line */}
        <div style={{ position: 'absolute', left: '260px', right: '40px', height: '2px', borderTop: '2px dashed rgba(255,255,255,0.1)', top: '48px', zIndex: 1 }}></div>

        {/* Processed job card in motion */}
        {simStep === 'processing' && (
          <motion.div
            initial={{ left: '280px', opacity: 1 }}
            animate={{ left: '480px', opacity: 0.2 }}
            transition={{ duration: 1.1, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              background: '#4EA8DE',
              color: '#fff',
              fontSize: '0.68rem',
              padding: '6px 12px',
              borderRadius: '6px',
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
              top: '32px',
              zIndex: 3
            }}
          >
            ✉️ Sending Alert
          </motion.div>
        )}

        {/* Node 3: Recipient Client */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}>
          <div style={{ background: simStep === 'completed' ? '#2A9D8F' : '#141c24', border: '2px solid #2A9D8F', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', transition: 'background 0.3s' }}>
            📬
          </div>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 'bold' }}>Recipient</span>
        </div>
      </div>

      <button
        onClick={startSimulation}
        className="btn btn-primary"
        style={{ padding: '12px 28px', fontSize: '0.9rem', width: '100%', background: '#E25C3D' }}
        disabled={simStep === 'queue' || simStep === 'processing'}
      >
        {simStep === 'queue' || simStep === 'processing' ? 'Processing Job...' : 'Simulate Task Completion Notification'}
      </button>

      {/* Floating email alert banner mockup */}
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ type: 'spring', damping: 15 }}
            style={{
              position: 'absolute',
              top: '-10px',
              right: '10px',
              background: 'rgba(255,255,255,0.95)',
              border: '2px solid #4EA8DE',
              borderRadius: '10px',
              padding: '12px 20px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 10,
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ fontSize: '1.5rem' }}>📧</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#264653' }}>CareNest Alert</div>
              <div style={{ fontSize: '0.72rem', color: '#475569' }}>CareNest Alert: Plant Watering Completed Safely!</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
