import axios from 'axios';

// Create a pre-configured Axios instance pointing to the AyushBridge Backend API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to dynamically inject authorization tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle standard API error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.response?.data?.message || 'An unexpected error occurred';
    // Handle unauthorized states
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Force page reload to trigger route redirection
      window.location.href = '/login';
    }
    return Promise.reject(new Error(message));
  }
);

export default api;

