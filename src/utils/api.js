import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    try {
      const rawStore = localStorage.getItem('kharcha-store');
      if (rawStore) {
        const parsed = JSON.parse(rawStore);
        const token = parsed?.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (err) {
      console.error('Error reading token from localStorage', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration/401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and auth info from localStorage
      try {
        const rawStore = localStorage.getItem('kharcha-store');
        if (rawStore) {
          const parsed = JSON.parse(rawStore);
          if (parsed?.state) {
            parsed.state.token = null;
            parsed.state.user = null;
            parsed.state.isAuthenticated = false;
            parsed.state.isPinVerified = false;
            localStorage.setItem('kharcha-store', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error('Error clearing auth state', err);
      }
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
