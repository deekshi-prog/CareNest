import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, profile, updateProfile, uploadAvatar, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  // Assistant-specific states
  const [hourlyRate, setHourlyRate] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [availability, setAvailability] = useState([]);

  // Availability adder states
  const [newDay, setNewDay] = useState(1); // Monday
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');

  // UI state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
    if (profile) {
      setPhone(profile.phone || '');
      setAddress(profile.address || '');
      setBio(profile.bio || '');
      
      if (profile.location && profile.location.coordinates) {
        setLongitude(profile.location.coordinates[0]);
        setLatitude(profile.location.coordinates[1]);
      }

      if (user.role === 'assistant') {
        setHourlyRate(profile.hourlyRate || 0);
        setSelectedServices(profile.services || []);
        setAvailability(profile.availability || []);
      }
    }
  }, [user, profile]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatusMsg({ type: 'danger', text: 'Geolocation is not supported by your browser' });
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
        setStatusMsg({ type: 'success', text: 'Coordinates detected successfully!' });
      },
      (err) => {
        console.error(err);
        setIsLocating(false);
        setStatusMsg({ type: 'danger', text: 'Unable to detect location. Please input coordinates manually.' });
      }
    );
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await uploadAvatar(formData);
      setStatusMsg({ type: 'success', text: 'Profile picture updated successfully!' });
      refreshUser();
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Avatar upload failed' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleToggleService = (service) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleAddAvailability = (e) => {
    e.preventDefault();
    // Prevent duplicate days for simplicity or append timeslots
    const newAvail = { dayOfWeek: Number(newDay), startTime: newStart, endTime: newEnd };
    setAvailability([...availability, newAvail]);
  };

  const handleRemoveAvailability = (index) => {
    setAvailability(availability.filter((_, idx) => idx !== index));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const payload = {
        name,
        phone,
        address,
        bio,
        latitude,
        longitude,
      };

      if (user.role === 'assistant') {
        payload.services = selectedServices;
        payload.hourlyRate = hourlyRate;
        payload.availability = availability;
      }

      await updateProfile(payload);
      setStatusMsg({ type: 'success', text: 'Profile saved successfully!' });
    } catch (err) {
      setStatusMsg({ type: 'danger', text: err.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const serviceOptions = ['Plant Watering', 'Mail Retrieval', 'Pet Feeding', 'Pet Care', 'Gardening'];
  const daysOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in-up">
      <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Manage Profile</h1>
      <p style={{ color: 'var(--text-current-secondary)', marginBottom: '32px' }}>
        Update your personal details, contact coordinates, services and schedules.
      </p>

      {statusMsg.text && (
        <div style={{
          background: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          color: statusMsg.type === 'success' ? 'var(--primary)' : 'var(--danger)',
          padding: '16px',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '32px'
        }}>
          {statusMsg.type === 'success' ? '✓' : '⚠️'} {statusMsg.text}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2.2fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Left Side: Photo upload */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Profile Photo</h2>
          
          <div style={{ position: 'relative' }}>
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name}
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
            ) : (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(15, 76, 58, 0.08)',
                border: '3px solid var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                color: 'var(--primary)'
              }}>
                👤
              </div>
            )}
            {avatarLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                Uploading...
              </div>
            )}
          </div>

          <button 
            type="button"
            className="btn btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}
            onClick={() => fileInputRef.current.click()}
            disabled={avatarLoading}
          >
            Choose Photo
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            style={{ display: 'none' }} 
            onChange={handleAvatarChange}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-current-muted)' }}>
            Accepts JPG, PNG, WEBP (Max 5MB)
          </span>

          {user.role === 'assistant' && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: profile?.isVerified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
              border: `1px solid ${profile?.isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
              borderRadius: 'var(--radius-sm)',
              color: profile?.isVerified ? 'var(--primary)' : 'var(--warning)',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              width: '100%'
            }}>
              {profile?.isVerified ? '✓ VERIFIED CARETAKER' : '⌛ VERIFICATION PENDING'}
            </div>
          )}
        </div>

        {/* Right Side: Form details */}
        <div className="glass-card" style={{ padding: '32px' }}>
          <form onSubmit={handleSaveProfile}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>General Details</h2>
            
            <div className="form-group">
              <label htmlFor="display-name">DISPLAY NAME</label>
              <input 
                type="text" 
                id="display-name" 
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={profileLoading}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label htmlFor="phone">PHONE NUMBER</label>
                <input 
                  type="text" 
                  id="phone" 
                  className="form-control"
                  placeholder="e.g. 512-555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={profileLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="address">STREET ADDRESS</label>
                <input 
                  type="text" 
                  id="address" 
                  className="form-control"
                  placeholder="e.g. 1201 Congress Ave, Austin, TX"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={profileLoading}
                />
              </div>
            </div>

            {/* Geolocation Section */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--glass-current-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-secondary)' }}>
                  LOCATION COORDINATES (GEO MATCHING)
                </span>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleDetectLocation}
                  disabled={isLocating || profileLoading}
                  style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                >
                  {isLocating ? 'Detecting...' : 'Detect Coordinates'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="lat">LATITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    id="lat" 
                    className="form-control"
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    disabled={profileLoading}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="lng">LONGITUDE</label>
                  <input 
                    type="number" 
                    step="any"
                    id="lng" 
                    className="form-control"
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    disabled={profileLoading}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="bio">SHORT BIO / DETAILS</label>
              <textarea 
                id="bio" 
                className="form-control"
                rows={4}
                placeholder="Describe your property details, plant collections or caretaker experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={profileLoading}
              />
            </div>

            {/* Assistant Specific Form Elements */}
            {user.role === 'assistant' && (
              <div style={{ borderTop: '1px solid var(--glass-current-border)', paddingTop: '24px', marginTop: '24px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Caretaker Profile Details</h2>

                <div className="form-group">
                  <label htmlFor="rate">HOURLY SERVICE RATE (₹)</label>
                  <input 
                    type="number" 
                    id="rate" 
                    className="form-control"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    disabled={profileLoading}
                    min={0}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label>SERVICES OFFERED</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {serviceOptions.map((service) => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <label 
                          key={service} 
                          style={{
                            border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--glass-current-border)'}`,
                            background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                            padding: '10px 16px',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: isChecked ? 'var(--primary)' : 'var(--text-current-secondary)',
                            textTransform: 'none'
                          }}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={() => handleToggleService(service)}
                            style={{ display: 'none' }}
                          />
                          🌿 {service}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Availability Planner */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-secondary)', display: 'block', marginBottom: '8px' }}>
                    WEEKLY AVAILABILITY PLANNER
                  </label>
                  
                  {/* Current slots list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    {availability.map((avail, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--glass-current-border)' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                          📅 {daysOfWeekMap[avail.dayOfWeek]}: {avail.startTime} - {avail.endTime}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAvailability(idx)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-current-muted)', cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {availability.length === 0 && (
                      <span style={{ color: 'var(--text-current-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        No schedule slots set.
                      </span>
                    )}
                  </div>

                  {/* Add Slot Panel */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--glass-current-border)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ flex: 1.2, minWidth: '120px' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>DAY</label>
                      <select className="form-control" value={newDay} onChange={e => setNewDay(Number(e.target.value))} style={{ padding: '8px' }}>
                        {daysOfWeekMap.map((d, idx) => <option key={d} value={idx}>{d}</option>)}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: '90px' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>START</label>
                      <input type="time" className="form-control" value={newStart} onChange={e => setNewStart(e.target.value)} style={{ padding: '8px' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: '90px' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>END</label>
                      <input type="time" className="form-control" value={newEnd} onChange={e => setNewEnd(e.target.value)} style={{ padding: '8px' }} />
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleAddAvailability}
                      style={{ padding: '10px 16px', height: '40px', fontSize: '0.85rem' }}
                    >
                      Add Slot
                    </button>
                  </div>
                </div>

              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '14px', marginTop: '24px' }}
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
