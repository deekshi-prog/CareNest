import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [pendingAssistants, setPendingAssistants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const responseMetrics = await adminService.getMetrics();
      if (responseMetrics.success) {
        setMetrics(responseMetrics.data.metrics);
        setRecentBookings(responseMetrics.data.recentBookings || []);
      }

      const responsePending = await adminService.getPendingAssistants();
      if (responsePending.success) {
        setPendingAssistants(responsePending.data);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to retrieve admin details');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (assistantId) => {
    if (!window.confirm('Verify this assistant profile? They will immediately appear in search results.')) return;

    try {
      const response = await adminService.verifyAssistant(assistantId);
      if (response.success) {
        // Remove verified assistant from local pending list
        setPendingAssistants(pendingAssistants.filter((a) => a.userId?._id !== assistantId));
        // Refresh metrics values
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to verify assistant');
    }
  };

  const handleDispute = async (bookingId) => {
    if (!window.confirm('Dispute this booking? This will flag the visit log and lock the payment escrow.')) return;
    try {
      const response = await adminService.disputeBooking(bookingId);
      if (response.success) {
        alert(response.message || 'Booking disputed and payouts locked.');
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to flag dispute');
    }
  };

  const handleRefund = async (bookingId) => {
    if (!window.confirm('Are you sure you want to issue a full refund to the client? This cannot be undone.')) return;
    try {
      const response = await adminService.refundBooking(bookingId);
      if (response.success) {
        alert(response.message || 'Transaction refunded successfully.');
        fetchAdminData();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process refund');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <h3>Loading administrator dashboard...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }} className="animate-fade-in-up">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Administrative Dashboard</h1>
        <p style={{ color: 'var(--text-current-secondary)' }}>
          Oversee booking transactions, review platform analytics, and approve caretaker verification requests.
        </p>
      </div>

      {errorMsg && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '32px' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Metrics Counters Grid */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          <div className="glass-card" style={{ padding: '24px', background: 'rgba(15, 76, 58, 0.05)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-muted)', letterSpacing: '0.05em' }}>
              PLATFORM COMMISSION (15%)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginTop: '8px' }}>
              ${metrics.platformCommission || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-current-secondary)' }}>Revenue generated from completed jobs</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-muted)', letterSpacing: '0.05em' }}>
              CARETAKER EARNINGS (85%)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)', marginTop: '8px' }}>
              ${metrics.assistantEarnings || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-current-secondary)' }}>Paid out to local caretakers</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-muted)', letterSpacing: '0.05em' }}>
              ESCROW LOCKED PAYOUTS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', marginTop: '8px' }}>
              ${metrics.pendingPayouts || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-current-secondary)' }}>Confirmed or active contract volume</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-muted)', letterSpacing: '0.05em' }}>
              ACTIVE WEBSOCKETS
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#3182ce', marginTop: '8px' }}>
              {metrics.activeSockets || 0}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-current-secondary)' }}>Live real-time client socket feeds</span>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-current-muted)', letterSpacing: '0.05em' }}>
              API SYSTEM ERROR RATE
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--danger)', marginTop: '8px' }}>
              {(metrics.errorRate * 100).toFixed(1)}%
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-current-secondary)' }}>Platform health monitor (last 24h)</span>
          </div>
        </div>
      )}

      {/* Main Splitscreen Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Verification Queue */}
        <div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '24px' }}>
            Assistant Verification Queue ({pendingAssistants.length})
          </h2>
          
          {pendingAssistants.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-current-secondary)' }}>
              No assistants currently awaiting verification.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {pendingAssistants.map((ast) => (
                <div key={ast._id} className="glass-card" style={{ display: 'flex', gap: '20px', padding: '24px' }}>
                  <img 
                    src={ast.userId?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={ast.userId?.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{ast.userId?.name}</h3>
                      <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>${ast.hourlyRate}/hr</div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-current-muted)' }}>{ast.userId?.email}</span>
                    
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-current-secondary)', margin: '8px 0 16px 0' }}>
                      {ast.bio || 'No bio provided.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {/* Services list */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {ast.services.map(s => (
                          <span key={s} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '4px', border: '1px solid var(--glass-current-border)' }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleVerify(ast.userId?._id)}
                        style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                      >
                        Verify & Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Platform Bookings Audit Log */}
        <div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '24px' }}>Recent Booking Transactions</h2>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.1)' }}>
            {recentBookings.length === 0 ? (
              <p style={{ color: 'var(--text-current-secondary)', textAlign: 'center', margin: 0, padding: '20px' }}>
                No bookings made yet on the platform.
              </p>
            ) : (
              recentBookings.map((b) => (
                <div key={b._id} style={{
                  borderBottom: '1px solid var(--glass-current-border)',
                  paddingBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.92rem' }}>
                      {b.clientId?.name || 'Client'} ➜ {b.assistantId?.name || 'Caretaker'}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-current-muted)' }}>
                      Status: <span style={{
                        color: b.status === 'completed' ? 'var(--secondary)' : b.status === 'cancelled' ? 'var(--danger)' : 'orange',
                        fontWeight: '600'
                      }}>{b.status.toUpperCase()}</span>
                    </span>
                    {b.status !== 'cancelled' && b.status !== 'completed' && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleDispute(b._id)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            background: 'rgba(237, 137, 54, 0.1)',
                            border: '1px solid rgb(237, 137, 54)',
                            color: 'rgb(237, 137, 54)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Lock & Dispute
                        </button>
                        <button
                          onClick={() => handleRefund(b._id)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.7rem',
                            background: 'rgba(229, 62, 62, 0.1)',
                            border: '1px solid rgb(229, 62, 62)',
                            color: 'rgb(229, 62, 62)',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Refund Client
                        </button>
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary)', fontSize: '1.1rem' }}>
                    ${b.totalPrice}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
