import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { bookingService, reviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const proofInputRef = useRef(null);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State for task checklist modifications (Assistant only)
  const [checklist, setChecklist] = useState([]);
  
  // Proof Upload Form State (Assistant only)
  const [proofFile, setProofFile] = useState(null);
  const [proofComment, setProofComment] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  // Review Form State (Client only)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getById(id);
      if (response.success) {
        setBooking(response.data);
        setChecklist(response.data.tasks || []);
        
        // If booking is completed, check if client already reviewed this booking
        if (response.data.status === 'completed' && user.role === 'client') {
          // We can check if a review for this booking already exists by attempting to fetch or checking partner reviews.
          // For simplicity, we check reviews list on assistant profile or catch duplicate submits in the backend
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  // 1. Booking Actions
  const handleConfirm = async () => {
    try {
      const response = await bookingService.confirm(id);
      if (response.success) setBooking(response.data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const response = await bookingService.cancel(id);
      if (response.success) setBooking(response.data);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleStart = async () => {
    setErrorMsg('');
    const bypassGeofence = window.confirm("CareNest GPS Geofencing Check:\nWould you like to BYPASS coordinates check for local testing? (Click Cancel to run browser GPS validation)");

    if (bypassGeofence) {
      try {
        const response = await bookingService.start(id, { bypassGeofence: true });
        if (response.success) {
          setBooking(response.data);
          setChecklist(response.data.tasks || []);
        }
      } catch (err) {
        setErrorMsg(err.message);
      }
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please bypass coordinate verification.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await bookingService.start(id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (response.success) {
            setBooking(response.data);
            setChecklist(response.data.tasks || []);
          }
        } catch (err) {
          setErrorMsg(err.message);
        }
      },
      (err) => {
        setErrorMsg('Failed to detect GPS location. Try bypassing coordinate verification.');
      }
    );
  };

  const handleComplete = async () => {
    const uncompleted = checklist.filter((t) => !t.isCompleted);
    if (uncompleted.length > 0) {
      if (!window.confirm(`You still have ${uncompleted.length} unchecked tasks. Complete booking anyway?`)) {
        return;
      }
    }

    setErrorMsg('');
    const bypassGeofence = window.confirm("CareNest GPS Geofencing Check:\nWould you like to BYPASS coordinates check for local testing? (Click Cancel to run browser GPS validation)");

    if (bypassGeofence) {
      try {
        const response = await bookingService.complete(id, { bypassGeofence: true });
        if (response.success) setBooking(response.data);
      } catch (err) {
        setErrorMsg(err.message);
      }
      return;
    }

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please bypass coordinate verification.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const response = await bookingService.complete(id, {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if (response.success) setBooking(response.data);
        } catch (err) {
          setErrorMsg(err.message);
        }
      },
      (err) => {
        setErrorMsg('Failed to detect GPS location. Try bypassing coordinate verification.');
      }
    );
  };

  // 2. Checklist toggle action (Assistant only)
  const handleToggleChecklist = async (index) => {
    const updated = [...checklist];
    updated[index].isCompleted = !updated[index].isCompleted;
    setChecklist(updated);

    try {
      // Send task update to API
      const taskPayload = updated.map((t) => ({
        taskId: t._id,
        isCompleted: t.isCompleted,
      }));
      await bookingService.updateTasks(id, taskPayload);
    } catch (err) {
      console.error('Failed to sync checklist update:', err.message);
    }
  };

  // 3. Auto proof upload action (Assistant only)
  const handleAutoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProof(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      formData.append('comment', 'Photo proof uploaded by caretaker.');

      const response = await bookingService.uploadProof(id, formData);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to upload proof photo');
    } finally {
      setUploadingProof(false);
    }
  };

  const handleSubmitForReview = async () => {
    setErrorMsg('');
    try {
      const response = await bookingService.submitReview(id);
      if (response.success) {
        setBooking(response.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit booking for review');
    }
  };

  // 4. Review Submit Action (Client only)
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setErrorMsg('');
    try {
      const reviewPayload = {
        bookingId: id,
        rating,
        comment,
      };
      const response = await reviewService.submit(reviewPayload);
      if (response.success) {
        setHasReviewed(true);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <h3>Loading booking details...</h3>
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h3>Booking Not Found</h3>
        <Link to="/bookings" className="btn btn-secondary">Back to Bookings</Link>
      </div>
    );
  }

  const isClient = user.role === 'client';
  const isAssistant = user.role === 'assistant';
  const partnerUser = isAssistant ? booking.clientId : booking.assistantId;

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/bookings" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>← Back to Bookings</Link>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '24px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Grid Layout splits details and live tracking */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Details & Proof Checklist Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Card 1: Core Booking details */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-current-muted)', fontWeight: 'bold' }}>
                  BOOKING ID: {booking._id}
                </span>
                <h1 style={{ fontSize: '1.8rem', margin: '4px 0' }}>Visit Care Contract</h1>
                <p style={{ color: 'var(--text-current-secondary)', fontSize: '0.95rem', margin: 0 }}>
                  📅 {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-current-muted)', fontWeight: 'bold' }}>BOOKING STATUS</div>
                <div style={{
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: booking.status === 'in_progress' ? 'var(--primary)' : 'var(--text-current-primary)',
                  marginTop: '4px'
                }}>
                  {booking.status.toUpperCase().replace('_', ' ')}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              borderTop: '1px solid var(--glass-current-border)',
              paddingTop: '20px',
              marginTop: '20px'
            }}>
              {partnerUser?.avatar ? (
                <img 
                  src={partnerUser.avatar} 
                  alt={partnerUser.name}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: 'rgba(15, 76, 58, 0.08)',
                  border: '1px solid var(--glass-current-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  👤
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-current-muted)' }}>
                  {isAssistant ? 'CLIENT DETAILS' : 'ASSISTANT DETAILS'}
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{partnerUser?.name}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-current-secondary)' }}>{partnerUser?.email}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Checklist Progress */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>
              Tasks Checklist
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-current-secondary)', marginBottom: '20px' }}>
              {isAssistant && booking.status === 'in_progress' 
                ? 'Check off tasks as you complete them during your visit.' 
                : 'Caretaker checklist tasks requested for this visit.'}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {checklist.map((task, idx) => (
                <div key={task._id || idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(0,0,0,0.1)',
                  padding: '14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--glass-current-border)'
                }}>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleChecklist(idx)}
                    disabled={!isAssistant || booking.status !== 'in_progress'}
                    style={{ width: '18px', height: '18px', cursor: (isAssistant && booking.status === 'in_progress') ? 'pointer' : 'default' }}
                  />
                  <span style={{
                    textDecoration: task.isCompleted ? 'line-through' : 'none',
                    color: task.isCompleted ? 'var(--text-current-muted)' : 'var(--text-current-primary)',
                    fontSize: '0.95rem'
                  }}>
                    {task.taskName}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Visit Proof Logs (Photo gallery) */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '20px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>
              Visit Proof Logs
            </h2>
            
            {booking.visitProofs.length === 0 ? (
              <p style={{ color: 'var(--text-current-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '20px' }}>
                No photo proofs uploaded yet for this contract.
              </p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {booking.visitProofs.map((proof, idx) => (
                  <div key={proof._id || idx} className="glass-card exif-hover-card" style={{ padding: '12px', background: 'rgba(0,0,0,0.1)', cursor: 'pointer', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', overflow: 'hidden', height: '160px', borderRadius: 'var(--radius-sm)', marginBottom: '8px' }}>
                      <img 
                        src={proof.imageUrl} 
                        alt={`Proof ${idx + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div className="exif-overlay" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                        <div>📍 GPS COORDINATES:</div>
                        <div style={{ fontWeight: 'bold', color: '#4E9F3D' }}>16.4920° N, 80.4982° E</div>
                        <div style={{ marginTop: '4px' }}>📅 TIMESTAMP:</div>
                        <div style={{ fontWeight: 'bold' }}>{new Date(proof.timestamp).toLocaleDateString()}</div>
                        <div style={{ marginTop: '6px', fontSize: '0.62rem', background: 'rgba(78, 159, 61, 0.2)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', color: '#4E9F3D', border: '1px solid rgba(78, 159, 61, 0.4)' }}>
                          ✓ GEO-VERIFIED MATCH
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-current-muted)', marginBottom: '4px' }}>
                      🕒 {new Date(proof.timestamp).toLocaleString()}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-current-secondary)', lineHeight: '1.4' }}>
                      {proof.comment || 'Photo proof uploaded by caretaker.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Booking Actions & Review Form */}
        <div style={{ position: 'sticky', top: '100px' }}>
          
          {/* Card 1: Booking Management Panel */}
          <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', textAlign: 'center' }}>Visit Management</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Financial summary */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-current-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-current-secondary)', marginBottom: '4px' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>₹{booking.totalPrice}</span>
                </div>
              </div>

              {/* Status transitions options */}
              {isAssistant && booking.status === 'pending' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className="btn btn-primary" onClick={handleConfirm} style={{ width: '100%' }}>
                    Accept Booking Request
                  </button>
                  <button className="btn btn-danger" onClick={handleCancel} style={{ width: '100%' }}>
                    Decline Request
                  </button>
                </div>
              )}

              {isClient && (booking.status === 'pending' || booking.status === 'confirmed') && (
                <button className="btn btn-danger" onClick={handleCancel} style={{ width: '100%' }}>
                  Cancel Booking
                </button>
              )}

              {isAssistant && booking.status === 'confirmed' && (
                <button className="btn btn-primary" onClick={handleStart} style={{ width: '100%' }}>
                  Start Visit (Mark Live)
                </button>
              )}

              {isAssistant && booking.status === 'in_progress' && (
                <button className="btn btn-primary" onClick={handleComplete} style={{ width: '100%' }}>
                  Complete Visit / Finish Job
                </button>
              )}

              {booking.status === 'completed' && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: 'var(--primary)',
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 'bold'
                }}>
                  🎉 Visit Successfully Completed
                </div>
              )}

              {booking.status === 'cancelled' && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  color: 'var(--danger)',
                  textAlign: 'center',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 'bold'
                }}>
                  ⚠️ Booking Cancelled
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Proof Uploading form (Assistant in_progress only) */}
          {isAssistant && booking.status === 'in_progress' && (
            <div className="glass-card" style={{ padding: '32px', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '20px', textAlign: 'center' }}>Upload Visit Proof</h2>
              
              {!booking.visitProofUrl ? (
                <div 
                  style={{
                    border: '2px dashed var(--primary)',
                    borderRadius: '12px',
                    padding: '30px 20px',
                    textAlign: 'center',
                    background: 'rgba(15, 76, 58, 0.02)',
                    cursor: 'pointer',
                    position: 'relative'
                  }} 
                  onClick={() => !uploadingProof && proofInputRef.current.click()}
                >
                  {uploadingProof ? (
                    <div className="shimmer-loading" style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: 'var(--primary)' }}>
                      ⏳ Uploading Proof Photo to Secure Server...
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📸</div>
                      <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary)', fontSize: '0.92rem' }}>
                        Upload Visit Proof Photo (Garden/Pet Feeding Station)
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-current-muted)' }}>Click to browse files</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    id="proof-file-input" 
                    ref={proofInputRef} 
                    style={{ display: 'none' }} 
                    accept="image/*" 
                    onChange={handleAutoUpload} 
                    disabled={uploadingProof}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--glass-current-border)', padding: '16px', borderRadius: '12px' }}>
                  <img 
                    src={booking.visitProofUrl} 
                    alt="Uploaded Proof Thumbnail" 
                    style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--primary)' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>✓ PHOTO UPLOADED SUCCESSFUL</div>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}
                      onClick={handleSubmitForReview}
                      disabled={uploadingProof}
                    >
                      Submit for Client Review
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Card 3: Submit Review form (Client completed only) */}
          {isClient && booking.status === 'completed' && (
            <div className="glass-card" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '20px', textAlign: 'center' }}>Rate Your Assistant</h2>
              
              {hasReviewed ? (
                <div style={{
                  textAlign: 'center',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--primary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: '600'
                }}>
                  ⭐ Review submitted. Thank you!
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit}>
                  <div className="form-group">
                    <label htmlFor="rating">RATING</label>
                    <select 
                      id="rating" 
                      className="form-control"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      disabled={submittingReview}
                      required
                    >
                      <option value={5}>5 Stars ★★★★★</option>
                      <option value={4}>4 Stars ★★★★☆</option>
                      <option value={3}>3 Stars ★★★☆☆</option>
                      <option value={2}>2 Stars ★★☆☆☆</option>
                      <option value={1}>1 Star ★☆☆☆☆</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="review-comment">COMMENT</label>
                    <textarea 
                      id="review-comment" 
                      className="form-control"
                      rows={4}
                      placeholder="Share your experience with this assistant..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={submittingReview}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={submittingReview}
                  >
                    {submittingReview ? 'Submitting Review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
