import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function BookingsList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [errorMsg, setErrorMsg] = useState('');

  // Dispute forms states
  const [disputeTexts, setDisputeTexts] = useState({});
  const [disputeOpen, setDisputeOpen] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAll();
      if (response.success) {
        setBookings(response.data);
        setFilteredBookings(response.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load bookings list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((b) => b.status === activeTab));
    }
  }, [activeTab, bookings]);

  // Pure Confetti Screen Explosion Helper
  const triggerConfetti = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100vw';
    container.style.height = '100vh';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '99999';
    document.body.appendChild(container);

    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#EC4899', '#8B5CF6'];

    for (let i = 0; i < 100; i++) {
      const p = document.createElement('div');
      p.style.position = 'absolute';
      p.style.width = `${Math.random() * 10 + 6}px`;
      p.style.height = `${Math.random() * 10 + 6}px`;
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `-20px`;
      p.style.borderRadius = '50%';
      p.style.opacity = Math.random();
      
      container.appendChild(p);

      const duration = Math.random() * 2 + 1.5;
      const delay = Math.random() * 0.5;
      p.style.transition = `transform ${duration}s linear ${delay}s, opacity ${duration}s linear ${delay}s`;
      
      requestAnimationFrame(() => {
        p.style.transform = `translateY(105vh) rotate(${Math.random() * 360}deg)`;
        p.style.opacity = '0';
      });
    }

    setTimeout(() => {
      container.remove();
    }, 3500);
  };

  const handleConfirmPayment = async (bookingId) => {
    try {
      // Optimistic state update
      setBookings(prevBookings =>
        prevBookings.map(b => (b._id === bookingId ? { ...b, status: 'Completed' } : b))
      );

      triggerConfetti();

      await bookingService.clientConfirm(bookingId);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to confirm payment');
      fetchBookings();
    }
  };

  const handleDisputeSubmit = async (bookingId) => {
    const reason = disputeTexts[bookingId];
    if (!reason?.trim()) {
      alert('Please enter a description of the issue');
      return;
    }

    try {
      // Optimistic state update
      setBookings(prevBookings =>
        prevBookings.map(b => (b._id === bookingId ? { ...b, status: 'Disputed' } : b))
      );
      setDisputeOpen(prev => ({ ...prev, [bookingId]: false }));

      await bookingService.clientDispute(bookingId, reason);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to dispute booking');
      fetchBookings();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', text: 'Pending' },
      confirmed: { bg: 'rgba(14, 165, 233, 0.1)', color: 'var(--secondary)', text: 'Confirmed' },
      in_progress: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', text: '● Live / In Progress' },
      'In Progress': { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--primary)', text: '● Live / In Progress' },
      completed: { bg: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)', text: 'Completed' },
      Completed: { bg: 'rgba(16, 185, 129, 0.2)', color: 'var(--primary)', text: 'Completed' },
      cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', text: 'Cancelled' },
      'Pending Confirmation': { bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', text: 'Pending Confirmation' },
      'Disputed': { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)', text: 'Disputed' },
    };

    const config = styles[status] || { bg: '#8899a6', color: '#fff', text: status };

    return (
      <span style={{
        background: config.bg,
        color: config.color,
        fontSize: '0.8rem',
        fontWeight: 'bold',
        padding: '6px 12px',
        borderRadius: '9999px',
        border: `1px solid ${config.color}20`
      }}>
        {config.text}
      </span>
    );
  };

  const tabs = [
    { id: 'all', label: 'All Bookings' },
    { id: 'pending', label: 'Requests' },
    { id: 'confirmed', label: 'Upcoming' },
    { id: 'in_progress', label: 'Live' },
    { id: 'Pending Confirmation', label: 'Pending Approval' },
    { id: 'Disputed', label: 'Disputed' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <h3>Loading your bookings...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
            {user.role === 'assistant' ? 'Assistant Jobs Dashboard' : 'My Bookings Dashboard'}
          </h1>
          <p style={{ color: 'var(--text-current-secondary)' }}>
            Track requests, check schedules, and access completed visit history.
          </p>
        </div>
        {user.role === 'client' && (
          <Link to="/explore" className="btn btn-primary">Find Assistants</Link>
        )}
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
          ⚠️ {errorMsg}
        </div>
      )}
      {/* CSS Styles injection for zoom overlay and details */}
      <style>{`
        .proof-container {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
          height: 200px;
          border: 1px solid var(--glass-current-border);
        }
        .proof-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .proof-container:hover .proof-img {
          transform: scale(1.05);
        }
        .proof-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(11, 25, 44, 0.85);
          color: #ffffff;
          opacity: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          padding: 16px;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        .proof-container:hover .proof-overlay {
          opacity: 1;
        }
      `}</style>

      {user.role === 'client' && bookings.filter(b => b.status === 'Pending Confirmation').length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#10B981', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
            ⚠️ Action Required: Pending Visit Approvals ({bookings.filter(b => b.status === 'Pending Confirmation').length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {bookings.filter(b => b.status === 'Pending Confirmation').map((b) => {
                const partnerUser = b.assistantId;
                return (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0, padding: 0 }}
                    transition={{ duration: 0.3 }}
                    className="glass-card"
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid #10B981',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 8px 30px rgba(16, 185, 129, 0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', alignItems: 'start' }}>
                      
                      {/* Left Column: Proof Image Hover Container */}
                      <div>
                        <div className="proof-container">
                          <img 
                            src={b.visitProofUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=500'} 
                            alt="Proof of Work" 
                            className="proof-img"
                          />
                          <div className="proof-overlay">
                            <span style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🛰️</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                              Uploaded at {b.visitProofTimestamp ? new Date(b.visitProofTimestamp).toLocaleTimeString() : 'N/A'}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 'bold', marginTop: '4px' }}>
                              via Geolocation-Verified Node
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Details & Confirmation Panel */}
                      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-current-muted)', fontWeight: 'bold' }}>
                              BOOKING ID: {b._id}
                            </span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '4px 10px', borderRadius: '9999px' }}>
                              Pending Confirmation
                            </span>
                          </div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#1E293B' }}>Caretaker: {partnerUser?.name}</h4>
                          
                          {/* Checklist */}
                          <div style={{ margin: '14px 0', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '10px' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B', marginBottom: '6px' }}>FINALIZED CHECKLIST</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {b.tasks.map((task, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                                  <span style={{ color: task.isCompleted ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                                    {task.isCompleted ? '✓' : '✗'}
                                  </span>
                                  <span style={{ textDecoration: task.isCompleted ? 'line-through' : 'none', color: task.isCompleted ? '#64748B' : '#1E293B' }}>
                                    {task.taskName}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div>
                          {disputeOpen[b._id] ? (
                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <textarea
                                className="form-control"
                                placeholder="Describe operational feedback or issue detail for Admin review..."
                                rows={3}
                                value={disputeTexts[b._id] || ''}
                                onChange={(e) => setDisputeTexts({ ...disputeTexts, [b._id]: e.target.value })}
                                style={{ fontSize: '0.85rem', padding: '8px' }}
                              />
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  onClick={() => handleDisputeSubmit(b._id)}
                                  style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                                >
                                  Submit Dispute & Lock Payment
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={() => setDisputeOpen({ ...disputeOpen, [b._id]: false })}
                                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                              <button
                                type="button"
                                onClick={() => handleConfirmPayment(b._id)}
                                style={{
                                  flex: 1.2,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '6px',
                                  background: '#10B981',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontWeight: 'bold',
                                  borderRadius: '8px',
                                  height: '42px',
                                  cursor: 'pointer',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                }}
                              >
                                ✓ Confirm & Release Payment
                              </button>
                              <button
                                type="button"
                                className="btn btn-danger"
                                onClick={() => setDisputeOpen({ ...disputeOpen, [b._id]: true })}
                                style={{
                                  flex: 1,
                                  background: 'transparent',
                                  border: '1px solid #EF4444',
                                  color: '#EF4444',
                                  fontWeight: '600',
                                  borderRadius: '8px',
                                  height: '42px',
                                  cursor: 'pointer'
                                }}
                              >
                                Report an Issue / Dispute
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Tabs Menu */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--glass-current-border)',
        paddingBottom: '12px',
        marginBottom: '32px',
        overflowX: 'auto'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: activeTab === tab.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-current-secondary)',
              border: activeTab === tab.id ? '1px solid var(--primary)' : '1px solid transparent',
              borderRadius: '9999px',
              padding: '8px 18px',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '500',
              whiteSpace: 'nowrap',
              transition: 'var(--transition-smooth)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: '600' }}>No bookings found in this category.</p>
          <p style={{ color: 'var(--text-current-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Coordinate and search caretakers to start bookings.
          </p>
          {user.role === 'client' && (
            <Link to="/explore" className="btn btn-secondary">Explore Assistants</Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredBookings.map((booking) => {
            const partnerUser = user.role === 'assistant' ? booking.clientId : booking.assistantId;
            const formattedStart = new Date(booking.startDate).toLocaleDateString();
            const formattedEnd = new Date(booking.endDate).toLocaleDateString();

            return (
              <div key={booking._id} className="glass-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {partnerUser?.avatar ? (
                    <img
                      src={partnerUser.avatar}
                      alt={partnerUser.name || 'User'}
                      style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--glass-current-border)', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(15, 76, 58, 0.08)',
                      border: '2px solid var(--glass-current-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      👤
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{partnerUser?.name || 'Platform Member'}</h3>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div style={{ color: 'var(--text-current-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>
                      📅 {formattedStart} - {formattedEnd}
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-current-muted)', marginTop: '4px' }}>
                      Checklist Tasks: {booking.tasks.filter(t => t.isCompleted).length} / {booking.tasks.length} Completed
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-current-muted)', fontWeight: 'bold' }}>TOTAL COST</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{booking.totalPrice}</div>
                  </div>

                  <Link to={`/booking/${booking._id}`} className="btn btn-secondary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                    Manage Booking →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
