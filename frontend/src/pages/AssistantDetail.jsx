import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { assistantService, bookingService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AssistantDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assistant, setAssistant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Booking Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customTask, setCustomTask] = useState('');
  const [tasks, setTasks] = useState([
    { name: 'Plant Watering', checked: true },
    { name: 'Mail Retrieval', checked: false },
    { name: 'Gardening', checked: false },
    { name: 'Pet Feeding', checked: false },
    { name: 'Pet Care', checked: false },
  ]);
  const [petCareHours, setPetCareHours] = useState(5);
  const [wateringFrequency, setWateringFrequency] = useState(1);
  const [feedingFrequency, setFeedingFrequency] = useState(1);
  const [petName, setPetName] = useState('');
  const [petFoodType, setPetFoodType] = useState('');
  const [petFoodName, setPetFoodName] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchAssistantDetails();
  }, [userId]);

  const fetchAssistantDetails = async () => {
    setLoading(true);
    try {
      const response = await assistantService.getById(userId);
      if (response.success) {
        setAssistant(response.data.profile);
        // Include user details like name/avatar
        setAssistant((prev) => ({
          ...prev,
          name: response.data.name,
          email: response.data.email,
          avatar: response.data.avatar,
          userId: response.data.userId,
        }));
        setReviews(response.data.reviews || []);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].checked = !newTasks[index].checked;
    setTasks(newTasks);
  };

  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!customTask.trim()) return;
    setTasks([...tasks, { name: customTask.trim(), checked: true }]);
    setCustomTask('');
  };

  const handleRemoveTask = (index) => {
    setTasks(tasks.filter((_, idx) => idx !== index));
  };

  // Calculate booking cost based on selected task rates and frequencies
  const calculateTotalCost = () => {
    if (!startDate || !endDate || !assistant) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive

    let dailySum = 0;
    tasks.forEach(t => {
      if (t.checked) {
        if (t.name === 'Plant Watering') {
          dailySum += wateringFrequency * 60;
        } else if (t.name === 'Gardening') {
          dailySum += 250;
        } else if (t.name === 'Pet Feeding') {
          const feedingRates = { 1: 70, 2: 130, 3: 210 };
          dailySum += feedingRates[feedingFrequency] || 70;
        } else if (t.name === 'Pet Care') {
          dailySum += petCareHours * 50;
        } else {
          dailySum += 80; // default (e.g. Mail Retrieval, Custom)
        }
      }
    });

    return diffDays * dailySum;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startDate || !endDate) {
      setErrorMsg('Please select start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date');
      return;
    }

    const selectedTaskNames = tasks.filter((t) => t.checked).map((t) => {
      if (t.name === 'Plant Watering') {
        const freqText = wateringFrequency === 1 ? 'Once a day' : wateringFrequency === 2 ? 'Twice a day' : 'Thrice a day';
        return `Plant Watering (${freqText})`;
      }
      if (t.name === 'Pet Feeding') {
        const freqText = feedingFrequency === 1 ? 'Once a day' : feedingFrequency === 2 ? 'Twice a day' : 'Thrice a day';
        return `Pet Feeding (${freqText} - Pet Name: ${petName || 'N/A'}, Food Type: ${petFoodType || 'N/A'}, Food Name: ${petFoodName || 'N/A'})`;
      }
      if (t.name === 'Pet Care') {
        return `Pet Care (${petCareHours} hours/day)`;
      }
      return t.name;
    });

    if (selectedTaskNames.length === 0) {
      setErrorMsg('Please select at least one task for the checklist');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        assistantId: assistant.userId,
        startDate,
        endDate,
        totalPrice: calculateTotalCost(),
        tasks: selectedTaskNames,
      };

      const response = await bookingService.create(bookingData);
      if (response.success) {
        setBookingSuccess(true);
        setTimeout(() => {
          navigate('/bookings');
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <h3>Loading profile details...</h3>
      </div>
    );
  }

  if (errorMsg && !assistant) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h3>Error Loading Profile</h3>
        <p style={{ color: 'var(--danger)' }}>{errorMsg}</p>
        <Link to="/explore" className="btn btn-secondary">Back to Explore</Link>
      </div>
    );
  }

  const daysOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in-up">
      <div style={{ marginBottom: '24px' }}>
        <Link to="/explore" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>← Back to Explore</Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Column: Assistant Information */}
        <div>
          {/* Profile Header */}
          <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '32px' }}>
            {assistant.avatar ? (
              <img 
                src={assistant.avatar} 
                alt={assistant.name}
                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(15, 76, 58, 0.08)',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                color: 'var(--primary)',
                flexShrink: 0
              }}>
                👤
              </div>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '2rem', margin: 0 }}>{assistant.name}</h1>
                <span style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontWeight: 'bold',
                  letterSpacing: '0.05em'
                }}>
                  ✓ VERIFIED CARETAKER
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.95rem', margin: '8px 0', color: 'var(--text-current-secondary)' }}>
                <span>⭐ {assistant.averageRating > 0 ? `${assistant.averageRating} (${assistant.totalReviews} Reviews)` : 'No Reviews yet'}</span>
                <span>📍 {assistant.address || 'Austin, TX'}</span>
              </div>


            </div>
          </div>

          {/* Service Price Sheet Card */}
          <div className="glass-card" style={{ marginBottom: '32px', background: '#FFFFFF', border: '1px solid rgba(15, 76, 58, 0.1)', padding: '28px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#0F4C3A', marginBottom: '16px', borderBottom: '1px solid rgba(15, 76, 58, 0.1)', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Activity Rates Sheet
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
              FloraCare Carenest standard flat rates per day/visit for verified services:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { name: 'Plant Watering', rate: '₹60 / watering', icon: '💧' },
                { name: 'Gardening', rate: '₹250 / day', icon: '🌿' },
                { name: 'Pet Feeding', rate: '₹70 - ₹210 / day', icon: '🍖' },
                { name: 'Pet Care', rate: '₹50 / hour', icon: '🐾' },
                { name: 'Mail Retrieval', rate: '₹80 / day', icon: '✉️' }
              ].map((act) => (
                <div key={act.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 0, 0, 0.03)', padding: '12px 16px', borderRadius: '10px', border: '1px solid rgba(0, 0, 0, 0.02)' }}>
                  <span style={{ fontSize: '0.88rem', color: '#1E293B', fontWeight: '500' }}>
                    {act.icon} {act.name}
                  </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#0F4C3A' }}>
                    {act.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* About Bio */}
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>About Me</h2>
            <p style={{ color: 'var(--text-current-secondary)', lineHeight: '1.7', fontSize: '0.98rem' }}>
              {assistant.bio || 'This assistant has not provided a detailed bio yet.'}
            </p>
          </div>

          {/* Services Provided */}
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>Services Offered</h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {assistant.services && assistant.services.map((s) => (
                <span key={s} style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: 'var(--primary)'
                }}>
                  🌿 {s}
                </span>
              ))}
            </div>
          </div>

          {/* Weekly Availability */}
          <div className="glass-card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '16px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>Weekly Availability</h2>
            {assistant.availability && assistant.availability.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                {assistant.availability.map((avail, index) => (
                  <div key={index} style={{
                    background: 'rgba(0,0,0,0.1)',
                    border: '1px solid var(--glass-current-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '12px',
                    fontSize: '0.9rem'
                  }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--primary)', marginBottom: '4px' }}>
                      {daysOfWeekMap[avail.dayOfWeek]}
                    </div>
                    <div style={{ color: 'var(--text-current-secondary)' }}>
                      🕒 {avail.startTime} - {avail.endTime}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-current-secondary)' }}>No specific schedule provided. Message assistant to coordinate.</p>
            )}
          </div>

          {/* Reviews List */}
          <div className="glass-card">
            <h2 style={{ fontSize: '1.35rem', marginBottom: '24px', borderBottom: '1px solid var(--glass-current-border)', paddingBottom: '8px' }}>
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--text-current-secondary)' }}>No reviews yet for this assistant.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{
                    borderBottom: '1px solid var(--glass-current-border)',
                    paddingBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={review.clientAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={review.clientName}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span style={{ fontWeight: 'bold' }}>{review.clientName}</span>
                      </div>
                      <div style={{ color: 'var(--accent)', fontSize: '0.9rem' }}>
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-current-secondary)', margin: 0, fontSize: '0.92rem', lineHeight: '1.6' }}>
                      "{review.comment}"
                    </p>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-current-muted)' }}>
                      Submitted on {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Booking Request Widget */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '24px', textAlign: 'center' }}>Request a Visit</h2>
            
            {bookingSuccess ? (
              <div style={{
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: 'var(--primary)',
                padding: '24px',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎉</div>
                <h3>Request Sent Successfully!</h3>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>Redirecting to your bookings dashboard...</p>
              </div>
            ) : !user ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ color: 'var(--text-current-secondary)', marginBottom: '20px' }}>
                  Please sign in or create an account to book this caretaker.
                </p>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>Sign In to Book</Link>
              </div>
            ) : user.role === 'assistant' ? (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-current-border)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-current-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  You are logged in as an Assistant. Only Clients can submit visit booking requests.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                {errorMsg && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '0.88rem' }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Date selections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="startDate" style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>START DATE</label>
                    <input 
                      type="date" 
                      id="startDate" 
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={bookingLoading}
                      required
                      style={{ height: '45px', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '0 14px', background: '#FFFFFF', color: '#1E293B' }}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="endDate" style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>END DATE</label>
                    <input 
                      type="date" 
                      id="endDate" 
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={bookingLoading}
                      required
                      style={{ height: '45px', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '0 14px', background: '#FFFFFF', color: '#1E293B' }}
                    />
                  </div>
                </div>

                {/* Checklist Customization */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '10px' }}>
                    VISIT TASKS CHECKLIST
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {tasks.map((task, idx) => (
                      <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.05)',
                          borderRadius: '10px',
                          padding: '14px 16px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          border: '1px solid rgba(0, 0, 0, 0.02)'
                        }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', margin: 0, textTransform: 'none', fontSize: '0.9rem', color: '#1E293B', fontWeight: '500' }}>
                            <input 
                              type="checkbox" 
                              checked={task.checked} 
                              onChange={() => handleToggleTask(idx)}
                              disabled={bookingLoading}
                              style={{ width: '16px', height: '16px', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <span>
                              {task.name === 'Pet Care' ? '🐾 Pet Care' : task.name === 'Pet Feeding' ? '🍖 Pet Feeding' : task.name === 'Plant Watering' ? '💧 Plant Watering' : task.name} (₹{ { 'Plant Watering': '60/watering', 'Gardening': '250/day', 'Pet Feeding': '70/visit', 'Pet Care': '50/hour', 'Mail Retrieval': '80/day' }[task.name] || '80/day' })
                            </span>
                          </label>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTask(idx)}
                            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1rem', padding: '2px 6px' }}
                            disabled={bookingLoading}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Plant Watering Frequency Selector */}
                        {task.name === 'Plant Watering' && task.checked && (
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: '3px solid #2A9D8F', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
                              Select Watering Frequency
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                              {[1, 2, 3].map((f) => {
                                const text = f === 1 ? 'Once a day (₹60)' : f === 2 ? 'Twice (₹120)' : 'Thrice (₹180)';
                                const isActive = wateringFrequency === f;
                                return (
                                  <button
                                    key={f}
                                    type="button"
                                    onClick={() => setWateringFrequency(f)}
                                    disabled={bookingLoading}
                                    style={{
                                      flex: 1,
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      fontSize: '0.78rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      border: `1px solid ${isActive ? 'var(--primary)' : 'rgba(0,0,0,0.08)'}`,
                                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : '#FFFFFF',
                                      color: isActive ? 'var(--primary)' : '#475569',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {text}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Pet Care Duration Selector */}
                        {task.name === 'Pet Care' && task.checked && (
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: '3px solid #2A9D8F', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
                              Care Hours Required (₹50/hour)
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                              <button
                                type="button"
                                onClick={() => setPetCareHours(Math.max(1, petCareHours - 1))}
                                disabled={bookingLoading}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  background: '#FFFFFF',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                -
                              </button>
                              <span style={{ fontSize: '1.02rem', fontWeight: 'bold', color: '#1E293B', minWidth: '70px', textAlign: 'center' }}>
                                {petCareHours} hours
                              </span>
                              <button
                                type="button"
                                onClick={() => setPetCareHours(Math.min(24, petCareHours + 1))}
                                disabled={bookingLoading}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  border: '1px solid rgba(0,0,0,0.08)',
                                  background: '#FFFFFF',
                                  fontSize: '1.2rem',
                                  fontWeight: 'bold',
                                  color: '#475569',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                +
                              </button>
                              <span style={{ fontSize: '0.82rem', color: '#64748B', marginLeft: 'auto', fontWeight: '600' }}>
                                (₹{petCareHours * 50}/day total)
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Pet Feeding details & Frequency */}
                        {task.name === 'Pet Feeding' && task.checked && (
                          <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', borderLeft: '3px solid #2A9D8F', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>
                              Select Feeding Frequency
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px', marginBottom: '4px' }}>
                              {[1, 2, 3].map((f) => {
                                const text = f === 1 ? 'Once (₹70)' : f === 2 ? 'Twice (₹130)' : 'Thrice (₹210)';
                                const isActive = feedingFrequency === f;
                                return (
                                  <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFeedingFrequency(f)}
                                    disabled={bookingLoading}
                                    style={{
                                      flex: 1,
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      fontSize: '0.78rem',
                                      fontWeight: '600',
                                      cursor: 'pointer',
                                      border: `1px solid ${isActive ? 'var(--primary)' : 'rgba(0,0,0,0.08)'}`,
                                      background: isActive ? 'rgba(16, 185, 129, 0.08)' : '#FFFFFF',
                                      color: isActive ? 'var(--primary)' : '#475569',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    {text}
                                  </button>
                                );
                              })}
                            </div>

                            <label style={{ fontSize: '0.68rem', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginTop: '6px' }}>
                              Feeding Instructions
                            </label>
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Pet Name (e.g. Bruno)" 
                              value={petName} 
                              onChange={(e) => setPetName(e.target.value)}
                              disabled={bookingLoading}
                              style={{ height: '35px', padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Food Type (e.g. Dry Food)" 
                                value={petFoodType} 
                                onChange={(e) => setPetFoodType(e.target.value)}
                                disabled={bookingLoading}
                                style={{ height: '35px', padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px' }}
                              />
                              <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Food Name (e.g. Royal Canin)" 
                                value={petFoodName} 
                                onChange={(e) => setPetFoodName(e.target.value)}
                                disabled={bookingLoading}
                                style={{ height: '35px', padding: '4px 8px', fontSize: '0.85rem', borderRadius: '6px' }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Custom Task */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Add custom task (e.g. Feed fish)"
                      value={customTask}
                      onChange={(e) => setCustomTask(e.target.value)}
                      disabled={bookingLoading}
                      style={{ height: '42px', borderRadius: '10px', border: '1px solid #E2E8F0', padding: '0 14px' }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleAddCustomTask}
                      style={{ padding: '8px 24px', borderRadius: '10px', height: '42px', fontWeight: 'bold' }}
                      disabled={bookingLoading}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Estimate Summary */}
                {startDate && endDate && (
                  <div style={{
                    background: 'rgba(15, 76, 58, 0.04)',
                    border: '1px solid rgba(15, 76, 58, 0.08)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '24px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
                      <span>Base Rate:</span>
                      <span style={{ fontWeight: '500' }}>₹{assistant.hourlyRate}/hr</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: '#475569', marginBottom: '8px' }}>
                      <span>Duration:</span>
                      <span style={{ fontWeight: '500' }}>
                        {Math.ceil(Math.abs(new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} visits
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 'bold', borderTop: '1px solid rgba(15, 76, 58, 0.08)', paddingTop: '8px', marginTop: '8px' }}>
                      <span>Total Estimated Cost:</span>
                      <span style={{ color: '#0F4C3A' }}>₹{calculateTotalCost()}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '14px', background: '#07825E', border: 'none', borderRadius: '100px', fontWeight: 'bold', fontSize: '1rem', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(7, 130, 94, 0.2)' }}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
