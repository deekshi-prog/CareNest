import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authService.getMe();
      if (response.success) {
        setUser(response.user);
        setProfile(response.profile);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to load user info:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        
        // Fetch full profile info
        const meResponse = await authService.getMe();
        if (meResponse.success) {
          setProfile(meResponse.profile);
        }
        return response;
      }
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(name, email, password, role);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        
        const meResponse = await authService.getMe();
        if (meResponse.success) {
          setProfile(meResponse.profile);
        }
        return response;
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProfile(null);
    setError(null);
  };

  const updateProfileState = async (updatedFields) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(updatedFields);
      if (response.success) {
        setProfile(response.profile);
        setUser(response.user);
        return response;
      }
    } catch (err) {
      setError(err.message || 'Profile update failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatarState = async (formData) => {
    try {
      const response = await authService.uploadAvatar(formData);
      if (response.success) {
        setUser(response.user);
        return response.avatar;
      }
    } catch (err) {
      setError(err.message || 'Avatar upload failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile: updateProfileState,
        uploadAvatar: updateAvatarState,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
