import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    
    if (error.response?.status === 403) {
     
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  verifyToken: () => api.get('/auth/verify'),
};

export const userAPI = {
  getAllUsers: (params = {}) => api.get('/users', { params }),
  getUserStats: () => api.get('/users/stats'),
  createUser: (userData) => api.post('/users', userData),
  getUserById: (id) => api.get(`/users/${id}`),
  updatePassword: (passwordData) => api.put('/users/password', passwordData),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const storeAPI = {
  getAllStores: (params = {}) => api.get('/stores', { params }),
  getStoresForAdmin: (params = {}) => api.get('/stores/admin', { params }),
  getStoreStats: () => api.get('/stores/stats'),
  createStore: (storeData) => api.post('/stores', storeData),
  getStoreById: (id) => api.get(`/stores/${id}`),
  getStoreRatings: (storeId) => api.get(`/stores/${storeId}/ratings`),
  updateStore: (id, storeData) => api.put(`/stores/${id}`, storeData),
  deleteStore: (id) => api.delete(`/stores/${id}`),
};

export const ratingAPI = {
  submitRating: (ratingData) => api.post('/ratings', ratingData),
  getAllRatings: (params = {}) => api.get('/ratings', { params }),
  getRatingStats: () => api.get('/ratings/stats'),
  getUserRatings: (params = {}) => api.get('/ratings/user', { params }),
  getStoreRatings: (storeId, params = {}) => api.get(`/ratings/store/${storeId}`, { params }),
  getUserRating: (storeId) => api.get(`/ratings/user/${storeId}`),
  updateRating: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
};

// Utility functions
export const handleAPIError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.errors) {
    return error.response.data.errors.join(', ');
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

export const isNetworkError = (error) => {
  return !error.response && error.code === 'NETWORK_ERROR';
};

export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED';
};

export default api;