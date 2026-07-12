const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Core wrapper for HTTP requests to the backend API.
 * Handles header injection, token insertion, and error checking.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  // Set Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine content type
  // If sending FormData (like image uploads), do not set Content-Type header manually
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error(`API Error in ${endpoint}:`, error.message);
    throw error;
  }
}

// 1. Authentication & Profile Services
export const authService = {
  register: (name, email, password, role) =>
    request('/auth/register', {
      method: 'POST',
      body: { name, email, password, role },
    }),
  
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  
  getMe: () =>
    request('/auth/me', {
      method: 'GET',
    }),
  
  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: profileData,
    }),
  
  uploadAvatar: (formData) =>
    request('/auth/avatar', {
      method: 'POST',
      body: formData,
    }),
};

// 2. Assistant Profile Searching
export const assistantService = {
  search: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/assistants${queryString}`, { method: 'GET' });
  },
  
  getById: (userId) =>
    request(`/assistants/${userId}`, { method: 'GET' }),
};

// 3. Booking Management
export const bookingService = {
  create: (bookingData) =>
    request('/bookings', {
      method: 'POST',
      body: bookingData,
    }),
  
  getAll: () =>
    request('/bookings', { method: 'GET' }),
  
  getById: (id) =>
    request(`/bookings/${id}`, { method: 'GET' }),
  
  confirm: (id) =>
    request(`/bookings/${id}/confirm`, { method: 'PUT' }),
  
  cancel: (id) =>
    request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  
  start: (id, data) =>
    request(`/bookings/${id}/start`, { method: 'PUT', body: data }),
  
  updateTasks: (id, tasks) =>
    request(`/bookings/${id}/tasks`, {
      method: 'PUT',
      body: { tasks },
    }),
  
  uploadProof: (id, formData) =>
    request(`/bookings/${id}/proof`, {
      method: 'POST',
      body: formData,
    }),
  
  complete: (id, data) =>
    request(`/bookings/${id}/complete`, { method: 'PUT', body: data }),

  submitReview: (id) =>
    request(`/bookings/${id}/submit-review`, { method: 'PUT' }),

  clientConfirm: (id) =>
    request(`/bookings/${id}/client-confirm`, { method: 'PUT' }),

  clientDispute: (id, disputeFeedback) =>
    request(`/bookings/${id}/client-dispute`, {
      method: 'PUT',
      body: { disputeFeedback },
    }),
};

// 4. Client Review Submission
export const reviewService = {
  submit: (reviewData) =>
    request('/reviews', {
      method: 'POST',
      body: reviewData,
    }),
  
  getForAssistant: (assistantId) =>
    request(`/reviews/assistant/${assistantId}`, { method: 'GET' }),
};

// 5. Admin Dashboard APIs
export const adminService = {
  getMetrics: () =>
    request('/admin/metrics', { method: 'GET' }),
  
  getPendingAssistants: () =>
    request('/admin/pending-assistants', { method: 'GET' }),
  
  verifyAssistant: (assistantId) =>
    request(`/admin/verify/${assistantId}`, { method: 'PUT' }),

  disputeBooking: (bookingId) =>
    request(`/admin/bookings/${bookingId}/dispute`, { method: 'PUT' }),

  refundBooking: (bookingId) =>
    request(`/admin/bookings/${bookingId}/refund`, { method: 'PUT' }),
};
