import axios from 'axios';

const API_BASE_URL = 'https://future-makers-market-backend.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token header to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login, clear token)
      // For now, we might just want to let the component handle it or clear local storage
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('currentUser');
    }
    return Promise.reject(error);
  }
);

export default api;