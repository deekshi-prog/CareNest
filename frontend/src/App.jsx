import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Explore from './pages/Explore';
import AssistantDetail from './pages/AssistantDetail';
import BookingsList from './pages/BookingsList';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// CSS Leaflet Map stylesheet imports
import 'leaflet/dist/leaflet.css';

// Route guards to protect pages depending on auth state
function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <h3>Loading page...</h3>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container" style={{ background: 'var(--bg-current-primary)', minHeight: '100vh', position: 'relative' }}>
          <Navbar />
          <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/explore" element={<Explore />} />
              <Route path="/assistant/:userId" element={<AssistantDetail />} />

              {/* Private Client & Assistant Routes */}
              <Route 
                path="/bookings" 
                element={
                  <PrivateRoute allowedRoles={['client', 'admin']}>
                    <BookingsList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/assistant-dashboard" 
                element={
                  <PrivateRoute allowedRoles={['assistant', 'admin']}>
                    <BookingsList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/booking/:id" 
                element={
                  <PrivateRoute>
                    <BookingDetails />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } 
              />

              {/* Admin Protected Dashboard Route */}
              <Route 
                path="/admin-dashboard" 
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </PrivateRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
